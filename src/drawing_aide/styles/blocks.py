"""Block impasto: the photo as a grid of 1-inch palette-knife blocks on a gridded ground."""
from __future__ import annotations

import math

import numpy as np
from PIL import Image

from ..core import (Result, Settings, blur, canvas_dims, crop_to, ground_rgb, lab_to_srgb, noise1d,
                    noise2d, palette_from, smoothstep, srgb_to_lab, to_image)

NAME = "Block impasto"
BLURB = "Knife-painted blocks on a grid, like a hand-painted pixel portrait"
SIZE = dict(label="Block size (inches)", min=0.5, max=3.0, default=1.0)


def cell_colours(img: Image.Image, cols: int, rows: int, k: int = 8) -> np.ndarray:
    """Robust Lab colour per cell: drop the 40% of pixels furthest from the median."""
    small = np.asarray(img.resize((cols * k, rows * k), Image.LANCZOS), np.float64)
    cells = small.reshape(rows, k, cols, k, 3).transpose(0, 2, 1, 3, 4).reshape(rows, cols, k * k, 3)
    lab = srgb_to_lab(cells)
    med = np.median(lab, axis=2, keepdims=True)
    dist = np.linalg.norm(lab - med, axis=-1)
    keep = dist <= np.quantile(dist, 0.6, axis=2, keepdims=True)
    return (lab * keep[..., None]).sum(2) / keep.sum(2)[..., None]


def background_mask(lab: np.ndarray) -> np.ndarray:
    """Cells that match the border colour and connect to the edge (a plain backdrop)."""
    rows, cols = lab.shape[:2]
    border = np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])
    bm = np.median(border, 0)
    d = lab - bm
    similar = np.sqrt(d[..., 0] ** 2 + (1.5 * d[..., 1]) ** 2 + (1.5 * d[..., 2]) ** 2) <= 11
    bg = np.zeros_like(similar)
    stack = [(y, x) for y in range(rows) for x in range(cols)
             if (y in (0, rows - 1) or x in (0, cols - 1)) and similar[y, x]]
    for y, x in stack:
        bg[y, x] = True
    while stack:
        y, x = stack.pop()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < rows and 0 <= nx < cols and similar[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                stack.append((ny, nx))
    return bg


def make_block(P: int, gap: float, rng: np.random.Generator, impasto: float):
    """Height map, alpha and tint for one block: 2-4 knife strokes with ridges and ragged edges."""
    y, x = np.mgrid[0:P, 0:P].astype(np.float32)
    g = gap / 2
    wob = max(1.0, P * 0.025)

    def side(axis):
        n = noise1d(P, P / 4, rng)
        n = n[:, None] if axis == "y" else n[None, :]
        return wob * 0.8 * n + rng.normal(0, wob * 0.6)

    l, r = g + side("y"), P - g + side("y")
    t, b = g + side("x"), P - g + side("x")
    dx = np.minimum(x - l, r - x)
    dy = np.minimum(y - t, b - y)
    d = -np.sqrt(np.maximum(-dx, 0) ** 2 + np.maximum(-dy, 0) ** 2)
    d = np.where((dx > 0) & (dy > 0), np.minimum(dx, dy), d)
    alpha = np.clip(d + 0.5, 0, 1)

    h = 0.45 + 0.06 * noise2d(P, P, P / 3, rng)
    tint = np.zeros((P, P), np.float32)
    c = P / 2
    base = rng.choice([0, 0, 0, 90, 90, 45, -30])  # mostly horizontal knife work
    for _ in range(rng.integers(2, 5)):
        th = math.radians(base + rng.normal(0, 10) + (180 if rng.random() < 0.5 else 0))
        u = (x - c) * math.cos(th) + (y - c) * math.sin(th)
        v = -(x - c) * math.sin(th) + (y - c) * math.cos(th)
        vc = rng.uniform(-0.45, 0.45) * P
        w = rng.uniform(0.35, 0.85) * P
        u1 = rng.uniform(-0.15, 0.5) * P
        vi = np.clip((v + P).astype(int), 0, 2 * P - 1)
        ui = np.clip((u + P).astype(int), 0, 2 * P - 1)
        stri = (noise1d(2 * P, rng.uniform(2.5, 4.5) * P / 64, rng) * 0.022
                + noise1d(2 * P, P / 9, rng) * 0.06)[vi]
        edgev = noise1d(2 * P, P / 6, rng)[ui] * P * 0.03
        band = smoothstep(w / 2, w / 2 - 3, np.abs(v - vc + edgev))
        u1v = u1 + noise1d(2 * P, P / 5, rng)[vi] * P * 0.07 - ((v - vc) / P) ** 2 * P * 0.4
        m = band * smoothstep(u1v + 2, u1v - 2, u)
        lvl = rng.uniform(0.35, 0.6) + 0.04 * u / P
        h = h * (1 - m) + (lvl + stri) * m
        lump = (0.6 + 0.5 * noise1d(2 * P, P / 12, rng))[vi]
        ridge = np.exp(-((u - u1v - 1.0) / (P * 0.04)) ** 2) * band * lump * rng.uniform(0.2, 0.45)
        crest = np.maximum(noise1d(2 * P, P / 16, rng) - 1.4, 0)[vi] * 0.3 * m
        h = h + ridge + crest
        tint += m * rng.normal(0, 1.0)
    for _ in range(rng.integers(0, 2)):  # a torn lift mark
        px, py = rng.uniform(0.15, 0.85, 2) * P
        rad = rng.uniform(0.02, 0.04) * P
        h += rng.uniform(0.1, 0.25) * np.exp(-(((x - px) / (rad * 3)) ** 2 + ((y - py) / rad) ** 2))
    h = h * smoothstep(0, P * 0.025, d)
    return h * impasto, alpha, tint


def render(img: Image.Image, s: Settings) -> Result:
    rng = np.random.default_rng(s.seed)
    block_in = s.size if s.size is not None else SIZE["default"]
    Wcm, Hcm = canvas_dims(img, s)
    pitch_cm = 2.54 * block_in
    cols, rows = max(2, int(Wcm // pitch_cm)), max(2, int(Hcm // pitch_cm))
    img = crop_to(img, cols / rows)

    lab = cell_colours(img, cols, rows)
    painted = ~background_mask(lab) if s.subject_only else np.ones((rows, cols), bool)
    if not painted.any():
        painted[:] = True
    C, lbl = palette_from(lab[painted], s.colors, rng)
    idx = -np.ones((rows, cols), int)
    idx[painted] = lbl
    pal = lab_to_srgb(C).round().astype(np.uint8)

    # ---- paint every block
    P = int(round(s.ppi * block_in))
    Wp, Hp = int(round(Wcm / pitch_cm * P)), int(round(Hcm / pitch_cm * P))
    ox, oy = (Wp - cols * P) // 2, (Hp - rows * P) // 2
    Hm = np.zeros((Hp, Wp), np.float32)
    A = np.zeros((Hp, Wp), np.float32)
    Lab = np.zeros((Hp, Wp, 3), np.float32)
    gap = 0.11 * P
    for r_ in range(rows):
        for c_ in range(cols):
            if idx[r_, c_] < 0:
                continue
            h, a, tint = make_block(P, gap, rng, s.impasto)
            base = C[idx[r_, c_]] + rng.normal(0, [2.2, 1.3, 1.3]) * s.jitter
            sl = (slice(oy + r_ * P, oy + r_ * P + P), slice(ox + c_ * P, ox + c_ * P + P))
            Hm[sl] = np.maximum(Hm[sl], h * a)
            A[sl] = np.maximum(A[sl], a)
            blk = np.empty((P, P, 3), np.float32)
            blk[:] = base
            blk[..., 0] += tint * 1.6 * s.jitter
            Lab[sl] = blk * a[..., None] + Lab[sl] * (1 - a[..., None])

    # ---- ground: canvas weave, pencil grid on light grounds that are not pink
    gcol = ground_rgb(s.ground)
    yy, xx = np.mgrid[0:Hp, 0:Wp]
    weave = np.sin(xx * 2.1) * np.sin(yy * 2.1) * 0.012 + noise2d(Hp, Wp, 40, rng) * 0.01
    ground = gcol[None, None] * (1 + weave[..., None])
    if s.ground != "pink":
        inside = (xx >= ox) & (xx <= ox + cols * P) & (yy >= oy) & (yy <= oy + rows * P)
        on_line = (((xx - ox) % P) < 1.2) | (((yy - oy) % P) < 1.2)
        k = 0.12 if gcol.sum() > 380 else -0.15
        ground = ground * (1 - k * (inside & on_line))[..., None]
    paint = lab_to_srgb(Lab).astype(np.float32)

    # ---- light from the top left
    Hs = blur(Hm, max(1, P / 50)) * (6.0 * P / 64)
    gy_, gx_ = np.gradient(Hs)
    n = np.stack([-gx_, -gy_, np.ones_like(Hs)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    Ld = np.array([-0.45, -0.55, 0.70])
    Ld /= np.linalg.norm(Ld)
    Hv = Ld + [0, 0, 1]
    Hv /= np.linalg.norm(Hv)
    shade = 0.45 + 0.55 * np.clip(n @ Ld, 0, 1) / Ld[2]
    occl = np.zeros_like(Hs)  # self-shadow: march toward the light
    step = np.array([Ld[1], Ld[0]]) / np.hypot(Ld[0], Ld[1])
    for k in range(1, 9):
        dy_, dx_ = int(round(step[0] * k)), int(round(step[1] * k))
        occl = np.maximum(occl, np.roll(np.roll(Hs, -dy_, 0), -dx_, 1) - Hs - k * 0.9)
    shade *= 1 - 0.35 * np.clip(occl / 2.0, 0, 1)
    spec = np.clip(n @ Hv, 0, 1) ** 35 * 0.18 * A
    shadow = blur(np.roll(np.roll(A, 3, 0), 3, 1), 3) * (1 - A)
    ground = ground * (1 - 0.28 * shadow)[..., None]
    rgb = paint * shade[..., None] + spec[..., None] * 255
    out = rgb * A[..., None] + ground * (1 - A[..., None])
    out = out + rng.normal(0, 1.2, out.shape)

    counts = [int((idx == i).sum()) for i in range(len(C))]
    return Result(image=to_image(out), palette=pal, counts=counts, count_unit="blocks", grid=idx,
                  info={"canvas_cm": [Wcm, Hcm], "block_in": block_in, "cols": cols, "rows": rows,
                        "painted_blocks": int(painted.sum())})
