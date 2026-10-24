"""S02 frame prep: the generated gilt frames have a magenta inside. For each *-cut.png of a
frame, write assets/s01-03/<id>-frame.png (magenta made transparent), <id>-mask.png (alpha = the
hole, for clipping the painting) and print the hole bbox as fractions: x0 y0 x1 y1."""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter
here = os.path.dirname(os.path.abspath(__file__))
gen = os.path.join(here, "..", "assets", "gen"); out = os.path.join(here, "..", "assets", "s01-03")
os.makedirs(out, exist_ok=True)
info = {}
for fid in sys.argv[1:]:
    im = Image.open(os.path.join(gen, fid + "-cut.png")).convert("RGBA")
    a = np.array(im).astype(int); r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    mag = (al > 200) & (r > 150) & (b > 120) & (g < 110) & (r - g > 80) & (b - g > 50)
    mag = np.array(Image.fromarray((mag * 255).astype("uint8")).filter(ImageFilter.MaxFilter(7))) > 0
    a[..., 3] = np.where(mag, 0, al)
    Image.fromarray(a.astype("uint8"), "RGBA").save(os.path.join(out, fid + "-frame.png"))
    m = Image.fromarray((mag * 255).astype("uint8"), "L").filter(ImageFilter.GaussianBlur(1))
    m2 = Image.new("RGBA", im.size, (255, 255, 255, 0)); m2.putalpha(m)
    m2.save(os.path.join(out, fid + "-mask.png"))
    ys, xs = np.where(mag)
    info[fid] = [xs.min() / im.width, ys.min() / im.height, (xs.max() + 1) / im.width, (ys.max() + 1) / im.height, im.width / im.height]
json.dump(info, open(os.path.join(out, "holes.json"), "w"), indent=1)
print(json.dumps(info))
