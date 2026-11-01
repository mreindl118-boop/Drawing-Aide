"""Paint-by-number outputs: numbered grid sheet, CSV grid and palette JSON."""
from __future__ import annotations

import csv
import json
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from .core import Result


def _font(size: int, bold: bool = False):
    names = ["DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf", "Arial Bold.ttf" if bold else "Arial.ttf",
             "arialbd.ttf" if bold else "arial.ttf"]
    for n in names:
        try:
            return ImageFont.truetype(n, size)
        except OSError:
            continue
    return ImageFont.load_default()


def hexcode(c) -> str:
    return "#%02x%02x%02x" % tuple(int(v) for v in c)


def sheet(res: Result) -> Image.Image:
    idx, pal, counts = res.grid, res.palette, res.counts
    rows, cols = idx.shape
    cs, m, legw = 34, 40, 460
    leg_rows = math.ceil(len(pal) / 2)
    W = m + cols * cs + 30 + legw
    H = max(m + rows * cs + 20, 120 + leg_rows * 44 + 20) + 60
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    f, fs, fb = _font(13), _font(10), _font(16, True)
    for r in range(rows):
        for c in range(cols):
            x0, y0 = m + c * cs, m + r * cs
            i = idx[r, c]
            if i < 0:
                d.rectangle([x0, y0, x0 + cs, y0 + cs], outline="#cccccc", fill="white")
                continue
            col = tuple(int(v) for v in pal[i])
            lum = 0.299 * col[0] + 0.587 * col[1] + 0.114 * col[2]
            d.rectangle([x0, y0, x0 + cs, y0 + cs], fill=col, outline="#888888")
            d.text((x0 + cs / 2, y0 + cs / 2), str(i + 1), fill="white" if lum < 120 else "black", font=f, anchor="mm")
    for c in range(cols):
        d.text((m + c * cs + cs / 2, m - 10), str(c + 1), fill="#555", font=fs, anchor="mm")
    for r in range(rows):
        d.text((m - 14, m + r * cs + cs / 2), str(r + 1), fill="#555", font=fs, anchor="mm")
    lx = m + cols * cs + 30
    Wcm, Hcm = res.info["canvas_cm"]
    d.text((lx, m), f"Canvas {Wcm:g} x {Hcm:g} cm  |  {cols} x {rows} blocks @ {res.info['block_in']:g} in",
           fill="black", font=fb)
    d.text((lx, m + 24), f"{int((idx >= 0).sum())} blocks, {len(pal)} colours (dark to light)", fill="#444", font=f)
    for i, col in enumerate(pal):
        cx = lx + (i // leg_rows) * (legw // 2)
        cy = m + 60 + (i % leg_rows) * 44
        d.rectangle([cx, cy, cx + 34, cy + 34], fill=tuple(int(v) for v in col), outline="#444")
        d.text((cx + 44, cy + 2), str(i + 1), fill="black", font=fb)
        d.text((cx + 76, cy + 4), hexcode(col), fill="#333", font=f)
        d.text((cx + 76, cy + 20), f"{counts[i]} blocks", fill="#777", font=fs)
    return img


def write_outputs(res: Result, out_dir: str, name: str, style: str, settings: dict) -> list:
    """Save the painting and, where the style has a palette, the palette / grid files. Returns paths."""
    os.makedirs(out_dir, exist_ok=True)
    paths = []
    p = os.path.join(out_dir, f"{name}_{style}.jpg")
    res.image.save(p, quality=92)
    paths.append(p)
    if res.palette is not None:
        meta = {"style": style, **res.info, "settings": settings,
                "palette": [{"number": i + 1, "hex": hexcode(c), "rgb": [int(v) for v in c],
                             res.count_unit: res.counts[i]} for i, c in enumerate(res.palette)]}
        p = os.path.join(out_dir, f"{name}_{style}_palette.json")
        with open(p, "w") as fh:
            json.dump(meta, fh, indent=1)
        paths.append(p)
    if res.grid is not None:
        p = os.path.join(out_dir, f"{name}_{style}_grid.csv")
        with open(p, "w", newline="") as fh:
            w = csv.writer(fh)
            w.writerow(["row\\col"] + list(range(1, res.grid.shape[1] + 1)))
            for r, row in enumerate(res.grid):
                w.writerow([r + 1] + [(int(i) + 1 if i >= 0 else "") for i in row])
        paths.append(p)
        p = os.path.join(out_dir, f"{name}_{style}_paint_by_number.png")
        sheet(res).save(p)
        paths.append(p)
    return paths
