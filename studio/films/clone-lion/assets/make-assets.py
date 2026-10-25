"""clone-lion pictures: Z-Image Turbo (mflux) + rembg birefnet cut-outs, plus the cut-outs of the found PD photos (pd/).

`python3 -I assets/make-assets.py [id ...]` — skips files that exist; pass ids to redo them.
Prompts and seeds live in prompts*.json (one file per builder, same shape), so the gitignored
gen/ folder is rebuilt from text. One generation at a time machine-wide (mkdir lock with the holder PID, see
tools/heavy-lock.sh), like tools/render.sh: parallel agents queue instead of fighting over the GPU.
"""
import glob, json, os, shutil, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
LOCK = os.environ.get("MOTION_STUDIO_LOCK", "/tmp/motion-studio-render.lock")  # the heavy-job lock of tools/heavy-lock.sh


def read(name):
    try:
        return open(os.path.join(LOCK, name)).read().strip()
    except OSError:
        return ""


def alive(pid):
    try:
        os.kill(int(pid), 0)
    except ProcessLookupError:
        return False
    except (PermissionError, ValueError):
        return True
    return True


def acquire():
    told = False
    while True:
        try:
            os.mkdir(LOCK)
            break
        except FileExistsError:
            holder = read("pid")
            if holder and not alive(holder):
                stale = f"{LOCK}.stale.{os.getpid()}"
                if read("pid") == holder:
                    try:
                        os.rename(LOCK, stale)
                    except OSError:
                        continue
                    shutil.rmtree(stale, ignore_errors=True)
                    print(f"heavy-job lock: removed stale lock of dead PID {holder}", file=sys.stderr, flush=True)
                continue
            if holder and not told:
                print(f"waiting for heavy-job lock held by PID {holder} ({read('cmd') or 'unknown'})", file=sys.stderr, flush=True)
                told = True
            time.sleep(3)
    with open(os.path.join(LOCK, "pid"), "w") as f:
        f.write(str(os.getpid()))
    with open(os.path.join(LOCK, "cmd"), "w") as f:
        f.write("make-assets.py " + " ".join(sys.argv[1:]))


def release():
    if read("pid") == str(os.getpid()):
        shutil.rmtree(LOCK, ignore_errors=True)


def cut_out(src, dst, crop=None, harden=None):
    from PIL import Image  # rembg's environment carries Pillow
    if crop:
        tmp = dst + ".crop.png"
        Image.open(src).crop(crop).save(tmp)
        src = tmp
    subprocess.run(["rembg", "i", "-m", "birefnet-general", src, dst], check=True, capture_output=True)
    if crop:
        os.remove(src)
    if harden:  # (lo, hi): alpha below lo goes to 0, above hi to 255; drops the semi-transparent hair/edge smudge
        lo, hi = harden
        im = Image.open(dst)
        a = im.getchannel("A").point(lambda v: 0 if v <= lo else 255 if v >= hi else int((v - lo) * 255 / (hi - lo)))
        im.putalpha(a)
        im.save(dst)
    # Trim the cut-out to its pixels, so a piece is placed by its own bounds, not the canvas.
    im = Image.open(dst)
    im.crop(im.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()).save(dst)


HARDEN = ()  # ids whose alpha edge is hardened after rembg
spec = {"steps": 9, "items": []}
for f in sorted(glob.glob(os.path.join(HERE, "prompts*.json"))):
    part = json.load(open(f))
    spec["steps"] = part.get("steps", spec["steps"])
    spec["items"] += part["items"]
gen = os.path.join(HERE, "gen")
os.makedirs(gen, exist_ok=True)
only = set(sys.argv[1:])
for it in spec["items"]:
    if only and it["id"] not in only:
        continue
    raw = os.path.join(gen, f"{it['id']}.png")
    cut = os.path.join(gen, f"{it['id']}-cut.png")
    if only or not os.path.exists(raw):
        acquire()
        t = time.time()
        if it.get("model") == "qwen":  # fallback, once, when Z-Image fails the picture
            cmd = ["mflux-generate-qwen", "--model", "mflux-community/qwen-image-2512-mflux-q4", "--base-model", "qwen-image",
                   "--steps", "30", "--prompt", it["prompt"], "--width", str(it["w"]), "--height", str(it["h"]),
                   "--seed", str(it["seed"]), "--output", raw]
        else:
            cmd = ["mflux-generate-z-image-turbo", "--prompt", it["prompt"], "--width", str(it["w"]),
                   "--height", str(it["h"]), "--steps", str(spec["steps"]), "--seed", str(it["seed"]),
                   "-q", "8", "--output", raw]
        try:
            subprocess.run(cmd, check=True, capture_output=True)
        finally:
            release()
        print(f"{it['id']}: generated {time.time() - t:.0f}s ({it.get('model', 'z-image-turbo')})", flush=True)
    if it["cut"] and (only or not os.path.exists(cut)):
        cut_out(raw, cut, harden=(90, 200) if it["id"] in HARDEN else None)
        print(f"{it['id']}: cut", flush=True)

# Found PD photos (pd/): the same rembg route. crop = (left, top, right, bottom) taken before the cut;
# flip = mirror first so the animal faces right.
FOUND = [
    {"id": "P01-lion-male-walking", "flip": True},
    {"id": "P02-flock-frontal-mixed"},
    {"id": "P05-ewe-brown-blackface"},
]
for it in FOUND:
    if only and it["id"] not in only:
        continue
    src = os.path.join(HERE, "pd", it["id"] + ".jpg")
    cut = os.path.join(gen, it["id"] + "-cut.png")
    if only or not os.path.exists(cut):
        if it.get("flip"):
            from PIL import Image, ImageOps
            flipped = os.path.join(HERE, "pd", it["id"] + "-flip.png")
            ImageOps.mirror(Image.open(src).convert("RGB")).save(flipped)
            src = flipped
        cut_out(src, cut, it.get("crop"))
        print(f"{it['id']}: cut", flush=True)


# T01 torn paper strip: a horizontal strip cut from the ambientCG Paper002 colour map (CC0), warmed to cream, with
# torn top/bottom edges (seeded value noise) and a paler fibre rim where the paper tore.
def paper_strip(src, dst, w=1500, h=330, seed=7):
    import numpy as np
    from PIL import Image, ImageFilter
    rng = np.random.default_rng(seed)
    tex = Image.open(src).convert("RGB")
    tex = tex.crop((0, 600, tex.width, 600 + int(tex.width * h / w))).resize((w, h), Image.LANCZOS)
    a = np.asarray(tex).astype(float)
    a = a * np.array([1.16, 1.12, 1.02])  # warm the grey-cream toward cream
    a = np.clip(a * (236 / a.mean()), 0, 255)  # lift the mean so it reads as light cream paper
    pad = 26

    def edge(n, amp):  # rough torn line: low-frequency wander plus fine tooth
        xs = np.arange(n)
        low = np.interp(xs, np.linspace(0, n, n // 90 + 2), rng.normal(0, amp, n // 90 + 2))
        mid = np.interp(xs, np.linspace(0, n, n // 14 + 2), rng.normal(0, amp * 0.35, n // 14 + 2))
        return low + mid + rng.normal(0, 1.2, n)

    top, bot = pad + edge(w, 9), h - pad + edge(w, 9)
    yy = np.arange(h)[:, None]
    inside = (yy > top[None, :]) & (yy < bot[None, :])
    dist = np.minimum(yy - top[None, :], bot[None, :] - yy)  # distance to the nearest torn edge
    rim = np.clip(1 - dist / 9, 0, 1)[..., None]  # fibre rim: paler and slightly warmer at the tear
    a = a * (1 - rim * 0.0) + rim * (np.array([250, 245, 232]) - a) * 0.75
    out = np.dstack([a, np.where(inside, 255, 0)]).astype("uint8")
    im = Image.fromarray(out, "RGBA")
    alpha = im.getchannel("A").filter(ImageFilter.GaussianBlur(0.7))
    im.putalpha(alpha)
    im.crop(alpha.point(lambda v: 255 if v > 24 else 0).getbbox()).save(dst)


strip = os.path.join(gen, "T01-paper-strip.png")
if only and "T01-paper-strip" in only or not only and not os.path.exists(strip):
    paper_strip(os.path.join(HERE, "pd", "T01-paper002-ambientcg-color.jpg"), strip)
    print("T01-paper-strip: built", flush=True)


# contact.png: every cut-out on mid-grey (a pale-on-pale or dark-on-dark failure shows as a bitten edge), labelled.
def contact(dst):
    from PIL import Image, ImageDraw
    files = sorted(glob.glob(os.path.join(gen, "*-cut.png")) + [strip])
    cell, cols = 420, 4
    sheet = Image.new("RGB", (cell * cols, cell * ((len(files) + cols - 1) // cols)), (128, 128, 128))
    d = ImageDraw.Draw(sheet)
    for k, f in enumerate(files):
        im = Image.open(f).convert("RGBA")
        im.thumbnail((cell - 20, cell - 40))
        x, y = (k % cols) * cell, (k // cols) * cell
        sheet.paste(im, (x + 10, y + 10), im)
        d.text((x + 10, y + cell - 22), os.path.basename(f).replace("-cut.png", "").replace(".png", ""), fill=(255, 255, 0))
    sheet.save(dst)


contact(os.path.join(HERE, "contact.png"))
