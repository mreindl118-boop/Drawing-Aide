"""Cubist: the photo broken into straight-edged planes, each with its own light, outlined in dark."""
from __future__ import annotations

import numpy as np
from PIL import Image

from ..core import (Result, Settings, clamp, crop_to, lab_to_srgb, out_size, palette_from,
                    paper_texture, srgb_to_lab, to_image)

NAME = "Cubist"
BLURB = "Fractured planes with dark contours"
SIZE = dict(label="Plane size (1-10)", min=1, max=10, default=4)


def render(img: Image.Image, s: Settings) -> Result:
    rng = np.random.default_rng(s.seed + 2)
    size = clamp(s.size if s.size is not None else SIZE["default"], 1, 10)
    W, H, Wcm, Hcm = out_size(img, s)
    img = crop_to(img, W / H)
    px = np.asarray(img.resize((W, H), Image.LANCZOS), np.float32)
    S = max(W, H) / (10 + (10 - size) * 3)

    # where the photo has structure, add short local cuts so faces and hands keep their shape
    dw = 48
    dh = max(4, int(round(48 * H / W)))
    sm = np.asarray(img.resize((dw, dh), Image.LANCZOS), np.float32).sum(-1)
    det = np.zeros_like(sm)
    det[1:-1, 1:-1] = np.abs(sm[1:-1, 2:] - sm[1:-1, :-2]) + np.abs(sm[2:, 1:-1] - sm[:-2, 1:-1])
    p = det.ravel() / det.sum() if det.sum() > 0 else None

    lines = []  # (cos, sin, cx, cy, half-length or inf)
    for _ in range(int(round(14 + (10 - size) * 3.5))):
        a = rng.random() * np.pi
        lines.append((np.cos(a), np.sin(a), rng.random() * W, rng.random() * H, np.inf))
    for _ in range(int(round(8 + (10 - size) * 4))):
        cell = rng.choice(dw * dh, p=p)
        cx = (cell % dw + rng.random()) * W / dw
        cy = (cell // dw + rng.random()) * H / dh
        if rng.random() < 0.6:  # mostly near-vertical / near-horizontal, like Braque
            a = (0 if rng.random() < 0.5 else np.pi / 2) + (rng.random() - 0.5) * 0.5
        else:
            a = rng.random() * np.pi
        lines.append((np.cos(a), np.sin(a), cx, cy, S * (1.2 + rng.random() * 2)))

    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    key = np.zeros((H, W), np.uint64)
    keys = [key]
    for k, (c, sn, cx, cy, half) in enumerate(lines):
        if k and k % 63 == 0:
            key = np.zeros((H, W), np.uint64)
            keys.append(key)
        dx, dy = xx - cx, yy - cy
        perp = -dx * sn + dy * c
        side = perp > 0
        if np.isfinite(half):
            along = dx * c + dy * sn
            side &= (np.abs(along) <= half) & (np.abs(perp) <= half * 1.6)
        key |= side.astype(np.uint64) << np.uint64(k % 63)
    _, own = np.unique(np.stack([kk.ravel() for kk in keys], 1), axis=0, return_inverse=True)
    own = own.reshape(H, W)
    n = own.max() + 1

    # each plane: colour sampled from a slightly shifted viewpoint, its own flat light direction
    off = (rng.random((n, 2)) - 0.5) * S * 0.25
    ang = rng.random(n) * 2 * np.pi
    amt = 0.5 + rng.random(n) * 0.9
    sx = np.clip(np.round(xx + off[own, 0]), 0, W - 1).astype(int)
    sy = np.clip(np.round(yy + off[own, 1]), 0, H - 1).astype(int)
    shifted = px[sy, sx]
    cnt = np.bincount(own.ravel(), minlength=n).astype(np.float64)
    mean = np.stack([np.bincount(own.ravel(), shifted[..., ch].ravel(), n) for ch in range(3)], 1) / cnt[:, None]
    cxs = np.bincount(own.ravel(), xx.ravel(), n) / cnt
    cys = np.bincount(own.ravel(), yy.ravel(), n) / cnt
    C, lbl = palette_from(srgb_to_lab(mean), min(s.colors, 12), rng, desaturate=0.5, warmth=7)
    pal = lab_to_srgb(C).round().astype(np.uint8)

    t = ((xx - cxs[own]) * np.cos(ang[own]) + (yy - cys[own]) * np.sin(ang[own])) / (S * 0.5)
    lab = C[lbl[own]].copy()
    lab[..., 0] += np.clip(t, -1, 1) * 15 * amt[own]
    rgb = lab_to_srgb(lab).astype(np.float32)

    lw = max(1, round(W / 700))
    line = np.ones((H, W), np.float32)
    for k in range(lw, 0, -1):
        edge = np.zeros((H, W), bool)
        edge[:, :-k] |= own[:, :-k] != own[:, k:]
        edge[:-k, :] |= own[:-k, :] != own[k:, :]
        line[edge] = 0.5 if (k == lw and lw > 1) else 0.22
    rgb = rgb * line[..., None] + (rng.random((H, W, 1)) - 0.5) * 7
    rgb = paper_texture(rgb, rng, 0.45)
    counts = [int((lbl == i).sum()) for i in range(len(C))]
    return Result(image=to_image(rgb), palette=pal, counts=counts, count_unit="planes",
                  info={"canvas_cm": [Wcm, Hcm], "planes": int(n)})
