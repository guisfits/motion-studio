#!/usr/bin/env python3
"""Turns "the motion feels wrong" into numbers: per-shot camera motion, object motion and look.

  motion-measure.py <video> [--shots scene.ts|shots.json] --out <dir>
  motion-measure.py --compare <ref_dir> <clone_dir> [--out <dir>]

Measure writes <dir>/frames.csv (one row per frame) and <dir>/shots.json (per-shot summaries).
Compare reads two such dirs and writes compare.md (ref vs clone, one row per shot, ratio and
flag) plus zoom-<id>.png / energy-<id>.png curve plots.

CPU only. Run with the venv that has OpenCV: /Users/guisfits/llm-models/venv_mlx/bin/python -I
Units: pixels are native video pixels; zoom is % of frame scale; "frame" is one video frame.
"""

import argparse
import csv
import json
import math
import re
import sys
from pathlib import Path

import cv2
import numpy as np

# Width of the grayscale image fed to feature matching, and to optical flow / frame diff.
FEATURE_WIDTH = 540
FLOW_WIDTH = 270
# A zoom step above this in one frame counts as a punch-in.
PUNCH_STEP = 0.03
# Residual motion above this (native px/frame) counts a pixel as "moving".
MOVING_PX = 4.0
# Motion has settled once energy stays below this fraction of its peak.
SETTLE_FRACTION = 0.10
# Residual energy below this (native px/frame) is noise, not motion.
ENERGY_FLOOR = 0.3

FRAME_COLUMNS = [
    "frame",
    "shot",
    "method",
    "inliers",
    "scale",
    "rot_deg",
    "tx",
    "ty",
    "zoom_step_pct",
    "obj_energy",
    "obj_p99",
    "obj_moving_frac",
    "diff_energy",
    "sharp",
    "sharp_edge",
    "sharp_center",
    "contrast",
    "saturation",
    "warmth",
    "vignette",
    "grain",
    "black_level",
]

NAN = float("nan")


# ---------------------------------------------------------------- shots


def parse_shots(path):
    """Shot spans from a scene.ts SHOTS array (`to` exclusive) or a JSON list of {id,from,to}."""
    text = Path(path).read_text()
    if str(path).endswith(".json"):
        return [
            {
                "id": s["id"],
                "from": int(s["from"]),
                "to": int(s["to"]),
                "name": s.get("name", ""),
            }
            for s in json.loads(text)
        ]
    pattern = re.compile(
        r'\{\s*id:\s*"([^"]+)"\s*,\s*from:\s*(\d+)\s*,\s*to:\s*(\d+)\s*(?:,\s*name:\s*"((?:[^"\\]|\\.)*)")?'
    )
    shots = [
        {"id": m[1], "from": int(m[2]), "to": int(m[3]), "name": m[4] or ""}
        for m in pattern.finditer(text)
    ]
    if not shots:
        raise SystemExit(f"no shots found in {path}")
    return shots


def shot_ids_at(shots, frame):
    return "+".join(s["id"] for s in shots if s["from"] <= frame < s["to"])


# ---------------------------------------------------------------- per-frame measures


def _gauss_grain_norm(sigma):
    """Std of (noise - blur(noise)) relative to the noise std, for a Gaussian blur of `sigma`."""
    radius = int(math.ceil(sigma * 4))
    x = np.arange(-radius, radius + 1)
    g = np.exp(-x * x / (2 * sigma * sigma))
    g /= g.sum()
    return math.sqrt(1 - 2 * g[radius] ** 2 + (g**2).sum() ** 2)


GRAIN_SIGMA = 1.2
GRAIN_NORM = _gauss_grain_norm(GRAIN_SIGMA)


def _hist_percentiles(gray, ps):
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).ravel()
    cdf = np.cumsum(hist) / hist.sum()
    return [float(np.searchsorted(cdf, p / 100.0)) for p in ps]


def look_measures(bgr):
    """Still-image look of one frame: sharpness, depth-of-field proxy, tone, colour, vignette, grain."""
    h, w = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    # Laplacian variance overall, centre box and the outer 20 % frame (centre = middle 60 %).
    lap = cv2.Laplacian(gray, cv2.CV_32F)
    y0, y1, x0, x1 = int(h * 0.2), int(h * 0.8), int(w * 0.2), int(w * 0.8)
    centre = lap[y0:y1, x0:x1].astype(np.float64)
    n_c = centre.size
    n_all = lap.size
    s_c, q_c = centre.sum(), (centre**2).sum()
    lap64 = lap.astype(np.float64)
    s_a, q_a = lap64.sum(), (lap64**2).sum()
    var_c = q_c / n_c - (s_c / n_c) ** 2
    n_e = n_all - n_c
    var_e = (q_a - q_c) / n_e - ((s_a - s_c) / n_e) ** 2
    var_a = q_a / n_all - (s_a / n_all) ** 2

    p1, p5, p95 = _hist_percentiles(gray, [1, 5, 95])

    b, g, r, _ = cv2.mean(bgr)
    sat = float(cv2.mean(cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)[:, :, 1])[0]) / 255.0

    # Vignette: mean luma of the four corner patches over the centre patch.
    ph, pw = max(1, int(h * 0.15)), max(1, int(w * 0.15))
    corners = [gray[:ph, :pw], gray[:ph, -pw:], gray[-ph:, :pw], gray[-ph:, -pw:]]
    corner_mean = float(np.mean([c.mean() for c in corners]))
    ch0, ch1, cw0, cw1 = int(h * 0.35), int(h * 0.65), int(w * 0.35), int(w * 0.65)
    centre_mean = float(gray[ch0:ch1, cw0:cw1].mean())
    vignette = corner_mean / max(centre_mean, 1.0)

    return {
        "sharp": float(var_a),
        "sharp_edge": float(var_e),
        "sharp_center": float(var_c),
        "contrast": p95 - p5,
        "saturation": sat,
        "warmth": float(r - b),
        "vignette": vignette,
        "grain": _grain(gray),
        "black_level": p1,
    }


def _grain(gray):
    """High-pass residual std over flat, unclipped regions (compression-flattened video reads low)."""
    g = gray.astype(np.float32)
    low = cv2.GaussianBlur(g, (0, 0), GRAIN_SIGMA)
    smooth = cv2.GaussianBlur(g, (0, 0), 3.0)
    grad = (
        cv2.magnitude(
            cv2.Sobel(smooth, cv2.CV_32F, 1, 0), cv2.Sobel(smooth, cv2.CV_32F, 0, 1)
        )
        / 8.0
    )
    flat = ((grad < 1.0) & (smooth > 8) & (smooth < 247)).astype(np.uint8)
    flat = cv2.erode(flat, np.ones((7, 7), np.uint8))
    if flat.sum() < 0.005 * flat.size:
        return NAN
    hp = (g - low)[flat > 0]
    return float(hp.std() / GRAIN_NORM)


# ---------------------------------------------------------------- camera (global similarity)


class CameraEstimator:
    """Frame-to-frame similarity transform: ORB, then AKAZE, then ECC when feature matching fails."""

    def __init__(self):
        self.orb = cv2.ORB_create(nfeatures=2500, fastThreshold=8)
        self.akaze = cv2.AKAZE_create()
        self.matcher = cv2.BFMatcher(cv2.NORM_HAMMING)

    def estimate(self, prev_gray, cur_gray, native_w):
        """Returns (A 2x2, t in native px, method, inliers); A and t map prev -> cur."""
        k = native_w / prev_gray.shape[1]
        for name, det in (("orb", self.orb), ("akaze", self.akaze)):
            res = self._features(det, prev_gray, cur_gray)
            if res is not None:
                A, t, inl = res
                return A, t * k, name, inl
        res = self._ecc(prev_gray, cur_gray)
        if res is not None:
            A, t = res
            return A, t * k, "ecc", 0
        return np.eye(2), np.zeros(2), "none", 0

    def _features(self, det, a, b):
        ka, da = det.detectAndCompute(a, None)
        kb, db = det.detectAndCompute(b, None)
        if da is None or db is None or len(ka) < 12 or len(kb) < 12:
            return None
        matches = self.matcher.knnMatch(da, db, k=2)
        good = [
            m[0] for m in matches if len(m) == 2 and m[0].distance < 0.8 * m[1].distance
        ]
        if len(good) < 12:
            return None
        pa = np.float32([ka[m.queryIdx].pt for m in good])
        pb = np.float32([kb[m.trainIdx].pt for m in good])
        M, inl = cv2.estimateAffinePartial2D(
            pa,
            pb,
            method=cv2.RANSAC,
            ransacReprojThreshold=2.5,
            maxIters=3000,
            confidence=0.995,
        )
        if M is None:
            return None
        n_in = int(inl.sum())
        if n_in < 12 or n_in < 0.25 * len(good):
            return None
        A = M[:, :2]
        s = math.sqrt(abs(np.linalg.det(A)))
        if not 0.5 < s < 2.0:
            return None
        return A, M[:, 2], n_in

    def _ecc(self, a, b):
        small = cv2.resize(
            a, (a.shape[1] // 2, a.shape[0] // 2), interpolation=cv2.INTER_AREA
        )
        small_b = cv2.resize(
            b, (b.shape[1] // 2, b.shape[0] // 2), interpolation=cv2.INTER_AREA
        )
        warp = np.eye(2, 3, dtype=np.float32)
        criteria = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 60, 1e-5)
        try:
            _, warp = cv2.findTransformECC(
                small, small_b, warp, cv2.MOTION_AFFINE, criteria, None, 5
            )
        except cv2.error:
            return None
        A = warp[:, :2].astype(np.float64)
        s = math.sqrt(abs(np.linalg.det(A)))
        if not 0.5 < s < 2.0:
            return None
        return A, warp[:, 2].astype(np.float64) * 2.0


def decompose(A, t, w, h):
    """(scale, rotation deg, centre-point translation) of a prev->cur similarity about the frame centre."""
    scale = math.sqrt(abs(np.linalg.det(A)))
    rot = math.degrees(math.atan2(A[1, 0], A[0, 0]))
    c = np.array([w / 2.0, h / 2.0])
    moved = A @ c + t - c
    return scale, rot, float(moved[0]), float(moved[1])


# ---------------------------------------------------------------- object motion (flow minus camera)


def residual_flow(prev_small, cur_small, A, t_native, native_w):
    """Farneback flow minus the camera's predicted flow, in native px/frame magnitudes."""
    sh, sw = prev_small.shape
    k = native_w / sw
    flow = cv2.calcOpticalFlowFarneback(
        prev_small, cur_small, None, 0.5, 4, 21, 3, 5, 1.1, 0
    )
    ys, xs = np.mgrid[0:sh, 0:sw].astype(np.float32)
    px, py = xs * k, ys * k
    qx = A[0, 0] * px + A[0, 1] * py + t_native[0]
    qy = A[1, 0] * px + A[1, 1] * py + t_native[1]
    cam = np.dstack([(qx - px) / k, (qy - py) / k]).astype(np.float32)
    res = (flow - cam) * k
    # Farneback cannot track beyond about half the frame; larger values are artefacts, not speed.
    mag = np.minimum(np.sqrt(res[:, :, 0] ** 2 + res[:, :, 1] ** 2), 0.5 * native_w)
    return (
        float(mag.mean()),
        float(np.percentile(mag, 99)),
        float((mag > MOVING_PX).mean()),
    )


# ---------------------------------------------------------------- video pass


def analyze_frames(frames, progress=None):
    """Yields one measures dict per BGR frame (frame 0 has identity camera and zero motion)."""
    cam = CameraEstimator()
    prev_feat = prev_flow = None
    for i, bgr in enumerate(frames):
        h, w = bgr.shape[:2]
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        feat = (
            cv2.resize(
                gray,
                (FEATURE_WIDTH, int(round(h * FEATURE_WIDTH / w))),
                interpolation=cv2.INTER_AREA,
            )
            if w > FEATURE_WIDTH
            else gray
        )
        flow = (
            cv2.resize(
                gray,
                (FLOW_WIDTH, int(round(h * FLOW_WIDTH / w))),
                interpolation=cv2.INTER_AREA,
            )
            if w > FLOW_WIDTH
            else gray
        )

        row = {"frame": i}
        if prev_feat is None:
            row.update(
                method="first",
                inliers=0,
                scale=1.0,
                rot_deg=0.0,
                tx=0.0,
                ty=0.0,
                zoom_step_pct=0.0,
                obj_energy=0.0,
                obj_p99=0.0,
                obj_moving_frac=0.0,
                diff_energy=0.0,
            )
        else:
            A, t, method, inl = cam.estimate(prev_feat, feat, w)
            scale, rot, tx, ty = decompose(A, t, w, h)
            energy, p99, frac = residual_flow(prev_flow, flow, A, t, w)
            diff = float(cv2.absdiff(prev_flow, flow).mean())
            row.update(
                method=method,
                inliers=inl,
                scale=scale,
                rot_deg=rot,
                tx=tx,
                ty=ty,
                zoom_step_pct=(scale - 1.0) * 100.0,
                obj_energy=energy,
                obj_p99=p99,
                obj_moving_frac=frac,
                diff_energy=diff,
            )
        row.update(look_measures(bgr))
        yield row
        prev_feat, prev_flow = feat, flow
        if progress and i % 50 == 0:
            progress(i)


def read_video(path):
    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        raise SystemExit(f"cannot open {path}")
    meta = {
        "fps": cap.get(cv2.CAP_PROP_FPS),
        "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
        "n_frames_header": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
    }

    def gen():
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            yield frame
        cap.release()

    return meta, gen()


# ---------------------------------------------------------------- shot summaries


def _arr(rows, key, lo, hi):
    return np.array([rows[i][key] for i in range(lo, hi)], dtype=np.float64)


def _nanmean(a):
    a = a[~np.isnan(a)]
    return float(a.mean()) if a.size else NAN


def summarize_shot(rows, shot):
    """Per-shot summary metrics. Motion uses frames from+1..to-1: frame `from` compares against the previous shot."""
    n = len(rows)
    lo, hi = max(0, shot["from"]), min(n, shot["to"])
    m_lo = lo + 1
    out = {
        "id": shot["id"],
        "name": shot.get("name", ""),
        "from": lo,
        "to": hi,
        "n_frames": hi - lo,
    }
    if hi - lo < 1:
        return out
    out.update(_camera_summary(rows, m_lo, hi))
    out.update(_object_summary(rows, m_lo, hi))
    out.update(_rhythm_summary(rows, m_lo, hi))
    out.update(_look_summary(rows, lo, hi))
    return out


def _camera_summary(rows, lo, hi):
    keys = [
        "total_zoom_pct",
        "zoom_speed_mean",
        "zoom_speed_peak",
        "zoom_peak_pos",
        "zoom_ease_t50",
        "punch_ins",
        "pan_total_px",
        "pan_speed_mean",
        "pan_speed_peak",
        "rot_total_deg",
        "camera_fail_frames",
    ]
    if hi - lo < 1:
        return {k: NAN for k in keys}
    scale = _arr(rows, "scale", lo, hi)
    tx, ty = _arr(rows, "tx", lo, hi), _arr(rows, "ty", lo, hi)
    rot = _arr(rows, "rot_deg", lo, hi)
    step = (scale - 1.0) * 100.0
    cum = (np.exp(np.cumsum(np.log(scale))) - 1.0) * 100.0
    total = float(cum[-1])
    speed = np.abs(step)
    smooth = (
        np.convolve(speed, np.ones(3) / 3, mode="same") if speed.size >= 3 else speed
    )
    peak_pos = float(np.argmax(smooth) / max(1, speed.size - 1))
    t50 = NAN
    if abs(total) > 0.5 and speed.size > 1:
        mid = cum[int(round((speed.size - 1) / 2))]
        t50 = float(mid / total)
    pan = np.hypot(tx, ty)
    fails = sum(1 for i in range(lo, hi) if rows[i]["method"] == "none")
    return {
        "total_zoom_pct": total,
        "zoom_speed_mean": float(speed.mean()),
        "zoom_speed_peak": float(speed.max()),
        "zoom_peak_pos": peak_pos,
        "zoom_ease_t50": t50,
        "punch_ins": int((step > PUNCH_STEP * 100).sum()),
        "pan_total_px": float(pan.sum()),
        "pan_speed_mean": float(pan.mean()),
        "pan_speed_peak": float(pan.max()),
        "rot_total_deg": float(rot.sum()),
        "camera_fail_frames": fails,
    }


def _object_summary(rows, lo, hi):
    keys = [
        "obj_energy_mean",
        "obj_energy_peak",
        "obj_energy_peak_pos",
        "obj_fastest_px_f",
        "obj_moving_frac",
        "obj_settle_frames",
    ]
    if hi - lo < 1:
        return {k: NAN for k in keys}
    energy = _arr(rows, "obj_energy", lo, hi)
    p99 = _arr(rows, "obj_p99", lo, hi)
    frac = _arr(rows, "obj_moving_frac", lo, hi)
    peak = float(energy.max())
    above = np.nonzero(energy >= max(SETTLE_FRACTION * peak, ENERGY_FLOOR))[0]
    settle = int(above[-1] + 1) if peak > ENERGY_FLOOR and above.size else 0
    return {
        "obj_energy_mean": float(energy.mean()),
        "obj_energy_peak": peak,
        "obj_energy_peak_pos": float(np.argmax(energy) / max(1, energy.size - 1)),
        "obj_fastest_px_f": float(p99.max()),
        "obj_moving_frac": float(frac.mean()),
        "obj_settle_frames": settle,
    }


def _rhythm_summary(rows, lo, hi):
    keys = ["diff_mean", "diff_peak", "diff_peak_pos", "diff_beats"]
    if hi - lo < 1:
        return {k: NAN for k in keys}
    d = _arr(rows, "diff_energy", lo, hi)
    med = float(np.median(d))
    beats = 0
    for i in range(d.size):
        left = d[i - 1] if i > 0 else -1
        right = d[i + 1] if i < d.size - 1 else -1
        if d[i] > left and d[i] >= right and d[i] > 2 * med and d[i] > 1.0:
            beats += 1
    return {
        "diff_mean": float(d.mean()),
        "diff_peak": float(d.max()),
        "diff_peak_pos": float(np.argmax(d) / max(1, d.size - 1)),
        "diff_beats": beats,
    }


def _look_summary(rows, lo, hi):
    sharp_e = _arr(rows, "sharp_edge", lo, hi)
    sharp_c = _arr(rows, "sharp_center", lo, hi)
    return {
        "sharp": _nanmean(_arr(rows, "sharp", lo, hi)),
        "dof_ratio": _nanmean(sharp_e) / max(_nanmean(sharp_c), 1e-6),
        "contrast": _nanmean(_arr(rows, "contrast", lo, hi)),
        "saturation": _nanmean(_arr(rows, "saturation", lo, hi)),
        "warmth": _nanmean(_arr(rows, "warmth", lo, hi)),
        "vignette": _nanmean(_arr(rows, "vignette", lo, hi)),
        "grain": _nanmean(_arr(rows, "grain", lo, hi)),
        "black_level": _nanmean(_arr(rows, "black_level", lo, hi)),
    }


# ---------------------------------------------------------------- measure command


def write_frames_csv(path, rows, shots):
    with open(path, "w", newline="") as fh:
        wr = csv.DictWriter(fh, fieldnames=FRAME_COLUMNS, extrasaction="ignore")
        wr.writeheader()
        for r in rows:
            r = dict(r)
            r["shot"] = shot_ids_at(shots, r["frame"])
            wr.writerow(
                {k: (f"{v:.5g}" if isinstance(v, float) else v) for k, v in r.items()}
            )


def _clean(obj):
    """NaN -> None so shots.json stays valid JSON."""
    if isinstance(obj, float) and math.isnan(obj):
        return None
    if isinstance(obj, dict):
        return {k: _clean(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_clean(v) for v in obj]
    return obj


def measure(video, shots_path, out_dir, quiet=False):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    meta, frames = read_video(video)
    log = (
        (lambda *_: None)
        if quiet
        else (lambda i: print(f"  frame {i}", file=sys.stderr, flush=True))
    )
    rows = list(analyze_frames(frames, progress=log))
    shots = (
        parse_shots(shots_path)
        if shots_path
        else [{"id": "ALL", "from": 0, "to": len(rows), "name": "whole video"}]
    )
    write_frames_csv(out / "frames.csv", rows, shots)
    summaries = [summarize_shot(rows, s) for s in shots]
    doc = {
        "video": str(video),
        "fps": meta["fps"],
        "width": meta["width"],
        "height": meta["height"],
        "n_frames": len(rows),
        "shots": summaries,
    }
    (out / "shots.json").write_text(json.dumps(_clean(doc), indent=2))
    return doc


# ---------------------------------------------------------------- compare

# key, label, group, eps (additive floor so near-zero metrics don't blow up the ratio), mode
# mode: "ratio" = clone/ref; "signed" = ratio on magnitudes, red if the sign flips; "diff" = absolute difference.
METRICS = [
    ("total_zoom_pct", "total zoom %", "Camera", 1.0, "signed"),
    ("zoom_speed_mean", "zoom mean %/f", "Camera", 0.05, "ratio"),
    ("zoom_speed_peak", "zoom peak %/f", "Camera", 0.2, "ratio"),
    ("zoom_peak_pos", "zoom peak at", "Camera", 0.1, "ratio"),
    ("zoom_ease_t50", "zoom done @50% time", "Camera", 0.1, "ratio"),
    ("punch_ins", "punch-ins", "Camera", 0.5, "ratio"),
    ("pan_speed_mean", "pan mean px/f", "Camera", 1.0, "ratio"),
    ("pan_speed_peak", "pan peak px/f", "Camera", 3.0, "ratio"),
    ("rot_total_deg", "rotation deg", "Camera", 1.0, "signed"),
    ("obj_energy_mean", "obj energy mean px/f", "Objects", 0.3, "ratio"),
    ("obj_energy_peak", "obj energy peak px/f", "Objects", 0.5, "ratio"),
    ("obj_fastest_px_f", "fastest obj px/f", "Objects", 2.0, "ratio"),
    ("obj_moving_frac", "moving fraction", "Objects", 0.01, "ratio"),
    ("obj_settle_frames", "settle frames", "Objects", 1.0, "ratio"),
    ("sharp", "sharpness", "Look", 5.0, "ratio"),
    ("dof_ratio", "edge/centre sharp", "Look", 0.05, "ratio"),
    ("contrast", "contrast p95-p5", "Look", 5.0, "ratio"),
    ("saturation", "saturation", "Look", 0.02, "ratio"),
    ("warmth", "warmth R-B", "Look", 0.0, "diff"),
    ("vignette", "vignette", "Look", 0.02, "ratio"),
    ("grain", "grain", "Look", 0.3, "ratio"),
    ("black_level", "black level", "Look", 3.0, "ratio"),
    ("diff_mean", "frame diff mean", "Rhythm", 0.5, "ratio"),
    ("diff_peak", "frame diff peak", "Rhythm", 1.0, "ratio"),
    ("diff_beats", "beats", "Rhythm", 0.5, "ratio"),
]
DIFF_RED, DIFF_ORANGE = 20.0, 8.0


def flag_for(mode, ref, clone, eps):
    """(ratio or None, flag) for one ref/clone pair. Flag is 🔴, 🟠 or ''."""
    if ref is None or clone is None:
        return None, ""
    if mode == "diff":
        d = abs(clone - ref)
        return None, "🔴" if d > DIFF_RED else "🟠" if d > DIFF_ORANGE else ""
    if (
        mode == "signed"
        and abs(ref) > eps
        and abs(clone) > eps
        and (ref > 0) != (clone > 0)
    ):
        return (abs(clone) + eps) / (abs(ref) + eps), "🔴"
    a, b = abs(ref) + eps, abs(clone) + eps
    ratio = b / a
    if ratio > 2 or ratio < 0.5:
        return ratio, "🔴"
    if ratio > 1.4 or ratio < 1 / 1.4:
        return ratio, "🟠"
    return ratio, ""


def _num(v):
    if v is None:
        return "-"
    if float(v).is_integer() and abs(v) < 1000:
        return f"{int(v)}"
    if abs(v) >= 100:
        return f"{v:.0f}"
    if abs(v) >= 10:
        return f"{v:.1f}"
    return f"{v:.2f}"


def _cell(mode, ref, clone, eps):
    ratio, flag = flag_for(mode, ref, clone, eps)
    if ref is None and clone is None:
        return "-", ""
    if ratio is None:
        tail = (
            f" (Δ{_num(clone - ref)})" if ref is not None and clone is not None else ""
        )
    else:
        tail = f" ×{ratio:.2f}"
    return f"{_num(ref)} → {_num(clone)}{tail} {flag}".strip(), flag


def _mismatch_warnings(ref_doc, clone_doc):
    """Warning lines when the two videos are not on the same clock or pixel grid.

    Every speed is per frame and every px is native, and both videos are cut by the same frame
    numbers: a clone at another rate or size flags differences that are only the units."""
    out = []
    rf, cf = ref_doc.get("fps"), clone_doc.get("fps")
    if rf and cf and abs(rf - cf) > 0.005 * rf:
        out.append(
            f"⚠️ Frame rates differ ({rf:g} vs {cf:g} fps): per-frame speeds, settle frames and the shot "
            "spans are not comparable. Render the clone at the reference's rate before reading this."
        )
    rw, cw = ref_doc.get("width"), clone_doc.get("width")
    if rw and cw and rw != cw:
        out.append(
            f"⚠️ Frame sizes differ ({rw} vs {cw} px wide): px metrics are native, so pan and object "
            f"speeds read ×{cw / rw:.2f} from size alone."
        )
    return out + [""] if out else []


def build_compare(ref_doc, clone_doc):
    ref = {s["id"]: s for s in ref_doc["shots"]}
    clone = {s["id"]: s for s in clone_doc["shots"]}
    ids = [s["id"] for s in ref_doc["shots"] if s["id"] in clone]
    lines = [
        "# Motion compare: reference vs clone",
        "",
        f"Reference `{ref_doc['video']}` ({ref_doc['n_frames']} f) vs clone `{clone_doc['video']}` ({clone_doc['n_frames']} f).",
        "Cells read `ref → clone ×ratio`. 🔴 = off by more than 2x (or under 0.5x), 🟠 = more than 1.4x (or under 0.71x). "
        "Warmth is an absolute difference (🔴 >20, 🟠 >8 levels). Zoom and rotation flag 🔴 when the direction flips. "
        "Small additive floors keep near-zero metrics from exploding the ratio.",
        "",
    ]
    lines += _mismatch_warnings(ref_doc, clone_doc)
    overview = [
        "## Overview",
        "",
        "| shot | name | 🔴 | 🟠 | worst metrics |",
        "|---|---|---|---|---|",
    ]
    per_shot_flags = {}
    for sid in ids:
        reds, oranges, worst = [], [], []
        for key, label, _g, eps, mode in METRICS:
            ratio, flag = flag_for(mode, ref[sid].get(key), clone[sid].get(key), eps)
            if flag == "🔴":
                reds.append(label)
                worst.append((abs(math.log(ratio)) if ratio else 9, label))
            elif flag == "🟠":
                oranges.append(label)
        worst.sort(reverse=True)
        per_shot_flags[sid] = (len(reds), len(oranges))
        overview.append(
            f"| {sid} | {ref[sid]['name'][:48]} | {len(reds)} | {len(oranges)} | "
            f"{', '.join(w[1] for w in worst[:4])} |"
        )
    lines += overview + [""]
    for group in ["Camera", "Objects", "Look", "Rhythm"]:
        cols = [m for m in METRICS if m[2] == group]
        lines += [
            f"## {group}",
            "",
            "| shot | " + " | ".join(m[1] for m in cols) + " |",
            "|---|" + "---|" * len(cols),
        ]
        for sid in ids:
            cells = [
                _cell(mode, ref[sid].get(key), clone[sid].get(key), eps)[0]
                for key, _l, _g, eps, mode in cols
            ]
            lines.append(f"| {sid} | " + " | ".join(cells) + " |")
        lines.append("")
    return "\n".join(lines), ids


def load_frames_csv(dir_):
    with open(Path(dir_) / "frames.csv") as fh:
        rows = list(csv.DictReader(fh))
    out = {}
    for key in rows[0]:
        if key in ("shot", "method"):
            continue
        out[key] = np.array(
            [float(r[key]) if r[key] not in ("", "nan") else NAN for r in rows]
        )
    return out


# ---------------------------------------------------------------- plots


def _line_plot(path, title, xlabel, ylabel, series):
    """series: [(label, x, y, BGR colour)]. Uses matplotlib when installed, else a plain OpenCV chart."""
    try:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        return _cv_plot(path, title, xlabel, ylabel, series)
    fig, ax = plt.subplots(figsize=(7, 3.4), dpi=110)
    for label, x, y, bgr in series:
        ax.plot(x, y, label=label, color=tuple(c / 255 for c in bgr[::-1]), lw=1.8)
    ax.set_title(title)
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    ax.grid(alpha=0.3)
    ax.legend()
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)


def _cv_plot(path, title, xlabel, ylabel, series):
    W, H, L, R, T, B = 760, 380, 70, 20, 40, 50
    img = np.full((H, W, 3), 255, np.uint8)
    xs = np.concatenate([np.asarray(s[1], float) for s in series])
    ys = np.concatenate([np.asarray(s[2], float) for s in series])
    ys = ys[~np.isnan(ys)]
    if xs.size == 0 or ys.size == 0:
        return
    x0, x1 = float(xs.min()), float(xs.max())
    y0, y1 = min(0.0, float(ys.min())), float(ys.max())
    if y1 - y0 < 1e-9:
        y1 = y0 + 1.0
    if x1 - x0 < 1e-9:
        x1 = x0 + 1.0
    px = lambda x: int(L + (x - x0) / (x1 - x0) * (W - L - R))
    py = lambda y: int(H - B - (y - y0) / (y1 - y0) * (H - T - B))
    font = cv2.FONT_HERSHEY_SIMPLEX
    for i in range(5):
        yv = y0 + (y1 - y0) * i / 4
        cv2.line(img, (L, py(yv)), (W - R, py(yv)), (225, 225, 225), 1)
        cv2.putText(
            img, f"{yv:.3g}", (4, py(yv) + 4), font, 0.4, (60, 60, 60), 1, cv2.LINE_AA
        )
    for i in range(6):
        xv = x0 + (x1 - x0) * i / 5
        cv2.putText(
            img,
            f"{xv:.0f}",
            (px(xv) - 8, H - B + 18),
            font,
            0.4,
            (60, 60, 60),
            1,
            cv2.LINE_AA,
        )
    cv2.rectangle(img, (L, T), (W - R, H - B), (120, 120, 120), 1)
    for n, (label, x, y, bgr) in enumerate(series):
        pts = [(px(a), py(b)) for a, b in zip(x, y) if not np.isnan(b)]
        if len(pts) > 1:
            cv2.polylines(img, [np.array(pts, np.int32)], False, bgr, 2, cv2.LINE_AA)
        cv2.putText(
            img, label, (L + 10 + 160 * n, T + 16), font, 0.5, bgr, 1, cv2.LINE_AA
        )
    cv2.putText(img, title, (L, 20), font, 0.55, (20, 20, 20), 1, cv2.LINE_AA)
    cv2.putText(
        img, xlabel, (W // 2 - 40, H - 10), font, 0.45, (60, 60, 60), 1, cv2.LINE_AA
    )
    cv2.putText(img, ylabel, (4, 36), font, 0.4, (60, 60, 60), 1, cv2.LINE_AA)
    cv2.imwrite(str(path), img)


REF_COLOUR, CLONE_COLOUR = (150, 90, 20), (30, 60, 220)


def plot_shot(out_dir, sid, ref_shot, clone_shot, ref_f, clone_f):
    """zoom-<id>.png (cumulative zoom %) and energy-<id>.png (object energy + frame diff)."""

    def span(shot, f, key, cumulative=False):
        lo, hi = shot["from"] + 1, min(shot["to"], len(f["frame"]))
        if hi <= lo:
            return np.array([]), np.array([])
        v = f[key][lo:hi]
        if cumulative:
            v = (np.exp(np.cumsum(np.log(v))) - 1.0) * 100.0
        return np.arange(1, hi - lo + 1), v

    z = []
    for label, shot, f, col in (
        ("ref", ref_shot, ref_f, REF_COLOUR),
        ("clone", clone_shot, clone_f, CLONE_COLOUR),
    ):
        x, y = span(shot, f, "scale", cumulative=True)
        z.append((label, x, y, col))
    _line_plot(
        Path(out_dir) / f"zoom-{sid}.png",
        f"{sid} cumulative zoom",
        "frame in shot",
        "zoom %",
        z,
    )
    e = []
    for label, shot, f, col in (
        ("ref", ref_shot, ref_f, REF_COLOUR),
        ("clone", clone_shot, clone_f, CLONE_COLOUR),
    ):
        x, y = span(shot, f, "obj_energy")
        e.append((f"{label} object px/f", x, y, col))
    _line_plot(
        Path(out_dir) / f"energy-{sid}.png",
        f"{sid} object motion energy",
        "frame in shot",
        "px/frame",
        e,
    )


def compare(ref_dir, clone_dir, out_dir=None):
    ref_doc = json.loads((Path(ref_dir) / "shots.json").read_text())
    clone_doc = json.loads((Path(clone_dir) / "shots.json").read_text())
    out = Path(out_dir) if out_dir else Path(ref_dir).resolve().parent
    out.mkdir(parents=True, exist_ok=True)
    text, ids = build_compare(ref_doc, clone_doc)
    ref_f, clone_f = load_frames_csv(ref_dir), load_frames_csv(clone_dir)
    ref = {s["id"]: s for s in ref_doc["shots"]}
    clone = {s["id"]: s for s in clone_doc["shots"]}
    plots = ["", "## Curves", ""]
    for sid in ids:
        plot_shot(out, sid, ref[sid], clone[sid], ref_f, clone_f)
        plots += [
            f"**{sid}**",
            "",
            f"![zoom {sid}](zoom-{sid}.png) ![energy {sid}](energy-{sid}.png)",
            "",
        ]
    (out / "compare.md").write_text(text + "\n".join(plots) + "\n")
    return out / "compare.md"


# ---------------------------------------------------------------- CLI


def main(argv=None):
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument("video", nargs="?", help="video to measure")
    ap.add_argument(
        "--shots", help="scene.ts with a SHOTS array, or a JSON list of {id,from,to}"
    )
    ap.add_argument("--out", help="output directory")
    ap.add_argument(
        "--compare",
        nargs=2,
        metavar=("REF_DIR", "CLONE_DIR"),
        help="compare two measure outputs",
    )
    args = ap.parse_args(argv)
    if args.compare:
        print(compare(args.compare[0], args.compare[1], args.out))
        return 0
    if not args.video or not args.out:
        ap.error("measuring needs <video> and --out")
    doc = measure(args.video, args.shots, args.out)
    print(f"{args.out}: {doc['n_frames']} frames, {len(doc['shots'])} shots")
    return 0


if __name__ == "__main__":
    sys.exit(main())
