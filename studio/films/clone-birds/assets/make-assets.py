"""clone-birds pictures: Z-Image Turbo (mflux) + rembg birefnet cut-outs, plus the cut-outs of the found PD photos (pd/).

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
        cut_out(raw, cut, harden=(90, 200) if it["id"] in ("G03-crowd", "G07-placards") else None)
        print(f"{it['id']}: cut", flush=True)

# Found PD photos (pd/): the same rembg route; "crop" = (left, top, right, bottom) taken before the cut.
def key_capitol(src, dst):
    """The Capitol against a blue sky: key the sky out by colour (rembg drops the wings behind the trees), keep the
    building + trees down to y=1150 (the steps), close the speckle holes the white walls leave."""
    import numpy as np
    from PIL import Image, ImageFilter
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(int)
    m = ~((a[..., 2] > a[..., 0] + 18) & (a[..., 2] > a[..., 1] + 4))
    m[1150:] = False
    mi = Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.MedianFilter(5))
    mi = mi.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.MinFilter(15)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert("RGBA")
    out.putalpha(mi)
    out.crop(out.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()).save(dst)


FOUND = [
    {"id": "P01-capitol-west-front", "key": "capitol"},
    {"id": "P02-pigeon-wporg-cc0"},
]
for it in FOUND:
    if only and it["id"] not in only:
        continue
    src = os.path.join(HERE, "pd", it["id"] + ".jpg")
    cut = os.path.join(gen, it["id"] + "-cut.png")
    if only or not os.path.exists(cut):
        if it.get("key") == "capitol":
            key_capitol(src, cut)
        else:
            cut_out(src, cut, it.get("crop"))
        print(f"{it['id']}: cut", flush=True)

# P06 sky plate: portrait crop of the found cc0 sky photo, scaled to the render frame.
sky = os.path.join(gen, "P06-sky-plate.png")
if only or not os.path.exists(sky):
    from PIL import Image
    im = Image.open(os.path.join(HERE, "pd", "P06-sky-wporg-cc0.jpg"))
    w = int(im.height * 1080 / 1920)
    im.crop((700, 0, 700 + w, im.height)).resize((1080, 1920), Image.LANCZOS).save(sky)
    print("P06-sky-plate: cropped", flush=True)
