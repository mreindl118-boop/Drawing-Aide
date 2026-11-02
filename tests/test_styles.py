import json

import numpy as np
import pytest
from PIL import Image

from drawing_aide import STYLES, Settings, convert, render
from drawing_aide.cli import main


def photo(w=120, h=90):
    y, x = np.mgrid[0:h, 0:w]
    rgb = np.stack([x * 255 / w, y * 255 / h, np.full_like(x, 120)], -1).astype(np.uint8)
    rgb[30:60, 40:80] = [200, 150, 120]  # a "skin" patch
    return Image.fromarray(rgb)


SMALL = dict(canvas_cm=(30, 40), max_px=200, ppi=16, colors=8)


@pytest.mark.parametrize("style", list(STYLES))
def test_every_style_renders(style):
    res = render(photo(), Settings(style=style, **SMALL))
    assert res.image.mode == "RGB"
    # auto orientation: landscape photo -> landscape canvas
    assert res.image.width > res.image.height
    if res.palette is not None:
        assert len(res.palette) <= 8
        assert sum(res.counts) > 0


def test_block_grid_follows_size():
    s = Settings(style="blocks", **SMALL)
    one = render(photo(), s, size=1.0).info
    two = render(photo(), s, size=2.0).info
    assert (one["cols"], one["rows"]) == (15, 11)   # 40 x 30 cm at 1 inch
    assert two["cols"] < one["cols"]


def test_palette_numbered_dark_to_light():
    res = render(photo(), Settings(style="blocks", **SMALL))
    lum = res.palette.astype(float) @ [0.299, 0.587, 0.114]
    assert np.all(np.diff(lum) >= -8)


def test_convert_writes_paint_by_number(tmp_path):
    p = tmp_path / "pic.png"
    photo().save(p)
    paths = convert(str(p), str(tmp_path / "out"), Settings(style="blocks", **SMALL))
    names = sorted(x.split("/")[-1] for x in paths)
    assert names == ["pic_blocks.jpg", "pic_blocks_grid.csv", "pic_blocks_paint_by_number.png",
                     "pic_blocks_palette.json"]
    meta = json.loads((tmp_path / "out" / "pic_blocks_palette.json").read_text())
    assert meta["cols"] == 15 and meta["palette"][0]["number"] == 1


def test_folder_mode_skips_done(tmp_path):
    inbox = tmp_path / "in"
    inbox.mkdir()
    photo().save(inbox / "a.jpg")
    args = ["--folder", str(inbox), "-o", str(tmp_path / "out"), "-s", "minimal", "--canvas", "30", "40",
            "--max-px", "150"]
    assert main(args) == 0
    first = (tmp_path / "out" / "a_minimal.jpg").stat().st_mtime_ns
    assert main(args) == 0
    assert (tmp_path / "out" / "a_minimal.jpg").stat().st_mtime_ns == first


def test_size_out_of_range_errors():
    with pytest.raises(SystemExit):
        main(["x.jpg", "-s", "blocks", "--size", "9"])
