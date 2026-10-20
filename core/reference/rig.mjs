// Cuts one picture into a hinged paper puppet: parts that rotate about pivots (a Monty-Python /
// Vox cut-out). Each part is cut at full resolution, the hole a moving part leaves in its parent is
// filled so the parent never shows a ghost, and the part reaches a little past its joint so a
// turn never opens a gap. core/lib/rig.js poses the result on a film page.
//
//   node core/reference/rig.mjs <image> <spec.json> --out <dir> [--swing 20] [--no-preview]
//
// spec.json (points are 0..1 of the upright image, origin top-left):
//   { "subject": "none" | "alpha" | "subject" | "birefnet", // who is lifted from the picture (default none)
//     "shrink": 2,                                    // px the matte's edge is pulled in (halo of the old ground)
//     "oven": { "rim": 3, "depth": 2 },               // optional torn paper rim, as reference/oven.mjs
//     "parts": [
//       { "name": "body",    "pivot": [x, y], "parent": null, "z": 0, "poly": [[x, y], ...] },
//       { "name": "forearm", "pivot": [x, y], "parent": "body", "z": 1, "poly": [[x, y], ...],
//         "overlap": 0.03, "reach": 0.3, "fill": "inpaint" } ] }
//
// - The root (parent null, listed first) may leave out `poly`: it is the rest of the subject.
//   Every other part needs a `poly`: the area it carries. A part listed later wins where polygons
//   overlap, so a hand listed after its arm is cut out of the arm.
// - subject "alpha" is for a picture that is already a cut-out PNG: its own transparency is the
//   matte (set "shrink": 0 so its rim is kept as it is).
// - subject "subject" lifts the foreground with Apple Vision (cutout.swift --full), "birefnet" with
//   BiRefNet (matte.py, downloads ~1 GB once); a part keeps only the pixels both the subject and
//   its polygon cover. "none" keeps the polygon alone (the root is then the whole picture).
// - `overlap` (default 0.03): the part is extended that fraction of its size behind its pivot,
//   into the parent. `reach` (default 0.3): the radius, as a fraction of the part's size, of the
//   patch the parent keeps (inpainted from the parent's own pixels) around the pivot, which is
//   what shows where the part used to be once it turns. `fill` "inpaint" (default, OpenCV TELEA
//   through uv; neighbour fill if that is missing), "copy" (the part's own pixels around the
//   joint stay as the patch: best when parent and part are one cloth, a sleeve; keeps the grain)
//   or "texture" (the "copy" patch at the joint, plus the rest of the parent's own polygon that
//   the part covered is rebuilt by exemplar synthesis from the parent's nearby pixels, so
//   engraved hatching and cloth grain carry on where TELEA would leave a flat blob).
// - `underlay` (a part's own field): a PNG already in <dir>, the size of the source, that paints what the
//   parent holds under the part (a skull's hair under a cap) where synthesis cannot be trusted. Its
//   pixels replace the parent's wherever the part lay over the parent's own polygon.
// - z orders the paint (the listing order breaks ties, later on top).
// - `extras` are finished overlay pictures that are not cut from the source (closed eyelids painted
//   from the skin around the eyes): { "name", "file" (a PNG already in <dir>), "x", "y" (its top-left
//   in source px), "parent", "z", "pivot": [u, v] (0..1, default its centre) }. They are listed in
//   rig.json as `hidden: true`: drawRig skips them unless the pose's `show` names them.
// - `preview` scripts preview.mp4 instead of the swing: { "seconds": 3, "fps": 24, "ease": "inOut",
//   "pad": 0.06, "keys": [{ "t": 0, "angles": { "beret": 0 }, "show": ["eyelids"] }] } (angles travel,
//   `show` holds; `pad` adds that fraction of the long side round the picture, so a tipped cap stays in frame).
//
// Writes <dir>/<part>.png (cropped to its bounds), <dir>/rig.json and <dir>/preview.mp4 where
// every child swings ±swing degrees about its pivot over 2 s.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { polyMask, bake } from "./oven.mjs";
import { readRGBA, writePNG, uprightSize } from "./regions.mjs";
import { poseMatrices, drawOrder, stepPose } from "../lib/rig.js";

const here = dirname(fileURLToPath(import.meta.url));
const NAME = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const finite = (v) => typeof v === "number" && Number.isFinite(v);
const point = (pt) => Array.isArray(pt) && pt.length === 2 && pt.every(finite);

// ---- Spec ------------------------------------------------------------------------------------

export function parseSpec(spec) {
  const fail = (m) => {
    throw new Error(`rig spec: ${m}`);
  };
  if (!spec || typeof spec !== "object") fail("not an object");
  const subject = spec.subject ?? "none";
  if (!["none", "alpha", "subject", "birefnet"].includes(subject)) fail(`subject must be "none", "alpha", "subject" or "birefnet", not ${JSON.stringify(subject)}`);
  if (!Array.isArray(spec.parts) || spec.parts.length === 0) fail("parts must be a non-empty array");
  const seen = new Set();
  const parts = spec.parts.map((p, i) => {
    const at = `part ${i}${p?.name ? ` (${p.name})` : ""}`;
    if (typeof p?.name !== "string" || !NAME.test(p.name)) fail(`${at} needs a file-safe name (letters, digits, - _)`);
    if (seen.has(p.name)) fail(`${at} is a duplicate name`);
    const parent = p.parent ?? null;
    if (i === 0 && parent !== null) fail(`${at}: the first part is the root, its parent must be null`);
    if (i > 0 && parent === null) fail(`${at}: only the first part may have no parent`);
    if (parent !== null && !seen.has(parent)) fail(`${at}: parent ${JSON.stringify(parent)} must be listed before it`);
    seen.add(p.name);
    const poly = p.poly ?? null;
    if (poly === null && i > 0) fail(`${at} needs a poly`);
    if (poly !== null && (!Array.isArray(poly) || poly.length < 3 || !poly.every(point))) fail(`${at} has a bad poly (need 3+ [u, v] points)`);
    const pivot = p.pivot ?? (i === 0 ? [0.5, 0.5] : null);
    if (!point(pivot) || pivot.some((v) => v < 0 || v > 1)) fail(`${at} needs a pivot [x, y] in 0..1`);
    const overlap = p.overlap ?? 0.03;
    const reach = p.reach ?? 0.3;
    if (!finite(overlap) || overlap < 0 || overlap > 0.3) fail(`${at} overlap must be 0..0.3`);
    if (!finite(reach) || reach < 0 || reach > 1) fail(`${at} reach must be 0..1`);
    const fill = p.fill ?? "inpaint";
    if (!["inpaint", "copy", "texture"].includes(fill)) fail(`${at} fill must be "inpaint", "copy" or "texture"`);
    const z = p.z ?? 0;
    if (!finite(z)) fail(`${at} z must be a number`);
    const underlay = p.underlay ?? null;
    if (underlay !== null && (typeof underlay !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]*\.png$/.test(underlay) || parent === null)) fail(`${at} underlay must be a PNG file name, on a part with a parent`);
    return { name: p.name, poly, pivot, parent, z, overlap, reach, fill, underlay };
  });
  const oven = spec.oven ?? null;
  if (oven && typeof oven !== "object") fail("oven must be an object");
  const shrink = spec.shrink ?? 2;
  if (!finite(shrink) || shrink < 0 || shrink > 10) fail("shrink must be 0..10 px");
  const partNames = new Set(seen);
  const extras = (spec.extras ?? []).map((e, i) => {
    const at = `extra ${i}${e?.name ? ` (${e.name})` : ""}`;
    if (typeof e?.name !== "string" || !NAME.test(e.name) || seen.has(e.name)) fail(`${at} needs its own file-safe name`);
    seen.add(e.name);
    if (typeof e.file !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]*\.png$/.test(e.file)) fail(`${at} needs a PNG file name`);
    if (!finite(e.x) || !finite(e.y)) fail(`${at} needs x, y in source px`);
    if (!partNames.has(e.parent)) fail(`${at}: parent ${JSON.stringify(e.parent)} must be one of the parts`);
    const pivot = e.pivot ?? [0.5, 0.5];
    if (!point(pivot) || pivot.some((v) => v < 0 || v > 1)) fail(`${at} pivot must be [u, v] in 0..1`);
    if (e.z !== undefined && !finite(e.z)) fail(`${at} z must be a number`);
    return { name: e.name, file: e.file, x: Math.round(e.x), y: Math.round(e.y), parent: e.parent, z: e.z ?? 1, pivot };
  });
  const preview = spec.preview ?? null;
  if (preview) {
    if (!Array.isArray(preview.keys) || preview.keys.length === 0) fail("preview.keys must be a non-empty array");
    if (!preview.keys.every((k) => finite(k?.t))) fail("every preview key needs a time t");
    if (preview.pad !== undefined && (!finite(preview.pad) || preview.pad < 0 || preview.pad > 0.5)) fail("preview.pad must be 0..0.5");
  }
  return { subject, shrink, oven, parts, extras, preview };
}

// ---- Pure geometry ---------------------------------------------------------------------------

export const pivotPx = (part, W, H) => [+(part.pivot[0] * W).toFixed(2), +(part.pivot[1] * H).toFixed(2)];

// Integer box {x, y, w, h} of a polygon given in 0..1, grown by `pad` px and clamped to W×H. null
// when it misses the picture.
export function polyBox(poly, W, H, pad = 0) {
  const xs = poly.map(([u]) => u * W),
    ys = poly.map(([, v]) => v * H);
  const x0 = Math.max(0, Math.floor(Math.min(...xs)) - pad),
    y0 = Math.max(0, Math.floor(Math.min(...ys)) - pad);
  const x1 = Math.min(W, Math.ceil(Math.max(...xs)) + pad),
    y1 = Math.min(H, Math.ceil(Math.max(...ys)) + pad);
  return x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
}

// Box of the pixels above `min` in a W×H alpha, grown by `pad` and clamped. null when empty.
export function alphaBox(alpha, W, H, pad = 0, min = 8) {
  let x0 = W,
    y0 = H,
    x1 = -1,
    y1 = -1;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (alpha[y * W + x] > min) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) return null;
  const bx = Math.max(0, x0 - pad),
    by = Math.max(0, y0 - pad);
  return { x: bx, y: by, w: Math.min(W, x1 + pad + 1) - bx, h: Math.min(H, y1 + pad + 1) - by };
}

// How a part meets its parent. size: the part's long side; overlap: px the part reaches behind its
// pivot; reach: radius of the parent's patch; dir: unit vector from the pivot into the part (null
// when the pivot sits at the part's centre, then the overlap goes all round).
export function jointGeometry(box, pivot, { overlap, reach }) {
  const size = Math.max(box.w, box.h);
  const ov = Math.max(2, Math.round(overlap * size));
  const rj = Math.max(ov + 2, Math.round(reach * size));
  const cx = box.x + box.w / 2 - pivot[0],
    cy = box.y + box.h / 2 - pivot[1];
  const len = Math.hypot(cx, cy);
  return { size, ov, rj, dir: len < 1 ? null : [cx / len, cy / len] };
}

// The pixels the part reaches into its parent: within `ov` of the part (a square dilation) and
// not in front of the pivot's line across the part's direction.
export const behindPivot = (x, y, pivot, dir, slack) => !dir || (x + 0.5 - pivot[0]) * dir[0] + (y + 0.5 - pivot[1]) * dir[1] <= slack;

// The rig.json row of a part from its alpha box and the spec.
export const rigRow = (part, box, W, H) => ({
  name: part.name,
  file: `${part.name}.png`,
  x: box.x,
  y: box.y,
  w: box.w,
  h: box.h,
  pivot: pivotPx(part, W, H),
  parent: part.parent,
  z: part.z,
});

// ---- Pixels ----------------------------------------------------------------------------------

// Polygon coverage 0..255 over a W×H frame, anti-aliased by supersampling inside the polygon's box.
function polyCoverage(poly, W, H, ss = 4) {
  const out = new Uint8Array(W * H);
  const box = polyBox(poly, W, H, 1);
  if (!box) return out;
  const sub = polyMask(
    box.w * ss,
    box.h * ss,
    poly.map(([u, v]) => [(u * W - box.x) * ss, (v * H - box.y) * ss]),
  );
  for (let y = 0; y < box.h; y++)
    for (let x = 0; x < box.w; x++) {
      let n = 0;
      for (let j = 0; j < ss; j++) for (let i = 0; i < ss; i++) n += sub[(y * ss + j) * box.w * ss + x * ss + i] ? 1 : 0;
      out[(box.y + y) * W + box.x + x] = Math.round((n / (ss * ss)) * 255);
    }
  return out;
}

// A square max-filter of `r` px over a box of an alpha (separable): the reach of a joint.
function dilate(alpha, W, H, box, r) {
  const x0 = Math.max(0, box.x - r),
    y0 = Math.max(0, box.y - r),
    x1 = Math.min(W, box.x + box.w + r),
    y1 = Math.min(H, box.y + box.h + r);
  const tmp = new Uint8Array(W * H),
    out = new Uint8Array(W * H);
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      let m = 0;
      for (let i = Math.max(x0, x - r); i <= Math.min(x1 - 1, x + r); i++) m = Math.max(m, alpha[y * W + i]);
      tmp[y * W + x] = m;
    }
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      let m = 0;
      for (let j = Math.max(y0, y - r); j <= Math.min(y1 - 1, y + r); j++) m = Math.max(m, tmp[j * W + x]);
      out[y * W + x] = m;
    }
  return out;
}

// Pulls a matte's edge in by `r` px (a square min-filter) and softens it with a 3×3 mean: a matte
// lifted from a painting keeps a halo of the old ground at its rim, and this takes it off.
export function shrinkAlpha(alpha, W, H, r) {
  if (r <= 0) return alpha;
  const pass = (src, horizontal) => {
    const out = new Uint8Array(W * H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        let m = 255;
        for (let d = -r; d <= r; d++) {
          const xx = horizontal ? x + d : x,
            yy = horizontal ? y : y + d;
          m = Math.min(m, xx < 0 || yy < 0 || xx >= W || yy >= H ? 0 : src[yy * W + xx]);
        }
        out[y * W + x] = m;
      }
    return out;
  };
  const eroded = pass(pass(alpha, true), false);
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let sum = 0;
      for (let j = -1; j <= 1; j++)
        for (let i = -1; i <= 1; i++) {
          const xx = x + i,
            yy = y + j;
          sum += xx < 0 || yy < 0 || xx >= W || yy >= H ? 0 : eroded[yy * W + xx];
        }
      out[y * W + x] = Math.round(sum / 9);
    }
  return out;
}

// Who is in the picture: a W×H alpha. "subject" and "birefnet" run the existing local mattes and
// read their alpha back at the picture's own size (which both write unchanged).
function subjectMask(src, mode, W, H, work) {
  if (mode === "none") return new Uint8Array(W * H).fill(255);
  if (mode === "alpha") {
    const { w, h, rgba } = readRGBA(src, Math.max(W, H));
    if (w !== W || h !== H) throw new Error(`rig: the picture reads as ${w}×${h}, not ${W}×${H}`);
    return Uint8Array.from({ length: W * H }, (_, k) => rgba[k * 4 + 3]);
  }
  const png = join(work, "subject.png");
  if (mode === "subject") execFileSync("swift", [join(here, "cutout.swift"), src, png, "--mode", "subject", "--full"], { stdio: ["ignore", "ignore", "inherit"] });
  else execFileSync("uv", ["run", "--script", join(here, "matte.py"), src, png], { stdio: ["ignore", "ignore", "inherit"] });
  const m = readRGBA(png, Math.max(W, H));
  if (m.w !== W || m.h !== H) throw new Error(`rig: the ${mode} matte is ${m.w}×${m.h}, the picture ${W}×${H}`);
  const a = new Uint8Array(W * H);
  for (let i = 0; i < a.length; i++) a[i] = m.rgba[i * 4 + 3];
  return a;
}

// Fills the unknown pixels (mask 255) of a small RGBA window from the known ones, layer by layer
// (each takes the mean of its known neighbours). The fallback when OpenCV is not around.
export function fillNeighbours(rgba, unknown, w, h) {
  const known = Uint8Array.from(unknown, (u) => (u ? 0 : 1));
  for (let layer = 0, left = 1; left && layer < w + h; layer++) {
    left = 0;
    const take = [];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (known[y * w + x]) continue;
        let r = 0,
          g = 0,
          b = 0,
          n = 0;
        for (let j = Math.max(0, y - 1); j <= Math.min(h - 1, y + 1); j++)
          for (let i = Math.max(0, x - 1); i <= Math.min(w - 1, x + 1); i++)
            if (known[j * w + i]) {
              const o = (j * w + i) * 4;
              r += rgba[o];
              g += rgba[o + 1];
              b += rgba[o + 2];
              n++;
            }
        if (n) take.push([y * w + x, r / n, g / n, b / n]);
        else left = 1;
      }
    for (const [p, r, g, b] of take) {
      rgba[p * 4] = r;
      rgba[p * 4 + 1] = g;
      rgba[p * 4 + 2] = b;
      known[p] = 1;
    }
  }
  return rgba;
}

// Fills each job ({rgba, unknown, w, h}) in one python run: OpenCV's TELEA, or with `texture` the
// exemplar synthesis of rig_fill.py (unknown 255 = fill, 128 = neither known nor to fill). Any job
// the run cannot do (no uv, no network for the wheel) falls back to fillNeighbours with a warning.
function inpaintAll(jobs, work, texture = false) {
  jobs = jobs.filter((j) => j.unknown.some((u) => u === 255));
  if (!jobs.length) return;
  const tag = texture ? "t" : "i";
  const files = jobs.map((j, i) => {
    const f = { src: join(work, `fill-${tag}${i}.png`), mask: join(work, `fill-${tag}${i}-mask.png`), out: join(work, `fill-${tag}${i}-out.png`) };
    writePNG(f.src, j.w, j.h, j.rgba);
    const m = new Uint8ClampedArray(j.w * j.h * 4);
    for (let k = 0; k < j.unknown.length; k++) {
      m.fill(j.unknown[k], k * 4, k * 4 + 3);
      m[k * 4 + 3] = 255;
    }
    writePNG(f.mask, j.w, j.h, m);
    return f;
  });
  const run = spawnSync("uv", ["run", "-q", "--with", "opencv-python-headless", "--with", "numpy", join(here, "rig_fill.py"), ...(texture ? ["--texture"] : []), ...files.flatMap((f) => [f.src, f.mask, f.out])], { encoding: "utf8" });
  if (run.status !== 0) console.error(`rig: OpenCV inpaint unavailable (${(run.stderr || run.error?.message || "").trim().split("\n").pop()}); filling from neighbours instead`);
  jobs.forEach((j, i) => {
    if (run.status === 0) j.rgba.set(readRGBA(files[i].out, Math.max(j.w, j.h)).rgba);
    else fillNeighbours(j.rgba, Uint8Array.from(j.unknown, (u) => (u === 255 ? 255 : 0)), j.w, j.h);
  });
}

// The window a "texture" joint synthesises in: the pixels the child owns inside the parent's own
// polygon, farther than `rj` from the pivot (the "copy" patch covers the rest), on a margin of
// parent pixels to copy from. unknown: 255 = fill, 0 = the parent's own pixel, 128 = neither.
// null when the child covers none of the parent's polygon.
export function textureJob(ownChild, ownParent, coverParent, rgba, W, H, pivot, rj, margin = 48) {
  const hole = (k, x, y) => ownChild[k] > 127 && coverParent[k] > 127 && Math.hypot(x + 0.5 - pivot[0], y + 0.5 - pivot[1]) > rj;
  let x0 = W,
    y0 = H,
    x1 = -1,
    y1 = -1;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (hole(y * W + x, x, y)) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
  if (x1 < 0) return null;
  const win = { x: Math.max(0, x0 - margin), y: Math.max(0, y0 - margin) };
  win.w = Math.min(W, x1 + 1 + margin) - win.x;
  win.h = Math.min(H, y1 + 1 + margin) - win.y;
  const wrgba = new Uint8ClampedArray(win.w * win.h * 4);
  const unknown = new Uint8Array(win.w * win.h);
  for (let y = 0; y < win.h; y++)
    for (let x = 0; x < win.w; x++) {
      const k = (y + win.y) * W + x + win.x;
      wrgba.set(rgba.subarray(k * 4, k * 4 + 4), (y * win.w + x) * 4);
      unknown[y * win.w + x] = hole(k, x + win.x, y + win.y) ? 255 : ownParent[k] > 127 ? 0 : 128;
    }
  return { rgba: wrgba, unknown, w: win.w, h: win.h, win };
}

// ---- The rig ---------------------------------------------------------------------------------

export function buildRig(srcPath, specIn, outDir) {
  const spec = parseSpec(specIn);
  const work = mkdtempSync(join(tmpdir(), "rig-"));
  try {
    return build(srcPath, spec, outDir, work);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

function build(srcPath, spec, outDir, work) {
  const [W, H] = uprightSize(srcPath);
  const { rgba } = readRGBA(srcPath, Math.max(W, H));
  const S = spec.subject === "none" ? subjectMask(srcPath, "none", W, H, work) : shrinkAlpha(subjectMask(srcPath, spec.subject, W, H, work), W, H, spec.shrink);
  const parts = spec.parts;
  const N = W * H;

  // Which part owns which pixel: a polygon's coverage, through the subject, minus what later parts
  // take. A later part only takes a pixel it covers fully, so the edge pixels stay in both and the
  // cut leaves no hairline of background at rest.
  const cover = parts.map((p) => (p.poly ? polyCoverage(p.poly, W, H) : new Uint8Array(N).fill(255)));
  const own = parts.map(() => new Uint8Array(N));
  const taken = new Uint8Array(N);
  for (let i = parts.length - 1; i >= 0; i--) {
    for (let k = 0; k < N; k++) {
      const c = cover[i][k];
      if (c && taken[k] < 255) own[i][k] = Math.round((c * S[k]) / 255);
      if (c === 255) taken[k] = 255;
    }
  }
  const idx = new Map(parts.map((p, i) => [p.name, i]));
  const boxes = parts.map((p, i) => alphaBox(own[i], W, H));
  parts.forEach((p, i) => {
    if (!boxes[i]) throw new Error(`rig: ${p.name} is empty (check its poly and the subject)`);
  });

  // Every child reaches past its joint into the parent, and the parent keeps a patch around the
  // pivot, inpainted from its own pixels, for the child to turn away from.
  const alpha = own.map((a) => Uint8Array.from(a));
  const colour = parts.map(() => null);
  const jobs = [],
    textures = [];
  parts.forEach((p, i) => {
    if (p.parent === null) return;
    const pi = idx.get(p.parent);
    const pivot = [p.pivot[0] * W, p.pivot[1] * H];
    const g = jointGeometry(boxes[i], pivot, p);
    const grown = dilate(own[i], W, H, boxes[i], g.ov);
    const gb = { x: Math.max(0, boxes[i].x - g.ov), y: Math.max(0, boxes[i].y - g.ov), w: boxes[i].w + 2 * g.ov, h: boxes[i].h + 2 * g.ov };
    for (let y = gb.y; y < Math.min(H, gb.y + gb.h); y++)
      for (let x = gb.x; x < Math.min(W, gb.x + gb.w); x++) {
        const k = y * W + x;
        if (grown[k] && !own[i][k] && own[pi][k] && behindPivot(x, y, pivot, g.dir, g.ov)) alpha[i][k] = Math.max(alpha[i][k], own[pi][k]);
      }
    // The patch: the part's pixels within `rj` of the pivot, filled from what the parent has.
    const win = {
      x: Math.max(0, Math.floor(pivot[0] - g.rj * 2)),
      y: Math.max(0, Math.floor(pivot[1] - g.rj * 2)),
    };
    win.w = Math.min(W, Math.ceil(pivot[0] + g.rj * 2)) - win.x;
    win.h = Math.min(H, Math.ceil(pivot[1] + g.rj * 2)) - win.y;
    const wrgba = new Uint8ClampedArray(win.w * win.h * 4);
    const unknown = new Uint8Array(win.w * win.h);
    for (let y = 0; y < win.h; y++)
      for (let x = 0; x < win.w; x++) {
        const k = (y + win.y) * W + x + win.x;
        wrgba.set(rgba.subarray(k * 4, k * 4 + 4), (y * win.w + x) * 4);
        unknown[y * win.w + x] = own[pi][k] > 127 ? 0 : 255;
      }
    // "copy" keeps the child's own pixels around the joint as the parent's patch: no invention,
    // right when parent and child are the same cloth (a sleeve); "inpaint" suits a joint where
    // the child is another material than what lies under it (a hand over a sleeve).
    if (p.fill === "copy" || p.fill === "texture") unknown.fill(0);
    jobs.push({ rgba: wrgba, unknown, w: win.w, h: win.h, win, i, pi, pivot, rj: g.rj });
    if (p.fill === "texture") {
      // Beyond the patch, wherever the child lay over the parent's own polygon: rebuilt from the
      // parent's nearby pixels (the parent's polygon says how far the parent really reaches).
      const t = textureJob(own[i], own[pi], cover[pi], rgba, W, H, pivot, g.rj);
      if (t) textures.push({ ...t, i, pi });
    }
  });
  inpaintAll(jobs, work);
  inpaintAll(textures, work, true);
  for (const t of textures) {
    colour[t.pi] ??= Uint8ClampedArray.from(rgba);
    for (let y = 0; y < t.h; y++)
      for (let x = 0; x < t.w; x++) {
        if (t.unknown[y * t.w + x] !== 255) continue;
        const k = (y + t.win.y) * W + x + t.win.x;
        alpha[t.pi][k] = 255;
        colour[t.pi].set(t.rgba.subarray((y * t.w + x) * 4, (y * t.w + x) * 4 + 3), k * 4);
      }
  }
  for (const j of jobs) {
    colour[j.pi] ??= Uint8ClampedArray.from(rgba);
    for (let y = 0; y < j.h; y++)
      for (let x = 0; x < j.w; x++) {
        const k = (y + j.win.y) * W + x + j.win.x;
        if (!own[j.i][k]) continue;
        const d = Math.hypot(x + j.win.x + 0.5 - j.pivot[0], y + j.win.y + 0.5 - j.pivot[1]);
        const a = Math.round(255 * Math.min(1, Math.max(0, j.rj - d + 0.5)));
        if (a <= alpha[j.pi][k]) continue;
        alpha[j.pi][k] = a;
        colour[j.pi].set(j.rgba.subarray((y * j.w + x) * 4, (y * j.w + x) * 4 + 3), k * 4);
      }
  }

  // A painted underlay wins over every fill: it replaces the parent's pixels under its child.
  parts.forEach((p, i) => {
    if (!p.underlay) return;
    const file = join(outDir, p.underlay);
    if (!existsSync(file)) throw new Error(`rig: ${p.name} underlay ${file} is missing`);
    const u = readRGBA(file, Math.max(W, H));
    if (u.w !== W || u.h !== H) throw new Error(`rig: ${p.name} underlay is ${u.w}×${u.h}, the picture ${W}×${H}`);
    const pi = idx.get(p.parent);
    colour[pi] ??= Uint8ClampedArray.from(rgba);
    for (let k = 0; k < N; k++) {
      if (own[i][k] <= 127 || cover[pi][k] <= 127 || u.rgba[k * 4 + 3] === 0) continue;
      alpha[pi][k] = Math.max(alpha[pi][k], u.rgba[k * 4 + 3]);
      colour[pi].set(u.rgba.subarray(k * 4, k * 4 + 3), k * 4);
    }
  });

  // Crop every part to its box (plus the oven's rim) and write it.
  mkdirSync(outDir, { recursive: true });
  const o = spec.oven ? { seed: 1, rim: 3, depth: 2, ...spec.oven } : null;
  const pad = o ? o.rim + o.depth + 2 : 0;
  const rows = parts.map((p, i) => {
    const box = alphaBox(alpha[i], W, H, pad);
    const src = colour[i] ?? rgba;
    let sub = new Uint8ClampedArray(box.w * box.h * 4);
    const subA = new Uint8Array(box.w * box.h);
    for (let y = 0; y < box.h; y++)
      for (let x = 0; x < box.w; x++) {
        const k = (y + box.y) * W + x + box.x,
          d = y * box.w + x;
        sub.set(src.subarray(k * 4, k * 4 + 3), d * 4);
        sub[d * 4 + 3] = alpha[i][k];
        subA[d] = alpha[i][k] > 127 ? 255 : 0;
      }
    if (o) {
      sub = bake(sub, box.w, box.h, { alpha: subA, seed: o.seed + i, rim: o.rim, depth: o.depth, ...(o.paper && { paper: o.paper }), ...(o.grain !== undefined && { grain: o.grain }) });
    }
    writePNG(join(outDir, `${p.name}.png`), box.w, box.h, sub);
    return rigRow(p, box, W, H);
  });
  for (const e of spec.extras) {
    const file = join(outDir, e.file);
    if (!existsSync(file)) throw new Error(`rig: extra ${e.name}: ${file} is missing`);
    const [w, h] = uprightSize(file);
    rows.push({ name: e.name, file: e.file, x: e.x, y: e.y, w, h, pivot: [+(e.x + e.pivot[0] * w).toFixed(2), +(e.y + e.pivot[1] * h).toFixed(2)], parent: e.parent, z: e.z, hidden: true });
  }
  const rig = { size: [W, H], parts: rows };
  writeFileSync(join(outDir, "rig.json"), JSON.stringify(rig, null, 2) + "\n");
  return rig;
}

// ---- Preview ---------------------------------------------------------------------------------

// Paints one part into an RGB frame through its pose matrix (bilinear, straight alpha over the
// frame), by walking the destination pixels back into the part. The matrix is the one the film
// page gets from core/lib/rig.js, so the preview checks the runtime's maths too.
function paintPart(frame, fw, fh, part, m) {
  const det = m[0] * m[3] - m[1] * m[2];
  const inv = [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det];
  const corners = [
    [0, 0],
    [part.w, 0],
    [0, part.h],
    [part.w, part.h],
  ].map(([u, v]) => [m[0] * u + m[2] * v + m[4], m[1] * u + m[3] * v + m[5]]);
  const x0 = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[0]))) - 1),
    x1 = Math.min(fw, Math.ceil(Math.max(...corners.map((c) => c[0]))) + 1),
    y0 = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[1]))) - 1),
    y1 = Math.min(fh, Math.ceil(Math.max(...corners.map((c) => c[1]))) + 1);
  const { w, h, premult } = part.pixels;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const dx = x + 0.5 - m[4],
        dy = y + 0.5 - m[5];
      const u = inv[0] * dx + inv[2] * dy - 0.5,
        v = inv[1] * dx + inv[3] * dy - 0.5;
      const iu = Math.floor(u),
        iv = Math.floor(v);
      if (iu < -1 || iv < -1 || iu >= w || iv >= h) continue;
      const fu = u - iu,
        fv = v - iv;
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (const [ox, oy, wt] of [
        [0, 0, (1 - fu) * (1 - fv)],
        [1, 0, fu * (1 - fv)],
        [0, 1, (1 - fu) * fv],
        [1, 1, fu * fv],
      ]) {
        const sx = iu + ox,
          sy = iv + oy;
        if (sx < 0 || sy < 0 || sx >= w || sy >= h || !wt) continue;
        const o = (sy * w + sx) * 4;
        r += premult[o] * wt;
        g += premult[o + 1] * wt;
        b += premult[o + 2] * wt;
        a += premult[o + 3] * wt;
      }
      if (a <= 0) continue;
      const d = (y * fw + x) * 3;
      frame[d] = r + frame[d] * (1 - a);
      frame[d + 1] = g + frame[d + 1] * (1 - a);
      frame[d + 2] = b + frame[d + 2] * (1 - a);
    }
}

// preview.mp4: every child swings ±swing degrees about its pivot over `seconds`, on a flat
// grey table, so the joints can be judged by eye.
export function renderPreview(rig, dir, { swing = 20, seconds = 2, fps = 24, maxSide = 960, script = null } = {}) {
  if (script) {
    seconds = script.seconds ?? 3;
    fps = script.fps ?? 24;
  }
  const pad = Math.round((script?.pad ?? 0) * Math.max(...rig.size));
  const k = Math.min(1, maxSide / (Math.max(...rig.size) + 2 * pad));
  const fw = Math.ceil(((rig.size[0] + 2 * pad) * k) / 2) * 2,
    fh = Math.ceil(((rig.size[1] + 2 * pad) * k) / 2) * 2;
  const parts = rig.parts.map((p) => {
    const { w, h, rgba } = readRGBA(join(dir, p.file), Math.max(p.w, p.h));
    const premult = new Float32Array(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const a = rgba[i * 4 + 3] / 255;
      for (let c = 0; c < 3; c++) premult[i * 4 + c] = rgba[i * 4 + c] * a;
      premult[i * 4 + 3] = a;
    }
    return { ...p, pixels: { w, h, premult } };
  });
  const posed = { ...rig, parts };
  const total = Math.round(seconds * fps);
  const chunks = [];
  for (let f = 0; f < total; f++) {
    let angles, show;
    if (script) {
      const t = f / fps;
      angles = stepPose(t, script.keys, fps, { ease: script.ease });
      show = [...script.keys].sort((a, b) => a.t - b.t).filter((key) => key.t <= t + 1e-9 && key.show).at(-1)?.show ?? [];
    } else {
      angles = Object.fromEntries(parts.filter((p) => p.parent !== null && !p.hidden).map((p) => [p.name, swing * Math.sin((2 * Math.PI * f) / total)]));
      show = [];
    }
    const frame = new Float32Array(fw * fh * 3);
    for (let i = 0; i < frame.length; i += 3) frame.set([125, 123, 117], i);
    for (const { part, matrix } of drawOrder(poseMatrices(posed, angles, { scale: k, x: pad * k, y: pad * k }))) if (!part.hidden || show.includes(part.name)) paintPart(frame, fw, fh, part, matrix);
    chunks.push(Buffer.from(Uint8ClampedArray.from(frame)));
  }
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${fw}x${fh}`, "-r", String(fps), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", join(dir, "preview.mp4")], { input: Buffer.concat(chunks), maxBuffer: 1 << 20 });
}

// ---- CLI -------------------------------------------------------------------------------------

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const take = (flag, fallback) => {
    const i = args.indexOf(flag);
    if (i < 0) return fallback;
    const [, v] = args.splice(i, 2);
    return v;
  };
  const noPreview = args.includes("--no-preview");
  if (noPreview) args.splice(args.indexOf("--no-preview"), 1);
  const out = take("--out");
  const swing = Number(take("--swing", 20));
  if (args.length !== 2 || !out || !Number.isFinite(swing)) {
    console.error("usage: node core/reference/rig.mjs <image> <spec.json> --out <dir> [--swing 20] [--no-preview]");
    process.exit(2);
  }
  try {
    const spec = JSON.parse(readFileSync(args[1], "utf8"));
    const rig = buildRig(args[0], spec, out);
    console.log(`rig: ${rig.parts.length} parts → ${out}/rig.json (${rig.size.join("×")})`);
    if (!noPreview) {
      renderPreview(rig, out, { swing, script: spec.preview });
      console.log(`rig: preview → ${out}/preview.mp4`);
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
