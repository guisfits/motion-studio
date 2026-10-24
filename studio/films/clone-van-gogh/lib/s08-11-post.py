"""Derived pictures of S10/S11: `python3 -I lib/s08-11-post.py` (from the film folder).

- s10-keyhole-plate.png: s10-keyhole.png with its solid-green hole keyed to alpha 0.
- s11-frame-cut.png: s02-frame-rect-cut.png with its magenta inside keyed to alpha 0 (the painting goes behind).
Both are chroma keys on flat generated colours, with a 1px erosion so no coloured fringe is left.
"""
import os
import numpy as np
from PIL import Image, ImageFilter

GEN = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "gen")


def key(src, dst, is_key):
    im = Image.open(os.path.join(GEN, src)).convert("RGBA")
    a = np.array(im).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = is_key(r, g, b)
    hole = Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.MaxFilter(5))  # grow 2px: kills fringe
    hole = np.array(hole.filter(ImageFilter.GaussianBlur(1))) / 255.0
    alpha = np.array(im)[..., 3] * (1 - hole)
    out = np.array(im)
    out[..., 3] = alpha.astype("uint8")
    Image.fromarray(out).save(os.path.join(GEN, dst))
    print(dst, "keyed", int(m.sum()), "px")


if os.path.exists(os.path.join(GEN, "s10-keyhole.png")):
    key("s10-keyhole.png", "s10-keyhole-plate.png", lambda r, g, b: (g > r + 50) & (g > b + 50))
if os.path.exists(os.path.join(GEN, "s02-frame-rect-cut.png")):
    key("s02-frame-rect-cut.png", "s11-frame-cut.png", lambda r, g, b: (r > 150) & (b > 150) & (g < r - 70))
