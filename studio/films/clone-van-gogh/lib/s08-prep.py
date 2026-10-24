"""Builds the two composited pictures of S08/S13 (run from the film folder, python3 -I lib/s08-prep.py):
 - s08b-studio-ext.png : the studio plate with 260 px of its left edge mirrored on, so the measured pan never shows the edge
 - s13b-easel-starry.png: the easel cut-out with the Starry Night print set on its canvas, shaded by the canvas"""
from PIL import Image, ImageChops, ImageFilter

p = Image.open("assets/gen/s08b-studio.png").convert("RGB")
EXT = 260
out = Image.new("RGB", (p.width + EXT, p.height))
out.paste(p, (EXT, 0))
m = p.crop((0, 0, EXT, p.height)).transpose(Image.FLIP_LEFT_RIGHT).filter(ImageFilter.GaussianBlur(6))
out.paste(m, (0, 0))
# soften the seam
seam = out.crop((EXT - 40, 0, EXT + 40, p.height)).filter(ImageFilter.GaussianBlur(5))
out.paste(seam.crop((10, 0, 70, p.height)), (EXT - 30, 0))
out.save("assets/gen/s08b-studio-ext.png")

e = Image.open("assets/gen/s13b-easel-cut.png").convert("RGBA")
box = (162, 343, 618, 790)
w, h = box[2] - box[0], box[3] - box[1]
s = Image.open("assets/pd/starry-night.jpg").convert("RGB")
# portrait crop of the landscape print, centred on the swirl and the cypress
cw = int(s.height * w / h)
x0 = int(s.width * 0.18)
s = s.crop((x0, 0, x0 + cw, s.height)).resize((w, h), Image.LANCZOS)
canvas = e.crop(box).convert("L")
shade = canvas.point(lambda v: min(255, int(v * 255 / 245)))
s = ImageChops.multiply(s, Image.merge("RGB", (shade, shade, shade)))
e.paste(s.convert("RGBA"), (box[0], box[1]))
e.save("assets/gen/s13b-easel-starry.png")
print("ok")
