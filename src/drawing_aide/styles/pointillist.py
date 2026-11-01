"""Pointillist: the photo rebuilt from small dabs of boosted, hue-jittered colour."""
from __future__ import annotations

import numpy as np
from PIL import Image, ImageDraw

from ..core import (GROUNDS, Result, Settings, clamp, crop_to, lab_to_srgb, out_size, srgb_to_lab)

NAME = "Pointillist"
BLURB = "Dabs of pure colour"
SIZE = dict(label="Dot size (1-10)", min=1, max=10, default=3)


def render(img: Image.Image, s: Settings) -> Result:
    rng = np.random.default_rng(s.seed + 3)
    size = clamp(s.size if s.size is not None else SIZE["default"], 1, 10)
    W, H, Wcm, Hcm = out_size(img, s)
    img = crop_to(img, W / H)
    px = np.asarray(img.resize((W, H), Image.LANCZOS), np.float64)
    ground = GROUNDS.get(s.ground, s.ground)
    canvas = Image.new("RGB", (W, H), ground)
    draw = ImageDraw.Draw(canvas)

    rad = 1.6 + size * 1.15
    n = int(round(W * H / (rad * rad) * 1.4))
    x = rng.random(n) * W
    y = rng.random(n) * H
    lab = srgb_to_lab(px[y.astype(int), x.astype(int)])
    hue = np.arctan2(lab[:, 2], lab[:, 1]) + rng.normal(0, 0.35, n)
    chroma = np.hypot(lab[:, 1], lab[:, 2]) * 1.35 + 4
    L = lab[:, 0] + rng.normal(0, 7, n)
    rgb = lab_to_srgb(np.stack([L, chroma * np.cos(hue), chroma * np.sin(hue)], 1)).astype(int)
    rx = rad * (0.8 + rng.random(n) * 0.4)
    ry = rad * (0.6 + rng.random(n) * 0.3)
    for i in range(n):
        draw.ellipse((x[i] - rx[i], y[i] - ry[i], x[i] + rx[i], y[i] + ry[i]), fill=tuple(rgb[i]))
    return Result(image=canvas, info={"canvas_cm": [Wcm, Hcm], "dabs": n})
