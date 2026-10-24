"""Tests for tools/kit/cut-limbs.py on a synthetic figure drawn with numpy (no art needed).

The figure is a torso block with a two-link arm (a capsule from the shoulder to the elbow, another to
the hand). Run bare or with pytest, with PIL + numpy:

  ${MOTION_STUDIO_PY:-python3} -I tools/kit/tests/test_cut_limbs.py   (npm run test:py)
"""

import sys

try:
    import numpy  # noqa: F401
    import PIL  # noqa: F401
except ImportError:
    if "pytest" in sys.modules:
        import pytest

        pytest.skip("no PIL/numpy", allow_module_level=True)
    print("skipped: no PIL/numpy")
    sys.exit(0)

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("cut_limbs", HERE.parent / "cut-limbs.py")
cl = importlib.util.module_from_spec(spec)
sys.modules["cut_limbs"] = cl
spec.loader.exec_module(cl)

W, H = 400, 500
SHOULDER, ELBOW, HAND = (200, 150), (300, 150), (380, 230)
R = 14


def dist_to_segment(ys, xs, a, b):
    ab = np.array(b, float) - np.array(a, float)
    t = np.clip(((xs - a[0]) * ab[0] + (ys - a[1]) * ab[1]) / (ab @ ab), 0, 1)
    return np.hypot(xs - (a[0] + t * ab[0]), ys - (a[1] + t * ab[1]))


def figure():
    ys, xs = np.mgrid[0:H, 0:W].astype(float)
    arm = (dist_to_segment(ys, xs, SHOULDER, ELBOW) <= R) | (dist_to_segment(ys, xs, ELBOW, HAND) <= R)
    torso = (xs >= 120) & (xs <= 210) & (ys >= 100) & (ys <= 400)
    rgba = np.zeros((H, W, 4), np.uint8)
    rgba[torso | arm] = (180, 90, 40, 255)
    rgba[arm & ~torso] = (40, 120, 200, 255)  # the arm is blue, the torso orange
    return Image.fromarray(rgba, "RGBA")


LIMBS = {
    "torso": {"pivot": [165, 380]},
    "limbs": {
        "r": {
            "joints": [SHOULDER, ELBOW, HAND],
            "radii": [[R, R], [R, R]],
            "names": ["ua", "fa"],
            "stub": 20,
            "tip_extend": 6,
        }
    },
}


def alpha(img):
    return np.array(img.getchannel("A"))


def test_parts_are_in_draw_order_with_a_parent_chain():
    parts, _ = cl.cut(figure(), LIMBS)
    assert [p["part"] for p in parts] == ["torso", "ua", "fa"]
    assert [p["parent"] for p in parts] == [None, "torso", "ua"]


def test_origin_plus_pivot_is_the_joint_in_figure_space():
    parts, images = cl.cut(figure(), LIMBS)
    by = {p["part"]: p for p in parts}
    for name, joint in (("ua", SHOULDER), ("fa", ELBOW)):
        p = by[name]
        assert abs(p["origin"][0] + p["pivot"][0] - joint[0]) <= 0.1
        assert abs(p["origin"][1] + p["pivot"][1] - joint[1]) <= 0.1
        # the hinge lies inside its own image
        w, h = images[name].size
        assert 0 <= p["pivot"][0] <= w and 0 <= p["pivot"][1] <= h


def test_part_bounds_hug_the_capsule_plus_the_pad():
    parts, images = cl.cut(figure(), LIMBS)
    by = {p["part"]: p for p in parts}
    ua, fa = by["ua"], by["fa"]
    pad = cl.PAD
    # upper arm: the disc at the shoulder to the disc at the elbow
    assert abs(ua["origin"][0] - (SHOULDER[0] - R - pad)) <= 2
    assert abs(ua["origin"][1] - (SHOULDER[1] - R - pad)) <= 2
    assert abs(ua["origin"][0] + images["ua"].width - (ELBOW[0] + R + pad)) <= 2
    # forearm: from the elbow disc to just past the hand (tip_extend 6 along the same direction)
    assert abs(fa["origin"][0] - (ELBOW[0] - R - pad)) <= 2
    assert fa["origin"][0] + images["fa"].width >= HAND[0]
    assert fa["origin"][1] + images["fa"].height >= HAND[1]
    assert images["fa"].height < H and images["fa"].width < W  # cropped, not the whole figure


def test_a_part_holds_only_its_own_pixels():
    parts, images = cl.cut(figure(), LIMBS)
    by = {p["part"]: p for p in parts}
    a = alpha(images["ua"])
    ox, oy = by["ua"]["origin"]
    # nothing of the hand end in the upper arm's image: the right edge of its image is the elbow
    far = a[:, (HAND[0] - 40 - ox):] if HAND[0] - 40 - ox < a.shape[1] else a[:, :0]
    assert far.size == 0 or far.max() == 0
    # the forearm's image holds only the arm's blue, none of the torso's orange
    rgba = np.array(images["fa"])
    seen = rgba[rgba[..., 3] > 200][:, :3]
    assert len(seen) > 0 and (seen == (40, 120, 200)).all()


def test_torso_loses_the_limb_but_keeps_a_stub():
    _, images = cl.cut(figure(), LIMBS)
    a = alpha(images["torso"])
    assert a[SHOULDER[1], 160] == 255  # inside the block, untouched
    assert a[ELBOW[1], ELBOW[0]] == 0  # the elbow is gone from the torso
    assert a[HAND[1], HAND[0]] == 0
    # the cut starts `stub` (20) px along the upper arm and its round end reaches R + margin (18) back:
    # the torso keeps 2 px of limb past the shoulder
    assert a[SHOULDER[1], SHOULDER[0] + 1] == 255
    assert a[SHOULDER[1], SHOULDER[0] + 4] == 0
    assert a.shape == (H, W) and images["torso"].size == (W, H)  # the torso keeps the figure's frame


def test_parts_cover_the_figure_except_the_margin_ring_around_the_limb():
    parts, images = cl.cut(figure(), LIMBS)
    whole = alpha(figure()) > 0
    canvas = np.zeros((H, W), bool)
    for p in parts:
        a = alpha(images[p["part"]]) > 0
        ox, oy = p["origin"]
        canvas[oy : oy + a.shape[0], ox : ox + a.shape[1]] |= a
    ys, xs = np.nonzero(whole & ~canvas)
    # the torso is cut `margin` (4 px) wider than the limb so no fringe stays behind a turning arm;
    # that ring is the only thing allowed to go missing
    d = np.minimum(dist_to_segment(ys, xs, SHOULDER, ELBOW), dist_to_segment(ys, xs, ELBOW, HAND))
    assert len(d) == 0 or (d.min() > R - 1 and d.max() <= R + 4 + 1)


def test_a_limb_off_the_figure_is_an_error_naming_it():
    bad = json.loads(json.dumps(LIMBS))
    bad["limbs"]["r"]["joints"] = [[10, 450], [30, 470], [60, 490]]
    try:
        cl.cut(figure(), bad)
    except ValueError as err:
        assert "ua" in str(err)
    else:
        raise AssertionError("expected ValueError")


def test_joint_and_radii_counts_must_agree():
    bad = json.loads(json.dumps(LIMBS))
    bad["limbs"]["r"]["radii"] = [[R, R]]
    try:
        cl.cut(figure(), bad)
    except ValueError:
        return
    raise AssertionError("expected ValueError")


def test_cli_writes_pngs_and_a_ts_module_the_puppet_reads():
    with tempfile.TemporaryDirectory() as d:
        src, js, out = Path(d) / "fig-cut.png", Path(d) / "limbs.json", Path(d) / "out"
        figure().save(src)
        js.write_text(json.dumps(LIMBS))
        cl.main([str(src), str(js), str(out)])
        text = (out / "fig-parts.ts").read_text()
        names = sorted(p.name for p in out.glob("*.png"))
    assert names == ["fig-fa.png", "fig-torso.png", "fig-ua.png"]
    assert f"export const SIZE: [number, number] = [{W}, {H}];" in text
    assert '"part": "ua", "file": "fig-ua.png"' in text
    assert text.index('"part": "torso"') < text.index('"part": "ua"') < text.index('"part": "fa"')


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
