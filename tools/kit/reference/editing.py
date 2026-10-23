"""Measure the editing of one video: shots, cut types, camera motion per shot.

uv run --with opencv-python-headless --with numpy editing.py <video.mp4> <out-dir>

Writes <out>/shots.json and <out>/cuts/cut-NN.jpg (frames -2,-1 | +0,+1 around each cut) and
<out>/shots/shot-NN.jpg (first | middle | last frame). Numbers, not opinions: the study agents read
these to describe how the piece is edited.
"""
import json, os, sys
import cv2
import numpy as np

src, out = sys.argv[1], sys.argv[2]
os.makedirs(f"{out}/cuts", exist_ok=True)
os.makedirs(f"{out}/shots", exist_ok=True)
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS) or 30
frames = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    h, w = f.shape[:2]
    s = 360 / max(h, w)
    frames.append(cv2.resize(f, (int(w * s), int(h * s))))
n = len(frames)
if n < 2:
    json.dump({"error": "no frames"}, open(f"{out}/shots.json", "w")); sys.exit()

def hist(f):
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    hh = cv2.calcHist([hsv], [0, 1], None, [32, 32], [0, 180, 0, 256])
    return cv2.normalize(hh, hh).flatten()

H = [hist(f) for f in frames]
gray = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
corr = [1.0] + [float(cv2.compareHist(H[i - 1], H[i], cv2.HISTCMP_CORREL)) for i in range(1, n)]
pix = [0.0] + [float(np.mean(cv2.absdiff(gray[i - 1], gray[i]))) / 255 for i in range(1, n)]

# Hard cut: a sharp drop in colour correlation or a big pixel jump on one frame.
# A cut changes what is on screen: the frame 3 before and 2 after differ a lot, not just one step
# of a posterized (12 fps) move. Collage cuts often keep the palette, so colour alone is not enough.
def far(i):
    """Residual change between frame i-3 and i+2 after undoing the camera move between them."""
    a, b = gray[max(0, i - 3)], gray[min(n - 1, i + 2)]
    p0 = cv2.goodFeaturesToTrack(a, 300, 0.01, 6)
    if p0 is not None and len(p0) >= 12:
        p1, st, _ = cv2.calcOpticalFlowPyrLK(a, b, p0, None)
        g = st.flatten() == 1
        if g.sum() >= 12:
            M, inl = cv2.estimateAffinePartial2D(p0[g], p1[g], method=cv2.RANSAC, ransacReprojThreshold=2.0)
            if M is not None and inl is not None and inl.mean() > 0.5:
                a = cv2.warpAffine(a, M, (b.shape[1], b.shape[0]), borderMode=cv2.BORDER_REPLICATE)
    return float(np.mean(cv2.absdiff(a, b))) / 255
cuts = [i for i in range(1, n) if corr[i] < 0.5 or (pix[i] > 0.08 and far(i) > 0.12)]
merged = []
for c in cuts:
    if not merged or c - merged[-1] > 3:
        merged.append(c)
bounds = [0] + merged + [n]

def motion(a, b):
    """Similarity transform a->b: dx, dy (px at 360), scale, rotation (deg)."""
    p0 = cv2.goodFeaturesToTrack(a, 200, 0.01, 6)
    if p0 is None or len(p0) < 8:
        return None
    p1, st, _ = cv2.calcOpticalFlowPyrLK(a, b, p0, None)
    good = st.flatten() == 1
    if good.sum() < 8:
        return None
    M, inl = cv2.estimateAffinePartial2D(p0[good], p1[good], method=cv2.RANSAC, ransacReprojThreshold=1.5)
    # Camera motion moves most of the frame together; pieces moving alone are not the camera.
    if M is None or inl is None or inl.mean() < 0.6:
        return (0.0, 0.0, 1.0, 0.0)
    sc = float(np.hypot(M[0, 0], M[1, 0]))
    rot = float(np.degrees(np.arctan2(M[1, 0], M[0, 0])))
    if abs(rot) < 0.05: rot = 0.0
    return float(M[0, 2]), float(M[1, 2]), sc, rot

shots = []
for k in range(len(bounds) - 1):
    s0, s1 = bounds[k], bounds[k + 1]
    m = [motion(gray[i - 1], gray[i]) for i in range(s0 + 1, s1)]
    m = [x for x in m if x]
    zoom = float(np.prod([x[2] for x in m])) if m else 1.0
    pan = (float(sum(x[0] for x in m)), float(sum(x[1] for x in m))) if m else (0.0, 0.0)
    rot = float(sum(x[3] for x in m)) if m else 0.0
    speed = [abs(x[2] - 1) * 360 + np.hypot(x[0], x[1]) for x in m]
    still = sum(1 for v in speed if v < 0.15)
    # Stepped (posterized) motion: moving frames alternate with frozen ones.
    alternations = sum(1 for i in range(1, len(speed)) if (speed[i] < 0.15) != (speed[i - 1] < 0.15))
    peak = (int(np.argmax(speed)) / max(1, len(speed) - 1)) if speed and max(speed) > 0.3 else None
    kind = []
    if abs(zoom - 1) > 0.04: kind.append("push-in" if zoom > 1 else "pull-out")
    if np.hypot(*pan) > 25: kind.append("pan")
    if abs(rot) > 1.5: kind.append("rotate")
    if not kind: kind.append("hold" if still > 0.7 * max(1, len(speed)) else "drift")
    shots.append({
        "shot": k + 1, "start": round(s0 / fps, 2), "end": round(s1 / fps, 2), "dur": round((s1 - s0) / fps, 2),
        "camera": kind, "zoom": round(zoom, 3), "pan_px360": [round(pan[0]), round(pan[1])], "rot_deg": round(rot, 1),
        "peak_at": None if peak is None else round(peak, 2),
        "stepped": bool(len(speed) > 6 and alternations > 0.4 * len(speed)),
        "still_frac": round(still / max(1, len(speed)), 2),
    })
    mid = (s0 + s1) // 2
    strip = np.hstack([frames[s0], frames[mid], frames[max(s0, s1 - 1)]])
    cv2.imwrite(f"{out}/shots/shot-{k+1:02d}.jpg", strip, [cv2.IMWRITE_JPEG_QUALITY, 70])

for j, c in enumerate(merged, 1):
    idx = [max(0, c - 2), max(0, c - 1), c, min(n - 1, c + 1)]
    cv2.imwrite(f"{out}/cuts/cut-{j:02d}.jpg", np.hstack([frames[i] for i in idx]), [cv2.IMWRITE_JPEG_QUALITY, 70])

# Soft transitions: a run of mid-level change without a hard cut (dissolve, wipe, whip).
soft = []
i = 1
while i < n:
    if 0.04 < pix[i] <= 0.18 and corr[i] >= 0.55:
        j = i
        while j < n and pix[j] > 0.04 and corr[j] >= 0.55: j += 1
        if j - i >= 4: soft.append({"start": round(i / fps, 2), "end": round(j / fps, 2)})
        i = j
    i += 1

durs = [s["dur"] for s in shots]
json.dump({
    "fps": round(fps, 2), "duration": round(n / fps, 2), "shots": len(shots),
    "asl": round(float(np.mean(durs)), 2), "median_shot": round(float(np.median(durs)), 2),
    "cuts_per_10s": round(len(merged) / (n / fps) * 10, 2), "soft_transitions": soft,
    "camera_mix": {k: sum(1 for s in shots if k in s["camera"]) for k in ["push-in", "pull-out", "pan", "rotate", "drift", "hold"]},
    "stepped_shots": sum(1 for s in shots if s["stepped"]),
    "shot_list": shots,
}, open(f"{out}/shots.json", "w"), indent=1)
print(f"{len(shots)} shots, ASL {np.mean(durs):.2f}s, {len(soft)} soft transitions")
