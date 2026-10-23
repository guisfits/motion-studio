"""Fills the unknown pixels of small windows from their known neighbours.

uv run --with opencv-python-headless --with numpy rig_fill.py [--texture] <in.png> <mask.png> <out.png> [...]

Triples, like matte.py. rig.mjs calls this to fill what a moving part of a cut-out puppet leaves
behind in its parent.

Default: <mask.png> is white where the pixels are unknown, filled by OpenCV TELEA (smooth: right
for a plain cloth, flat on a hatched engraving).

--texture: exemplar-based synthesis (Criminisi): the hole is rebuilt patch by patch from the
nearest-matching patches of the known pixels, so engraved hatching and cloth grain carry on into
it. The mask has three greys: 255 = fill, 128 = neither known nor to fill (never used as source),
0 = known.
"""
import sys

import cv2
import numpy as np

PATCH = 11


def texture_fill(image, mask, patch=PATCH):
    h, w = mask.shape
    half = patch // 2
    if h < patch or w < patch:
        return None
    target = mask == 255
    known = mask == 0
    if not target.any():
        return image
    if not known.any():
        return None
    img = image.astype(np.float32)
    filled = known.copy()
    conf = known.astype(np.float32)
    # A source patch must lie wholly on known pixels.
    ok = cv2.erode(known.astype(np.uint8), np.ones((patch, patch), np.uint8), borderType=cv2.BORDER_CONSTANT, borderValue=0)
    valid = ok[half : h - half, half : w - half] > 0
    if not valid.any():
        return None
    cross = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
    left = target.copy()
    while left.any():
        fm = filled.astype(np.uint8)
        front = left & (cv2.dilate(fm, cross) > 0)
        if not front.any():
            break
        gray = cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
        gray[~filled] = 0
        gv = cv2.erode(fm, np.ones((3, 3), np.uint8)).astype(np.float32)
        gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3) * gv
        gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3) * gv
        den = np.maximum(cv2.GaussianBlur(gv, (0, 0), 3), 1e-3)
        gxs = cv2.GaussianBlur(gx, (0, 0), 3) / den
        gys = cv2.GaussianBlur(gy, (0, 0), 3) / den
        sm = cv2.GaussianBlur(filled.astype(np.float32), (0, 0), 2)
        nx = cv2.Sobel(sm, cv2.CV_32F, 1, 0, ksize=3)
        ny = cv2.Sobel(sm, cv2.CV_32F, 0, 1, ksize=3)
        nn = np.maximum(np.hypot(nx, ny), 1e-6)
        data = np.abs(-gys * nx + gxs * ny) / nn / 255.0
        confidence = cv2.boxFilter(conf, -1, (patch, patch), normalize=True, borderType=cv2.BORDER_REFLECT)
        priority = np.where(front, confidence * (data + 0.01), -1.0)
        py, px = np.unravel_index(int(np.argmax(priority)), priority.shape)
        cy = min(max(py, half), h - half - 1)
        cx = min(max(px, half), w - half - 1)
        ys, xs = slice(cy - half, cy + half + 1), slice(cx - half, cx + half + 1)
        tmpl = img[ys, xs]
        tm = filled[ys, xs].astype(np.float32)
        score = cv2.matchTemplate(img, tmpl, cv2.TM_SQDIFF, mask=np.repeat(tm[:, :, None], 3, axis=2))
        score[~valid] = np.inf
        by, bx = np.unravel_index(int(np.argmin(score)), score.shape)
        if not np.isfinite(score[by, bx]):
            break
        src = img[by : by + patch, bx : bx + patch]
        new = ~filled[ys, xs] & left[ys, xs]
        img[ys, xs][new] = src[new]
        conf[ys, xs][new] = confidence[py, px]
        filled[ys, xs] |= new
        left[ys, xs] &= ~new
    out = np.clip(img, 0, 255).astype(np.uint8)
    if left.any():
        # Pockets the front never reached (walled in by "neither" pixels): smooth fill.
        out = cv2.inpaint(out, left.astype(np.uint8) * 255, 5, cv2.INPAINT_TELEA)
    return out


def main(args):
    texture = "--texture" in args
    args = [a for a in args if a != "--texture"]
    if not args or len(args) % 3:
        sys.exit("usage: rig_fill.py [--texture] <in.png> <mask.png> <out.png> [<in.png> <mask.png> <out.png> ...]")
    for src, mask, out in zip(args[::3], args[1::3], args[2::3]):
        image = cv2.imread(src, cv2.IMREAD_COLOR)
        unknown = cv2.imread(mask, cv2.IMREAD_GRAYSCALE)
        if image is None or unknown is None:
            sys.exit(f"rig_fill: cannot read {src} or {mask}")
        if texture:
            filled = texture_fill(image, np.where(unknown > 191, 255, np.where(unknown > 63, 128, 0)).astype(np.uint8))
            if filled is None:
                # Nothing to copy from, or a window smaller than a patch: smooth fill instead.
                filled = cv2.inpaint(image, (unknown > 191).astype(np.uint8) * 255, 5, cv2.INPAINT_TELEA)
        else:
            _, unknown = cv2.threshold(unknown, 127, 255, cv2.THRESH_BINARY)
            # With nothing known there is nothing to take from: keep the pixels as they are.
            filled = image if unknown.all() else cv2.inpaint(image, unknown, 5, cv2.INPAINT_TELEA)
        cv2.imwrite(out, filled)


if __name__ == "__main__":
    main(sys.argv[1:])
