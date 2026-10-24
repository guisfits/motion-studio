"""Derived pictures of S09 (a911): `python3 -I lib/s09-11-post.py` (from the film folder).

- s09-ear-only.png: the metal ear of s09-hand-top-cut.png (the old cut lost its arm, but the ear is clean),
  cropped to its visible alpha so a hand cut-out can hold it at any size.
"""
import os
import numpy as np
from PIL import Image

GEN = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "gen")
im = Image.open(os.path.join(GEN, "s09-hand-top-cut.png")).convert("RGBA")
a = np.array(im)
alpha = a[..., 3] > 40
ys, xs = np.where(alpha)
# the old cut is the ear and some forearm remnants; keep the largest compact blob around the ear (grey, low saturation)
sat = a[..., :3].max(-1).astype(int) - a[..., :3].min(-1).astype(int)
ear = alpha & (sat < 28)
ys, xs = np.where(ear)
box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
out = Image.fromarray(np.where(ear[..., None], a, 0).astype("uint8"), "RGBA").crop(box)
out.save(os.path.join(GEN, "s09-ear-only.png"))
print("s09-ear-only.png", out.size, box)
