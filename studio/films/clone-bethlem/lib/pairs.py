# Run from the studio root: python3 -I studio/films/clone-bethlem/lib/pairs.py <prefix> <0-based ref frames...>
# Reference frame (1-based f = frame+1) above, ours below (out/stills/<prefix>-<frame>.png), one column per frame.
import sys
from PIL import Image, ImageDraw
pre, fr = sys.argv[1], [int(x) for x in sys.argv[2:]]
R = "inspirations/clone-candidates/c5-work/media/f/%04d.jpg"
O = "studio/films/clone-bethlem/out/stills/%s-%d.png"
w, h = 270, 480
sheet = Image.new("RGB", (w * len(fr), h * 2 + 24), "#1b1b1b")
d = ImageDraw.Draw(sheet)
for i, f in enumerate(fr):
    sheet.paste(Image.open(R % (f + 1)).convert("RGB").resize((w, h)), (i * w, 24))
    sheet.paste(Image.open(O % (pre, f)).convert("RGB").resize((w, h)), (i * w, 24 + h))
    d.text((i * w + 6, 6), f"f{f + 1}  ref / ours", fill="white")
out = f"studio/films/clone-bethlem/out/pairs-{pre}.png"
sheet.save(out); print(out)
