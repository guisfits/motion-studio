"""Regenerate this film's pictures locally: Z-Image Turbo (mflux) + rembg birefnet cut-outs.

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
        try:
            subprocess.run(["mflux-generate-z-image-turbo", "--prompt", it["prompt"], "--width", str(it["w"]),
                            "--height", str(it["h"]), "--steps", str(spec["steps"]), "--seed", str(it["seed"]),
                            "-q", "8", "--output", raw], check=True, capture_output=True)
        finally:
            release()
        print(f"{it['id']}: generated {time.time() - t:.0f}s", flush=True)
    if it["cut"] and (only or not os.path.exists(cut)):
        subprocess.run(["rembg", "i", "-m", "birefnet-general", raw, cut], check=True, capture_output=True)
        # Trim the cut-out to its pixels, so a piece is placed by its own bounds, not the canvas.
        subprocess.run(["magick", cut, "-alpha", "on", "-channel", "A", "-threshold", "9%", "+channel", "-trim", "+repage", cut], check=False)
        print(f"{it['id']}: cut", flush=True)
