"""Command line: drawing-aide PHOTO [--style blocks] [--size 1.0] ..."""
from __future__ import annotations

import argparse
import os
import sys

from . import batch
from .api import convert
from .core import GROUNDS, Settings
from .styles import STYLES


def build_parser() -> argparse.ArgumentParser:
    styles = "\n".join(f"  {k:<12} {m.BLURB}. --size = {m.SIZE['label']}, default {m.SIZE['default']}"
                       for k, m in STYLES.items())
    ap = argparse.ArgumentParser(
        prog="drawing-aide",
        description="Turn photos into paintings.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"styles:\n{styles}\n\nexamples:\n"
               "  drawing-aide photo.jpg\n"
               "  drawing-aide photo.jpg --style cubist --size 3\n"
               "  drawing-aide photo.jpg --style blocks --size 1.5 --ground white --subject-only\n"
               "  drawing-aide --folder ~/Drive/Paint-Inbox -o ~/Drive/Paintings --watch")
    ap.add_argument("photos", nargs="*", help="image files to convert")
    ap.add_argument("-s", "--style", choices=list(STYLES), default="blocks")
    ap.add_argument("--size", type=float, help="block size in inches (blocks) or shape size 1-10 (other styles)")
    ap.add_argument("--canvas", type=float, nargs=2, metavar=("W_CM", "H_CM"), default=(100, 120),
                    help="canvas size in cm (default 100 120)")
    ap.add_argument("--fixed-orientation", action="store_true", help="don't flip the canvas to match the photo")
    ap.add_argument("--colors", type=int, default=24, help="palette size (default 24)")
    ap.add_argument("--ground", default="pink", help=f"gap/background colour: {', '.join(GROUNDS)} or #hex")
    ap.add_argument("--subject-only", action="store_true", help="blocks: leave a plain background unpainted")
    ap.add_argument("--impasto", type=float, default=1.0, help="blocks: paint relief strength")
    ap.add_argument("--max-px", type=int, default=1600, help="long side of the render for non-block styles")
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("-o", "--out", default="out", help="output folder (default ./out)")
    ap.add_argument("--folder", help="convert every new image in this folder")
    ap.add_argument("--watch", action="store_true", help="with --folder: keep watching for new photos")
    ap.add_argument("--interval", type=float, default=10, help="--watch polling interval in seconds")
    ap.add_argument("--list-styles", action="store_true")
    return ap


def main(argv=None):
    ap = build_parser()
    a = ap.parse_args(argv)
    if a.list_styles:
        for k, m in STYLES.items():
            print(f"{k:<12} {m.NAME}: {m.BLURB} (--size {m.SIZE['min']}-{m.SIZE['max']}, default {m.SIZE['default']})")
        return 0
    s = Settings(style=a.style, size=a.size, canvas_cm=tuple(a.canvas),
                 orientation="fixed" if a.fixed_orientation else "auto", colors=a.colors, ground=a.ground,
                 subject_only=a.subject_only, impasto=a.impasto, max_px=a.max_px, seed=a.seed)
    if a.size is not None:
        lim = STYLES[a.style].SIZE
        if not lim["min"] <= a.size <= lim["max"]:
            ap.error(f"--size for {a.style} must be between {lim['min']} and {lim['max']}")
    if a.folder:
        if not os.path.isdir(a.folder):
            ap.error(f"folder not found: {a.folder}")
        if a.watch:
            try:
                batch.watch(a.folder, a.out, s, a.interval)
            except KeyboardInterrupt:
                return 0
        done = batch.run_once(a.folder, a.out, s)
        print(f"converted {len(done)} photo(s) into {a.out}")
        return 0
    if not a.photos:
        ap.print_help()
        return 1
    for p in a.photos:
        for out in convert(p, a.out, s):
            print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
