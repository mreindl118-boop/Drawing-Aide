"""Minimalist: a handful of flat, softly rounded colour fields on fine paper."""
from __future__ import annotations

import numpy as np
from PIL import Image

from ..core import (Result, Settings, blur, clamp, crop_to, lab_to_srgb, out_size, palette_from,
                    paper_texture, srgb_to_lab, to_image)

NAME = "Minimalist"
BLURB = "A few flat colour fields"
SIZE = dict(label="Shape size (1-10)", min=1, max=10, default=4)


def render(img: Image.Image, s: Settings) -> Result:
    rng = np.random.default_rng(s.seed + 4)
    size = clamp(s.size if s.size is not None else SIZE["default"], 1, 10)
    W, H, Wcm, Hcm = out_size(img, s)
    img = crop_to(img, W / H)
    sw = max(30, int(round(170 - size * 13)))
    sh = max(2, int(round(sw * H / W)))
    small = np.asarray(img.resize((sw, sh), Image.LANCZOS), np.float64)
    labs = srgb_to_lab(small.reshape(-1, 3))
    k = int(clamp(round(s.colors / 3), 4, 10))
    C, lbl = palette_from(labs, k, rng, desaturate=0.7, warmth=2.0)
    C = C.copy()
    C[:, 0] = 18 + C[:, 0] * 0.8
    C[:, 1:] *= 0.85
    pal = lab_to_srgb(C).round().astype(np.uint8)

    # blur one-hot label layers at full size and take the strongest: smooth organic fields
    lbl = lbl.reshape(sh, sw)
    ys = np.minimum(sh - 1, (np.arange(H) * sh / H).astype(int))
    xs = np.minimum(sw - 1, (np.arange(W) * sw / W).astype(int))
    big = lbl[ys][:, xs]
    rad = max(2.0, W / sw * (0.9 + size * 0.1))
    best = np.full((H, W), -1.0, np.float32)
    field = np.zeros((H, W), np.int32)
    for q in range(len(C)):
        b = blur((big == q).astype(np.float32), rad)
        better = b > best
        best[better] = b[better]
        field[better] = q
    rgb = pal[field].astype(np.float32)
    rgb = paper_texture(rgb, rng, 0.25)
    counts = [int((field == i).sum()) for i in range(len(C))]
    return Result(image=to_image(rgb), palette=pal, counts=counts, count_unit="px",
                  info={"canvas_cm": [Wcm, Hcm], "fields": len(C)})
