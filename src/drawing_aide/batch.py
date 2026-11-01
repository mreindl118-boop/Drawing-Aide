"""Folder mode: convert every new or changed image, tracked in out_dir/manifest.json.

Point it at a synced folder (e.g. Google Drive for desktop) and run it on a schedule or with --watch
to get a hands-off "drop photos in, paintings come out" workflow.
"""
from __future__ import annotations

import dataclasses
import hashlib
import json
import os
import time

from .api import convert
from .core import Settings

IMG_EXT = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp"}


def _hash(path: str) -> str:
    h = hashlib.sha1()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def folder_settings(in_dir: str, base: Settings) -> Settings:
    """A drawing-aide.json in the input folder overrides settings for that folder."""
    p = os.path.join(in_dir, "drawing-aide.json")
    if not os.path.exists(p):
        return base
    with open(p) as fh:
        over = json.load(fh)
    if "canvas_cm" in over:
        over["canvas_cm"] = tuple(over["canvas_cm"])
    return dataclasses.replace(base, **over)


def run_once(in_dir: str, out_dir: str, settings: Settings, log=print) -> list:
    s = folder_settings(in_dir, settings)
    os.makedirs(out_dir, exist_ok=True)
    man_p = os.path.join(out_dir, "manifest.json")
    manifest = {}
    if os.path.exists(man_p):
        with open(man_p) as fh:
            manifest = json.load(fh)
    done = []
    for fn in sorted(os.listdir(in_dir)):
        p = os.path.join(in_dir, fn)
        if os.path.splitext(fn)[1].lower() not in IMG_EXT or not os.path.isfile(p):
            continue
        key = f"{fn}|{s.style}|{s.size}"
        h = _hash(p)
        if manifest.get(key) == h:
            continue
        log(f"painting {fn} ({s.style})")
        try:
            convert(p, out_dir, s)
        except Exception as e:  # keep going on a bad file
            log(f"  skipped {fn}: {e}")
            continue
        manifest[key] = h
        done.append(fn)
        with open(man_p, "w") as fh:
            json.dump(manifest, fh, indent=1)
    return done


def watch(in_dir: str, out_dir: str, settings: Settings, interval: float = 10.0, log=print):
    log(f"watching {in_dir} every {interval:g}s, writing to {out_dir} (Ctrl+C to stop)")
    while True:
        run_once(in_dir, out_dir, settings, log)
        time.sleep(interval)
