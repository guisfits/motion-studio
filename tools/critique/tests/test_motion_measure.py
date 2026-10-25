"""Synthetic-clip tests for tools/critique/motion-measure.py.

Each test builds a clip with a known camera / object / look and asserts the measure recovers it.
Run with the OpenCV venv (system python has no cv2; the file is pytest-compatible and also runs bare):

  nice ${MOTION_STUDIO_PY:-python3} -I tools/critique/tests/test_motion_measure.py   (npm run test:py)
"""

import sys

try:
    import cv2  # noqa: F401
    import numpy  # noqa: F401
except ImportError:
    if "pytest" in sys.modules:
        import pytest

        pytest.skip("no cv2/numpy", allow_module_level=True)
    print("skipped: no cv2/numpy")
    sys.exit(0)

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location(
    "motion_measure", HERE.parent / "motion-measure.py"
)
mm = importlib.util.module_from_spec(spec)
sys.modules["motion_measure"] = mm
spec.loader.exec_module(mm)

W, H = 360, 640
SCENE_TS = HERE / "fixtures" / "van-gogh-scene.ts"  # frozen copy of the Van Gogh clone's shot table


def texture(w, h, seed, blur=1.5):
    """Colourful blobby texture with plenty of corners for ORB and gradients for optical flow."""
    rng = np.random.default_rng(seed)
    img = rng.integers(0, 256, (h, w, 3)).astype(np.float32)
    img = cv2.GaussianBlur(img, (0, 0), blur)
    img = cv2.normalize(img, None, 30, 225, cv2.NORM_MINMAX)
    for _ in range(60):
        c = (int(rng.integers(0, w)), int(rng.integers(0, h)))
        cv2.circle(
            img,
            c,
            int(rng.integers(4, 18)),
            [int(v) for v in rng.integers(0, 255, 3)],
            -1,
        )
    return np.clip(img, 0, 255).astype(np.uint8)


def analyze(frames):
    return list(mm.analyze_frames(iter(frames)))


def zoom_clip(n, step):
    """Camera zooming in by `step` (fraction) per frame about the centre."""
    base = texture(W, H, 1)
    out = []
    for i in range(n):
        s = (1 + step) ** i
        M = cv2.getRotationMatrix2D((W / 2, H / 2), 0, s)
        out.append(
            cv2.warpAffine(
                base,
                M,
                (W, H),
                flags=cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_REFLECT_101,
            )
        )
    return out


def pan_clip(n, dx, dy=0):
    base = texture(W + 400, H + 400, 2)
    return [
        base[
            200 + int(round(i * dy)) : 200 + int(round(i * dy)) + H,
            200 + int(round(i * dx)) : 200 + int(round(i * dx)) + W,
        ]
        for i in range(n)
    ]


def square_clip(n, speed):
    """Static background with one textured 60 px square sliding right at `speed` px/frame."""
    bg = texture(W, H, 3)
    sq = texture(60, 60, 4, blur=1.0)
    out = []
    for i in range(n):
        f = bg.copy()
        x = 20 + int(round(i * speed))
        f[300:360, x : x + 60] = sq
        out.append(f)
    return out


def test_zoom_ramp_is_recovered():
    rows = analyze(zoom_clip(21, 0.015))
    summary = mm.summarize_shot(rows, {"id": "T", "from": 0, "to": 21})
    expected_total = (1.015**20 - 1) * 100
    assert abs(summary["total_zoom_pct"] - expected_total) < 0.1 * expected_total
    assert abs(summary["zoom_speed_mean"] - 1.5) < 0.3
    assert summary["punch_ins"] == 0
    assert summary["camera_fail_frames"] == 0
    assert abs(summary["zoom_ease_t50"] - 0.4) < 0.2


def test_ecc_rows_are_held_out_of_camera_totals_and_speeds():
    # ECC is the last-resort tracker (camera-table holds those rows too): a wild ECC estimate must not
    # reach the zoom/pan totals or peaks, and the shot reports how many rows it set aside.
    rows = analyze(zoom_clip(21, 0.015))
    for i in (5, 6, 7):
        rows[i].update(method="ecc", scale=1.2, tx=50.0, ty=0.0, rot_deg=9.0)
    summary = mm.summarize_shot(rows, {"id": "T", "from": 0, "to": 21})
    kept_total = (1.015**17 - 1) * 100
    assert summary["ecc_frames"] == 3
    assert abs(summary["total_zoom_pct"] - kept_total) < 0.15 * kept_total
    assert summary["zoom_speed_peak"] < 3.0
    assert summary["pan_speed_peak"] < 10.0
    assert abs(summary["rot_total_deg"]) < 1.0
    clean = mm.summarize_shot(analyze(zoom_clip(21, 0.015)), {"id": "T", "from": 0, "to": 21})
    assert clean["ecc_frames"] == 0


def test_punch_in_is_counted():
    base = zoom_clip(1, 0)[0]
    clip = []
    for s in [1.0, 1.0, 1.0, 1.06, 1.06, 1.06]:
        M = cv2.getRotationMatrix2D((W / 2, H / 2), 0, s)
        clip.append(
            cv2.warpAffine(
                base,
                M,
                (W, H),
                flags=cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_REFLECT_101,
            )
        )
    summary = mm.summarize_shot(analyze(clip), {"id": "T", "from": 0, "to": 6})
    assert summary["punch_ins"] == 1
    assert 4.5 < summary["zoom_speed_peak"] < 7.5


def test_pan_is_recovered_and_is_not_object_motion():
    rows = analyze(pan_clip(16, dx=6, dy=-3))
    summary = mm.summarize_shot(rows, {"id": "T", "from": 0, "to": 16})
    expected = (6**2 + 3**2) ** 0.5
    assert abs(summary["pan_speed_mean"] - expected) < 0.15 * expected
    assert abs(summary["total_zoom_pct"]) < 1.0
    assert summary["obj_energy_mean"] < 1.0


def test_translating_square_is_object_motion_not_camera():
    rows = analyze(square_clip(15, speed=12))
    summary = mm.summarize_shot(rows, {"id": "T", "from": 0, "to": 15})
    assert 8 < summary["obj_fastest_px_f"] < 17
    assert summary["pan_speed_mean"] < 1.5
    assert abs(summary["total_zoom_pct"]) < 1.0


def test_static_clip_has_no_motion_and_settle_zero():
    still = texture(W, H, 5)
    summary = mm.summarize_shot(analyze([still] * 8), {"id": "T", "from": 0, "to": 8})
    assert summary["obj_energy_peak"] < mm.ENERGY_FLOOR
    assert summary["obj_settle_frames"] == 0
    assert summary["pan_speed_peak"] < 0.5


def test_settle_frames_counts_until_energy_drops():
    rows = [
        {
            "frame": i,
            "method": "orb",
            "scale": 1.0,
            "tx": 0.0,
            "ty": 0.0,
            "rot_deg": 0.0,
            "obj_energy": e,
            "obj_p99": e * 2,
            "obj_moving_frac": 0.1,
            "diff_energy": e,
            "sharp": 1.0,
            "sharp_edge": 1.0,
            "sharp_center": 1.0,
            "contrast": 1,
            "saturation": 0,
            "warmth": 0,
            "vignette": 1,
            "grain": 0,
            "black_level": 0,
        }
        for i, e in enumerate([0, 40, 30, 10, 3, 0.2, 0.1, 0.1, 0.1])
    ]
    summary = mm.summarize_shot(rows, {"id": "T", "from": 0, "to": 9})
    # Motion frames start at 1; peak 40 -> threshold 4 -> last frame at or above it is the 3rd motion frame.
    assert summary["obj_settle_frames"] == 3
    assert summary["obj_energy_peak"] == 40


def test_ecc_fallback_on_featureless_frames():
    xs = np.linspace(0, 255, W, dtype=np.float32)
    ys = np.linspace(0, 255, H, dtype=np.float32)
    base = (np.add.outer(ys * 0.3, xs * 0.7)).astype(np.float32)
    base = cv2.GaussianBlur(base, (0, 0), 25) + 30 * np.sin(
        np.add.outer(ys / 90.0, xs / 70.0)
    )
    base = np.clip(base, 0, 255).astype(np.uint8)
    base = cv2.cvtColor(base, cv2.COLOR_GRAY2BGR)
    shifted = np.roll(base, 5, axis=1)
    rows = analyze([base, shifted])
    assert rows[1]["method"] in ("ecc", "orb", "akaze")
    if rows[1]["method"] == "ecc":
        assert abs(rows[1]["tx"] - 5) < 2.5


def test_sharp_vs_blurred_frame():
    sharp = texture(W, H, 6, blur=0.8)
    blurred = cv2.GaussianBlur(sharp, (0, 0), 4)
    a, b = mm.look_measures(sharp), mm.look_measures(blurred)
    assert a["sharp"] > 8 * b["sharp"]


def test_depth_of_field_proxy_sees_blurred_edges():
    sharp = texture(W, H, 7, blur=0.8)
    soft = cv2.GaussianBlur(sharp, (0, 0), 5)
    yy, xx = np.mgrid[0:H, 0:W]
    inner = ((xx > W * 0.2) & (xx < W * 0.8) & (yy > H * 0.2) & (yy < H * 0.8))[
        :, :, None
    ]
    dof = np.where(inner, sharp, soft)
    m = mm.look_measures(dof)
    assert m["sharp_edge"] < 0.25 * m["sharp_center"]
    flat = mm.look_measures(sharp)
    assert 0.6 < flat["sharp_edge"] / flat["sharp_center"] < 1.6


def test_tone_colour_vignette_and_black_level():
    img = np.full((H, W, 3), 140, np.uint8)
    img[:, :, 2] = 190
    img[:, :, 0] = 90
    m = mm.look_measures(img)
    assert abs(m["warmth"] - 100) < 1.5
    assert m["saturation"] > 0.3
    cv2.rectangle(img, (0, 0), (W // 3, H // 3), (20, 20, 20), -1)
    cv2.rectangle(img, (W - 2 * W // 3, H - 40), (W, H), (230, 230, 230), -1)
    m = mm.look_measures(img)
    assert abs(m["black_level"] - 20) < 2
    assert m["contrast"] > 100


def test_vignette_ratio():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.hypot((xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2)) / np.sqrt(2)
    lum = np.clip(200 * (1 - 0.6 * r**2), 0, 255).astype(np.uint8)
    m = mm.look_measures(cv2.cvtColor(lum, cv2.COLOR_GRAY2BGR))
    assert 0.45 < m["vignette"] < 0.7
    flat = mm.look_measures(np.full((H, W, 3), 128, np.uint8))
    assert abs(flat["vignette"] - 1.0) < 0.02


def test_grain_matches_injected_noise():
    rng = np.random.default_rng(0)
    img = np.clip(128 + rng.normal(0, 3.0, (H, W)), 0, 255).astype(np.uint8)
    m = mm.look_measures(cv2.cvtColor(img, cv2.COLOR_GRAY2BGR))
    assert abs(m["grain"] - 3.0) < 0.6
    clean = mm.look_measures(np.full((H, W, 3), 128, np.uint8))
    assert clean["grain"] < 0.3


def test_parse_scene_ts():
    shots = mm.parse_shots(SCENE_TS)
    assert len(shots) == 16
    assert shots[0] == {
        "id": "S01",
        "from": 0,
        "to": 32,
        "name": "drowning (1a wide, 1b punch + PAIN)",
    }
    s03 = next(s for s in shots if s["id"] == "S03")
    assert (s03["from"], s03["to"]) == (52, 105)
    assert mm.shot_ids_at(shots, 55) == "S02+S03"


def test_flag_thresholds():
    assert mm.flag_for("ratio", 10, 10, 0)[1] == ""
    assert mm.flag_for("ratio", 10, 15, 0)[1] == "🟠"
    assert mm.flag_for("ratio", 10, 21, 0)[1] == "🔴"
    assert mm.flag_for("ratio", 10, 4.9, 0)[1] == "🔴"
    assert mm.flag_for("ratio", 0, 0, 0.5)[1] == ""
    assert mm.flag_for("signed", 10, -10, 1)[1] == "🔴"
    assert mm.flag_for("diff", 10, 40, 0)[1] == "🔴"


def test_compare_warns_when_rates_or_sizes_differ():
    shot = {"id": "S1", "name": "a", "from": 0, "to": 10, "pan_speed_mean": 4.0}
    doc = lambda fps, w: {"video": "v.mp4", "n_frames": 10, "fps": fps, "width": w, "height": w * 16 // 9, "shots": [shot]}
    same, _ = mm.build_compare(doc(16, 1080), doc(16.0, 1080))
    assert "⚠️" not in same
    text, _ = mm.build_compare(doc(16, 1080), doc(30, 1080))
    assert "frame rates differ" in text.lower() and "16" in text and "30" in text
    text, _ = mm.build_compare(doc(16, 720), doc(16, 1080))
    assert "sizes differ" in text.lower() and "720" in text and "1080" in text


def write_video(path, frames):
    wr = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"mp4v"), 16, (W, H))
    for f in frames:
        wr.write(f)
    wr.release()


def test_cli_measure_and_compare_end_to_end():
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        ref = zoom_clip(12, 0.02) + square_clip(8, 10)
        clone = zoom_clip(12, 0.004) + square_clip(8, 2)
        write_video(tmp / "ref.mp4", ref)
        write_video(tmp / "clone.mp4", clone)
        shots = [
            {"id": "A", "from": 0, "to": 12, "name": "zoom"},
            {"id": "B", "from": 12, "to": 20, "name": "slide"},
        ]
        (tmp / "shots.json").write_text(json.dumps(shots))
        for name in ("ref", "clone"):
            assert (
                mm.main(
                    [
                        str(tmp / f"{name}.mp4"),
                        "--shots",
                        str(tmp / "shots.json"),
                        "--out",
                        str(tmp / name),
                    ]
                )
                == 0
            )
        doc = json.loads((tmp / "ref" / "shots.json").read_text())
        assert [s["id"] for s in doc["shots"]] == ["A", "B"]
        assert (tmp / "ref" / "frames.csv").exists()
        assert mm.main(["--compare", str(tmp / "ref"), str(tmp / "clone")]) == 0
        text = (tmp / "compare.md").read_text()
        assert "🔴" in text
        assert (tmp / "zoom-A.png").exists() and (tmp / "energy-B.png").exists()
        row = next(l for l in text.splitlines() if l.startswith("| A |") and "→" in l)
        assert "🔴" in row


if __name__ == "__main__":
    failed = 0
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print(f"PASS {name}")
            except Exception as exc:
                failed += 1
                print(f"FAIL {name}: {type(exc).__name__}: {exc}")
    print(f"{'FAILED' if failed else 'OK'}: {failed} failed")
    sys.exit(1 if failed else 0)
