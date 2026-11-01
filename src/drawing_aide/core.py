"""Shared helpers: colour conversion, palettes, noise, blur, canvas sizing, result type."""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Optional

import numpy as np
from PIL import Image, ImageOps


# ------------------------------------------------------------------ result
@dataclass
class Result:
    image: Image.Image                     # the rendered painting
    palette: Optional[np.ndarray] = None   # (k, 3) uint8 RGB, numbered dark -> light
    counts: Optional[list] = None          # how many blocks / planes use each palette colour
    count_unit: str = "blocks"
    grid: Optional[np.ndarray] = None      # (rows, cols) palette index per block, -1 = unpainted
    info: dict = field(default_factory=dict)


@dataclass
class Settings:
    style: str = "blocks"
    size: Optional[float] = None           # block size in inches (blocks) or 1-10 shape size (others)
    canvas_cm: tuple = (100.0, 120.0)      # width, height
    orientation: str = "auto"              # auto (match photo) | fixed
    colors: int = 24
    ground: str = "pink"                   # pink | white | charcoal | any #hex
    subject_only: bool = False             # blocks: leave plain background unpainted
    jitter: float = 1.0                    # per-block colour variance
    impasto: float = 1.0                   # paint relief strength
    max_px: int = 1600                     # long side of the render (blocks use ppi instead)
    ppi: int = 64                          # blocks: render pixels per inch
    seed: int = 7


GROUNDS = {"pink": "#efbcc8", "white": "#f1f0ec", "charcoal": "#2a2a2a"}


def ground_rgb(name: str) -> np.ndarray:
    h = GROUNDS.get(name, name).lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


# ------------------------------------------------------------------ colour
_M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
_MI = np.array([[3.2406, -1.5372, -0.4986], [-0.9689, 1.8758, 0.0415], [0.0557, -0.2040, 1.0570]])
_WHITE = np.array([0.95047, 1.0, 1.08883])


def srgb_to_lab(rgb) -> np.ndarray:
    c = np.asarray(rgb, np.float64) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    xyz = c @ _M.T / _WHITE
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def lab_to_srgb(lab) -> np.ndarray:
    lab = np.asarray(lab, np.float64)
    fy = (lab[..., 0] + 16) / 116
    f = np.stack([fy + lab[..., 1] / 500, fy, fy - lab[..., 2] / 200], -1)
    xyz = np.where(f ** 3 > 0.008856, f ** 3, (f - 16 / 116) / 7.787) * _WHITE
    c = np.clip(xyz @ _MI.T, 0, 1)
    c = np.where(c <= 0.0031308, 12.92 * c, 1.055 * c ** (1 / 2.4) - 0.055)
    return np.clip(c * 255, 0, 255)


def is_skin(lab) -> np.ndarray:
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    h = np.degrees(np.arctan2(b, a))
    C = np.hypot(a, b)
    return (h > 20) & (h < 75) & (C > 8) & (C < 55) & (L > 25)


def painterly(lab, desaturate=0.9, warmth=1.5) -> np.ndarray:
    """Mute non-skin colours a little, warm them slightly, keep off pure black/white."""
    lab = np.array(lab, np.float64, copy=True)
    skin = is_skin(lab)
    k = np.where(skin, 1.0, desaturate)
    lab[..., 1] *= k
    lab[..., 2] = lab[..., 2] * k + warmth * (~skin)
    lab[..., 0] = 6 + lab[..., 0] * 0.92
    return lab


def kmeans(X: np.ndarray, k: int, rng: np.random.Generator, iters: int = 40):
    X = np.asarray(X, np.float64)
    k = max(1, min(k, len(np.unique(X.round(1), axis=0))))
    C = [X[rng.integers(len(X))]]
    for _ in range(1, k):  # k-means++ seeding
        d = np.min(((X[:, None] - np.array(C)[None]) ** 2).sum(-1), 1)
        C.append(X[rng.choice(len(X), p=d / d.sum())] if d.sum() > 0 else X[rng.integers(len(X))])
    C = np.array(C)
    for _ in range(iters):
        lbl = np.argmin(((X[:, None] - C[None]) ** 2).sum(-1), 1)
        new = np.array([X[lbl == j].mean(0) if (lbl == j).any() else C[j] for j in range(len(C))])
        if np.allclose(new, C, atol=0.05):
            C = new
            break
        C = new
    lbl = np.argmin(((X[:, None] - C[None]) ** 2).sum(-1), 1)
    return C, lbl


def palette_from(labs, k, rng, desaturate=0.9, warmth=1.5):
    """Painterly k-means palette in Lab, renumbered dark -> light. Returns (centres_lab, labels)."""
    X = painterly(labs, desaturate, warmth)
    if len(X) > 6000:  # fit on a sample, then assign everything
        C, _ = kmeans(X[rng.choice(len(X), 6000, replace=False)], k, rng)
        lbl = np.argmin(((X[:, None] - C[None]) ** 2).sum(-1), 1)
    else:
        C, lbl = kmeans(X, k, rng)
    order = np.argsort(C[:, 0])
    remap = np.empty_like(order)
    remap[order] = np.arange(len(order))
    return C[order], remap[lbl]


# ------------------------------------------------------------------ noise / blur
def blur(a: np.ndarray, r: float, passes: int = 3) -> np.ndarray:
    """Approximate gaussian via repeated separable box blurs (edge-clamped)."""
    r = int(max(1, round(r)))
    out = np.asarray(a, np.float32)
    for ax in (0, 1):
        for _ in range(passes):
            pad = [(0, 0)] * out.ndim
            pad[ax] = (r + 1, r)
            cs = np.cumsum(np.pad(out, pad, mode="edge"), axis=ax)
            hi = [slice(None)] * out.ndim
            lo = [slice(None)] * out.ndim
            hi[ax] = slice(2 * r + 1, None)
            lo[ax] = slice(0, -2 * r - 1)
            out = (cs[tuple(hi)] - cs[tuple(lo)]) / (2 * r + 1)
    return out


def noise1d(n: int, spacing: float, rng: np.random.Generator) -> np.ndarray:
    m = int(n / spacing) + 3
    pts = rng.standard_normal(m)
    x = np.arange(n) / spacing
    i = np.floor(x).astype(int)
    t = x - i
    t = t * t * (3 - 2 * t)
    return pts[i] * (1 - t) + pts[i + 1] * t


def noise2d(h: int, w: int, spacing: float, rng: np.random.Generator) -> np.ndarray:
    gh, gw = int(h / spacing) + 3, int(w / spacing) + 3
    g = rng.standard_normal((gh, gw)).astype(np.float32)
    img = Image.fromarray(g, "F").resize((int(gw * spacing), int(gh * spacing)), Image.BICUBIC)
    return np.asarray(img)[:h, :w]


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def paper_texture(rgb: np.ndarray, rng: np.random.Generator, amount: float) -> np.ndarray:
    h, w = rgb.shape[:2]
    n = blur(rng.random((h, w)).astype(np.float32) - 0.5, 1, 1) * amount * 60
    n = n + (rng.random((h, w)) - 0.5) * amount * 8
    return rgb + n[..., None]


# ------------------------------------------------------------------ canvas
def load_image(path) -> Image.Image:
    return ImageOps.exif_transpose(Image.open(path)).convert("RGB")


def canvas_dims(img: Image.Image, s: Settings):
    W, H = s.canvas_cm
    if s.orientation == "auto" and (img.width > img.height) != (W > H):
        W, H = H, W
    return float(W), float(H)


def crop_to(img: Image.Image, aspect: float) -> Image.Image:
    w, h = img.size
    if w / h > aspect:
        nw = int(round(h * aspect))
        x0 = (w - nw) // 2
        return img.crop((x0, 0, x0 + nw, h))
    nh = int(round(w / aspect))
    y0 = (h - nh) // 2
    return img.crop((0, y0, w, y0 + nh))


def out_size(img: Image.Image, s: Settings):
    Wcm, Hcm = canvas_dims(img, s)
    k = s.max_px / max(Wcm, Hcm)
    return int(round(Wcm * k)), int(round(Hcm * k)), Wcm, Hcm


def to_image(rgb: np.ndarray) -> Image.Image:
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))


def fmt_cm(v: float) -> str:
    return f"{v:g}"


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


__all__ = [n for n in dir() if not n.startswith("_")] + ["math"]
