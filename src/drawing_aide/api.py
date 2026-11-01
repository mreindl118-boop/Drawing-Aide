"""Python API: render() returns a Result, convert() renders a file and writes outputs."""
from __future__ import annotations

import dataclasses
import os

from PIL import Image

from .core import Result, Settings, load_image
from .pbn import write_outputs
from .styles import STYLES


def render(img: Image.Image, settings: Settings | None = None, **kw) -> Result:
    s = dataclasses.replace(settings or Settings(), **kw)
    if s.style not in STYLES:
        raise ValueError(f"unknown style {s.style!r}; choose from {', '.join(STYLES)}")
    return STYLES[s.style].render(img.convert("RGB"), s)


def convert(path: str, out_dir: str = "out", settings: Settings | None = None, **kw) -> list:
    s = dataclasses.replace(settings or Settings(), **kw)
    res = render(load_image(path), s)
    name = os.path.splitext(os.path.basename(path))[0]
    return write_outputs(res, out_dir, name, s.style, dataclasses.asdict(s))
