"""Tests for tools/critique/camera-table.py on hand-made frames.csv files (numpy only, no OpenCV).

Run bare or with pytest:

  /Users/guisfits/llm-models/venv_mlx/bin/python -I tools/critique/tests/test_camera_table.py
"""

import importlib.util
import sys
import tempfile
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("camera_table", HERE.parent / "camera-table.py")
ct = importlib.util.module_from_spec(spec)
sys.modules["camera_table"] = ct
spec.loader.exec_module(ct)


def steps(rows):
    """{frame: (method, scale, tx, ty)} from [(method, scale, tx, ty), ...] starting at frame 0."""
    return {i: r for i, r in enumerate(rows)}


def test_identity_steps_give_identity_table():
    st = steps([("first", 1, 0, 0)] + [("orb", 1, 0, 0)] * 4)
    assert np.allclose(ct.compose(st, 0, 5), [[1, 0, 0]] * 5)


def test_scales_multiply_and_translations_follow_the_zoom():
    # frame 1: x2 zoom with no move; frame 2: pure +10 px move, which the x2 zoom must not shrink
    # (the move is already in output px); frame 3: x1.5 zoom scales the +10 already accumulated.
    st = steps([("first", 1, 0, 0), ("orb", 2, 0, 0), ("orb", 1, 10, -4), ("orb", 1.5, 0, 0)])
    t = ct.compose(st, 0, 4)
    assert np.allclose(t[1], [2, 0, 0])
    assert np.allclose(t[2], [2, 10, -4])
    assert np.allclose(t[3], [3, 15, -6])


def test_composition_matches_chained_point_maps():
    rng = np.random.default_rng(3)
    rows = [("first", 1, 0, 0)] + [
        ("orb", float(rng.uniform(0.95, 1.08)), float(rng.normal(0, 6)), float(rng.normal(0, 6)))
        for _ in range(12)
    ]
    t = ct.compose(steps(rows), 0, len(rows))
    c = np.array([540.0, 960.0])
    p = np.array([100.0, 300.0])
    q = p.copy()
    for _, s, mx, my in rows[1:]:
        q = s * (q - c) + c + np.array([mx, my])
    S, TX, TY = t[-1]
    assert np.allclose(S * (p - c) + c + np.array([TX, TY]), q)


def test_ecc_none_and_first_steps_hold_the_pose():
    st = steps(
        [("first", 1, 0, 0), ("orb", 1.2, 5, 5), ("ecc", 0.9, 80, 80), ("none", 1, 0, 0), ("akaze", 1.0, 1, 0)]
    )
    t = ct.compose(st, 0, 5)
    assert np.allclose(t[2], t[1]) and np.allclose(t[3], t[1])
    assert np.allclose(t[4], [1.2, 6, 5])


def test_cut_frame_is_dropped():
    st = steps([("first", 1, 0, 0), ("orb", 1.1, 2, 0), ("orb", 3.0, 500, 500), ("orb", 1.1, 0, 0)])
    t = ct.compose(st, 0, 4, cuts=[2])
    assert np.allclose(t[2], t[1])
    assert np.allclose(t[3], [1.21, 2.2, 0])


def test_range_starts_at_a_later_frame_with_an_identity_row():
    st = steps([("first", 1, 0, 0), ("orb", 5, 99, 99), ("orb", 1.25, 0, 0), ("orb", 1.2, 0, 0)])
    t = ct.compose(st, 1, 4)
    assert len(t) == 3 and np.allclose(t[0], [1, 0, 0])
    assert np.allclose(t[2], [1.5, 0, 0])


def test_missing_frames_and_empty_ranges_are_errors():
    st = steps([("first", 1, 0, 0), ("orb", 1, 0, 0)])
    for a, b in ((0, 5), (3, 3)):
        try:
            ct.compose(st, a, b)
        except ValueError:
            continue
        raise AssertionError("expected ValueError")


def test_cli_writes_a_ts_module_with_the_range_in_a_comment():
    csv_text = "frame,shot,method,scale,tx,ty\n" + "\n".join(
        f"{i},S,{m},{s},{x},{y}"
        for i, (m, s, x, y) in enumerate(
            [("first", 1, 0, 0), ("orb", 1.1, 3, -0.001), ("ecc", 2, 9, 9), ("orb", 1.1, 0, 0)]
        )
    )
    with tempfile.TemporaryDirectory() as d:
        src, out = Path(d) / "frames.csv", Path(d) / "t.ts"
        src.write_text(csv_text + "\n")
        ct.main([str(src), "--from", "0", "--to", "4", "--out", str(out), "--export", "CAM"])
        text = out.read_text()
    assert "reference frames 0..3" in text
    assert "export const CAM: [number, number, number][] = [" in text
    assert "[1.00000, 0.00, 0.00]," in text
    assert "[1.10000, 3.00, 0.00]," in text  # no "-0.00"
    assert "[1.21000, 3.30, 0.00]," in text


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
