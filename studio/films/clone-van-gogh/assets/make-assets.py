"""Regenerate this film's pictures locally: Z-Image Turbo (mflux) + rembg birefnet cut-outs.

`python3 -I assets/make-assets.py [id ...]` — skips files that exist; pass ids to redo them.
Prompts and seeds live in prompts.json, so the gitignored gen/ folder is rebuilt from text.
"""
import json, os, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
spec = json.load(open(os.path.join(HERE, "prompts.json")))
gen = os.path.join(HERE, "gen")
os.makedirs(gen, exist_ok=True)
only = set(sys.argv[1:])
for it in spec["items"]:
    if only and it["id"] not in only:
        continue
    raw = os.path.join(gen, f"{it['id']}.png")
    cut = os.path.join(gen, f"{it['id']}-cut.png")
    if only or not os.path.exists(raw):
        t = time.time()
        subprocess.run(["mflux-generate-z-image-turbo", "--prompt", it["prompt"], "--width", str(it["w"]),
                        "--height", str(it["h"]), "--steps", str(spec["steps"]), "--seed", str(it["seed"]),
                        "-q", "8", "--output", raw], check=True, capture_output=True)
        print(f"{it['id']}: generated {time.time() - t:.0f}s", flush=True)
    if it["cut"] and (only or not os.path.exists(cut)):
        subprocess.run(["rembg", "i", "-m", "birefnet-general", raw, cut], check=True, capture_output=True)
        print(f"{it['id']}: cut", flush=True)
