# /// script
# requires-python = ">=3.10,<3.14"
# dependencies = ["rembg[cpu]==2.0.67", "pillow"]
# ///
# Mattes images with BiRefNet (open weights, MIT; runs locally on the CPU through rembg) for what
# Apple Vision lifts badly in cutout.swift: hair against a busy ground, hands, a figure inside a
# crowded engraving (kit entries with `matte: "birefnet"`). Writes RGBA PNGs at the source's
# size; cutout.swift --mode alpha then adds the border and the crop. The model loads once for the whole batch; the first run downloads it
# into ~/.u2net (~1 GB).
#
#   uv run --script core/reference/matte.py <in> <out.png> [<in> <out.png> ...]
#   MATTE_MODEL=birefnet-general-lite  smaller and faster, a little coarser at the edge
import os
import sys

from PIL import Image
from rembg import new_session, remove

args = sys.argv[1:]
if not args or len(args) % 2:
    sys.exit("usage: matte.py <in> <out.png> [<in> <out.png> ...]")

session = new_session(os.environ.get("MATTE_MODEL", "birefnet-general"))
for src, out in zip(args[::2], args[1::2]):
    image = Image.open(src).convert("RGB")
    remove(image, session=session).save(out)
    print(f"matte: {src} -> {out}")
