"""Rebuilds assets/cut/puppet-*.png from assets/cut/original/ (the first, crude cut of figure-jager.jpg).

Torso: keeps the original's coat but trims the flat dark fill that stood in for the akimbo arms and
the head, so no blob is left behind when an arm lifts. Arms: new straight sleeves (coat texture
sampled from the torso skirt, dark cuff with a yellow line, skin hand, off-white die-cut rim) with
round caps, so a shoulder or elbow turned to any angle shows no gap. Run from the studio root.
"""
import random
from PIL import Image, ImageDraw, ImageFilter

SRC = "assets/cut/original/"
OUT = "assets/cut/"
SS = 4  # supersampling for clean alpha

torso = Image.open(SRC + "puppet-torso.png").convert("RGBA")

# ---- torso: trim fills -------------------------------------------------------------------
mask = Image.new("L", torso.size, 0)
d = ImageDraw.Draw(mask)
# body (arms-down coat) from the shoulders to the hip, then the original skirt and legs below
body = [(140, 178), (216, 178), (252, 205), (254, 300), (252, 452), (252, 470), (350, 470), (350, 900),
        (0, 900), (0, 495), (84, 495), (92, 452), (108, 300), (112, 205)]
d.polygon(body, fill=255)
# backpack bundle behind the head: keep the part right of the neck
d.rectangle((216, 0, 341, 205), fill=255)
keep = Image.eval(mask, lambda v: v)
a = torso.getchannel("A")
a = Image.composite(a, Image.new("L", a.size, 0), keep)
# clear the dark head-shaped fill above the shoulders (x < 216, y < 180)
clear = Image.new("L", a.size, 255)
ImageDraw.Draw(clear).rectangle((0, 0, 215, 177), fill=0)
a = Image.composite(a, Image.new("L", a.size, 0), clear)
torso.putalpha(a)
torso.save(OUT + "puppet-torso.png")

# ---- arms --------------------------------------------------------------------------------
patch = Image.open(SRC + "puppet-torso.png").convert("RGB").crop((110, 490, 210, 560))
def tile(w, h):
    img = Image.new("RGB", (w, h))
    for x in range(0, w, patch.width):
        for y in range(0, h, patch.height):
            p = patch if (x // patch.width + y // patch.height) % 2 == 0 else patch.transpose(Image.FLIP_LEFT_RIGHT)
            img.paste(p, (x, y))
    return img

CUFF = (34, 38, 36)
YELLOW = (214, 176, 40)
SKIN = (212, 170, 140)
SKIN_D = (150, 108, 86)
RIM = (244, 239, 226)

def capsule(draw, cx, top_r, y0, bot_r, y1, fill, s=SS):
    """Sleeve from a round cap at (cx, y0) down to (cx, y1) with a round end, tapering top_r -> bot_r."""
    draw.ellipse(((cx - top_r) * s, (y0 - top_r) * s, (cx + top_r) * s, (y0 + top_r) * s), fill=fill)
    draw.polygon([((cx - top_r) * s, y0 * s), ((cx + top_r) * s, y0 * s), ((cx + bot_r) * s, y1 * s),
                  ((cx - bot_r) * s, y1 * s)], fill=fill)
    draw.ellipse(((cx - bot_r) * s, (y1 - bot_r) * s, (cx + bot_r) * s, (y1 + bot_r) * s), fill=fill)

def finish(color, sil, w, h, name, rimless_top=False):
    """Colour layer + silhouette (supersampled) -> RGBA with a 2 px off-white rim."""
    sil_small = sil.resize((w, h), Image.LANCZOS)
    rim = sil_small.filter(ImageFilter.MaxFilter(5))
    out = Image.new("RGBA", (w, h), RIM + (0,))
    out.putalpha(rim)
    body = color.convert("RGBA")
    body.putalpha(sil_small.point(lambda v: 255 if v > 127 else v * 2 if v > 0 else 0))
    out.alpha_composite(body)
    out.save(OUT + name)

def make_upper(name, w=76, h=200, cx=38, r_top=33, r_bot=29, elbow=150):
    sil = Image.new("L", (w * SS, h * SS), 0)
    capsule(ImageDraw.Draw(sil), cx, r_top, r_top + 3, r_bot, elbow + r_top + 3 - 0, 255)
    color = tile(w, h)
    # soft sleeve shading: darker toward the edges so the cap reads as round
    shade = Image.new("L", (w, h), 0)
    sd = ImageDraw.Draw(shade)
    for x in range(w):
        t = abs(x - cx) / r_top
        sd.line([(x, 0), (x, h)], fill=int(max(0, t - 0.55) * 120))
    color = Image.composite(Image.new("RGB", (w, h), (20, 24, 22)), color, shade)
    finish(color, sil, w, h, name)

def make_lower(name, w=76, h=250, cx=38, r_top=28, r_bot=25, wrist=115):
    sil = Image.new("L", (w * SS, h * SS), 0)
    sd = ImageDraw.Draw(sil)
    top = r_top + 3
    capsule(sd, cx, r_top, top, r_bot, wrist + top, 255)
    # hand: mitten below the cuff (palm + thumb)
    hy = wrist + top
    sd.ellipse(((cx - 21) * SS, (hy - 6) * SS, (cx + 21) * SS, (hy + 62) * SS), fill=255)
    sd.ellipse(((cx + 12) * SS, (hy + 8) * SS, (cx + 30) * SS, (hy + 40) * SS), fill=255)
    color = tile(w, h)
    cd = ImageDraw.Draw(color)
    cuff0, cuff1 = hy - 22, hy + 2
    cd.rectangle((0, cuff0, w, cuff1), fill=CUFF)
    cd.rectangle((0, cuff0, w, cuff0 + 3), fill=YELLOW)
    cd.rectangle((0, hy + 2, w, h), fill=SKIN)
    # hand shading + finger lines
    rnd = random.Random(7)
    for _ in range(400):
        x, y = rnd.randint(cx - 24, cx + 30), rnd.randint(hy + 2, hy + 62)
        c = SKIN_D if rnd.random() < 0.3 else (226, 186, 156)
        cd.point((x, y), fill=c)
    for i in range(3):
        x = cx - 9 + i * 9
        cd.line([(x, hy + 36), (x, hy + 58)], fill=SKIN_D, width=1)
    finish(color, sil, w, h, name)

for side in ("l", "r"):
    make_upper(f"puppet-upper_arm_{side}.png")
    make_lower(f"puppet-lower_arm_{side}.png")
print("parts written")
