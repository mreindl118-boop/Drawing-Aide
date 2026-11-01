"""Style registry. To add a style, drop a module here with NAME, BLURB, SIZE and render(img, settings)."""
from . import blocks, cubist, minimal, pointillist

STYLES = {
    "blocks": blocks,
    "minimal": minimal,
    "cubist": cubist,
    "pointillist": pointillist,
}
