import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseSpec, polyBox, alphaBox, pivotPx, jointGeometry, behindPivot, rigRow, fillNeighbours, shrinkAlpha, textureJob, buildRig } from "../reference/rig.mjs";
import { readRGBA, writePNG } from "../reference/regions.mjs";
import { rotateAbout, apply, poseMatrices, drawOrder, drawRig, checkRig, stepPose, quantize, cssMatrix } from "../reference/rig-pose.js";

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);
const closePt = (p, q, eps = 1e-6) => {
  close(p[0], q[0], eps);
  close(p[1], q[1], eps);
};
const square = [
  [0.1, 0.1],
  [0.5, 0.1],
  [0.5, 0.5],
  [0.1, 0.5],
];
const spec = (extra = {}) => ({
  subject: "none",
  parts: [
    { name: "body", pivot: [0.5, 0.5], parent: null },
    { name: "arm", poly: square, pivot: [0.3, 0.3], parent: "body", z: 1 },
    ...(extra.parts ?? []),
  ],
});

// ---- spec ----------------------------------------------------------------------------------

test("a spec gets its defaults and the root may leave out its poly", () => {
  const s = parseSpec(spec());
  assert.equal(s.subject, "none");
  assert.equal(s.shrink, 2);
  assert.equal(s.parts[0].poly, null);
  assert.deepEqual(
    { overlap: s.parts[1].overlap, reach: s.parts[1].reach, fill: s.parts[1].fill, z: s.parts[0].z },
    { overlap: 0.03, reach: 0.3, fill: "inpaint", z: 0 },
  );
  assert.equal(parseSpec({ parts: [{ name: "only", pivot: [0, 0], parent: null }] }).subject, "none");
});

test("a bad spec says which part is wrong and why", () => {
  const bad = (mut, re) => assert.throws(() => parseSpec(mut(spec())), re);
  bad((s) => ((s.subject = "magic"), s), /subject must be/);
  bad((s) => ((s.parts = []), s), /non-empty/);
  bad((s) => ((s.parts[1].name = "a b"), s), /file-safe name/);
  bad((s) => ((s.parts[1].name = "body"), s), /duplicate name/);
  bad((s) => ((s.parts[1].parent = "ghost"), s), /must be listed before/);
  bad((s) => ((s.parts[1].parent = null), s), /only the first part/);
  bad((s) => ((s.parts[0].parent = "arm"), s), /root, its parent must be null/);
  bad((s) => (delete s.parts[1].poly, s), /needs a poly/);
  bad((s) => ((s.parts[1].poly = square.slice(0, 2)), s), /bad poly/);
  bad((s) => ((s.parts[1].pivot = [1.2, 0.5]), s), /pivot/);
  bad((s) => (delete s.parts[1].pivot, s), /pivot/);
  bad((s) => ((s.parts[1].overlap = 0.9), s), /overlap/);
  bad((s) => ((s.parts[1].reach = -1), s), /reach/);
  bad((s) => ((s.parts[1].fill = "paint"), s), /fill/);
  assert.equal(parseSpec(((s) => ((s.parts[1].fill = "texture"), s))(spec())).parts[1].fill, "texture");
  bad((s) => ((s.parts[1].z = "up"), s), /z must/);
});

// ---- pivot and bbox maths ------------------------------------------------------------------

test("pivots and polygon boxes land in source px", () => {
  assert.deepEqual(pivotPx({ pivot: [0.25, 0.5] }, 400, 200), [100, 100]);
  assert.deepEqual(polyBox(square, 100, 200), { x: 10, y: 20, w: 40, h: 80 });
  assert.deepEqual(polyBox(square, 100, 200, 5), { x: 5, y: 15, w: 50, h: 90 });
  // Grown and clamped to the picture.
  assert.deepEqual(polyBox([[0, 0], [1, 0], [1, 1]], 10, 10, 3), { x: 0, y: 0, w: 10, h: 10 });
  assert.equal(polyBox([[2, 2], [3, 2], [3, 3]], 10, 10), null);
});

test("the alpha box covers the visible pixels, plus a pad, clamped", () => {
  const a = new Uint8Array(10 * 8);
  a[2 * 10 + 3] = 255;
  a[4 * 10 + 6] = 255;
  a[7 * 10 + 9] = 4; // below the threshold: not part of the shape
  assert.deepEqual(alphaBox(a, 10, 8), { x: 3, y: 2, w: 4, h: 3 });
  assert.deepEqual(alphaBox(a, 10, 8, 2), { x: 1, y: 0, w: 8, h: 7 });
  assert.equal(alphaBox(new Uint8Array(4), 2, 2), null);
});

test("a joint reaches ov px behind the pivot and keeps a patch of rj", () => {
  const g = jointGeometry({ x: 0, y: 0, w: 200, h: 100 }, [0, 50], { overlap: 0.03, reach: 0.3 });
  assert.equal(g.size, 200);
  assert.equal(g.ov, 6);
  assert.equal(g.rj, 60);
  closePt(g.dir, [1, 0]);
  // Pivot at the centre: no direction, the overlap goes all round.
  assert.equal(jointGeometry({ x: 0, y: 0, w: 10, h: 10 }, [5, 5], { overlap: 0, reach: 0 }).dir, null);
  assert.equal(jointGeometry({ x: 0, y: 0, w: 10, h: 10 }, [5, 5], { overlap: 0, reach: 0 }).ov, 2);
  // Behind the pivot's line is in, in front is out.
  assert.ok(behindPivot(-3, 50, [0, 50], [1, 0], 6));
  assert.ok(!behindPivot(20, 50, [0, 50], [1, 0], 6));
  assert.ok(behindPivot(20, 50, [0, 50], null, 6));
});

test("a rig.json row holds the box and the pivot in source px", () => {
  const part = parseSpec(spec()).parts[1];
  assert.deepEqual(rigRow(part, { x: 10, y: 20, w: 40, h: 80 }, 100, 200), {
    name: "arm",
    file: "arm.png",
    x: 10,
    y: 20,
    w: 40,
    h: 80,
    pivot: [30, 60],
    parent: "body",
    z: 1,
  });
});

test("the matte edge is pulled in and softened; the neighbour fill closes a hole", () => {
  const W = 9,
    H = 9;
  const a = new Uint8Array(W * H).fill(255);
  const s = shrinkAlpha(a, W, H, 1);
  assert.ok(s[4 * W + 4] === 255 && s[0] < 100, "inside stays, the frame edge goes");
  assert.equal(shrinkAlpha(a, W, H, 0), a);
  const rgba = new Uint8ClampedArray(3 * 3 * 4);
  for (let i = 0; i < 9; i++) rgba.set([200, 100, 50, 255], i * 4);
  const unknown = new Uint8Array(9);
  unknown[4] = 255;
  rgba.set([0, 0, 0, 255], 16);
  fillNeighbours(rgba, unknown, 3, 3);
  assert.deepEqual([...rgba.subarray(16, 19)], [200, 100, 50]);
});

// ---- the runtime ---------------------------------------------------------------------------

// body → arm (pivot at its shoulder) → hand (pivot at the wrist), laid along x.
const arm = () => ({
  size: [100, 40],
  parts: [
    { name: "body", x: 0, y: 0, w: 10, h: 40, pivot: [5, 20], parent: null, z: 0 },
    { name: "arm", x: 10, y: -2, w: 20, h: 4, pivot: [10, 0], parent: "body", z: 1 },
    { name: "hand", x: 30, y: -3, w: 6, h: 6, pivot: [30, 0], parent: "arm", z: 2 },
  ],
});
const byName = (poses, n) => poses.find((p) => p.part.name === n).matrix;

test("at rest every part sits at its own source position", () => {
  const poses = poseMatrices(arm());
  closePt(apply(byName(poses, "body"), [0, 0]), [0, 0]);
  closePt(apply(byName(poses, "arm"), [0, 0]), [10, -2]);
  closePt(apply(byName(poses, "hand"), [0, 0]), [30, -3]);
});

test("a child turns about its pivot, and its own children ride along (parent chain)", () => {
  const near = (m, p, q) => closePt(apply(m, p), q, 1e-9);
  // The arm turned 90° clockwise about the shoulder (10, 0): the wrist (30, 0) swings down to (10, 20).
  let poses = poseMatrices(arm(), { arm: 90 });
  // The hand's own pivot, drawn through the matrix of its image: source (30, 0) is local (0, 3).
  near(byName(poses, "hand"), [0, 3], [10, 20]);
  // The arm's tip (source (30, -2) → local (20, 0)) went with it.
  near(byName(poses, "arm"), [20, 2], [10, 20]);
  // The hand also turns 90° about the wrist: its top-left (source (30, -3), 3 above the wrist) goes
  // 3 right of the wrist in the arm's frame, which the arm then swings to 3 below it.
  poses = poseMatrices(arm(), { arm: 90, hand: 90 });
  near(byName(poses, "hand"), [0, 3], [10, 20]);
  near(byName(poses, "hand"), [0, 0], [10, 23]);
  // Turning the root carries everything about the root's pivot.
  poses = poseMatrices(arm(), { body: 180 });
  near(byName(poses, "arm"), [0, 2], [0, 40]);
  near(byName(poses, "hand"), [0, 3], [-20, 40]);
});

test("placing a rig: scale and origin land the origin point on x, y", () => {
  const poses = poseMatrices(arm(), {}, { x: 500, y: 300, scale: 2, origin: [10, 0] });
  closePt(apply(byName(poses, "arm"), [0, 2]), [500, 300]); // source (10, 0) → the stage point
  closePt(apply(byName(poses, "hand"), [0, 3]), [500 + 40, 300]); // 20 px right, doubled
  const turned = poseMatrices(arm(), { arm: 90 }, { x: 500, y: 300, scale: 2, origin: [10, 0] });
  closePt(apply(byName(turned, "hand"), [0, 3]), [500, 300 + 40]);
});

test("rotateAbout keeps its centre and turns clockwise on a y-down screen", () => {
  closePt(apply(rotateAbout(37, 5, 7), [5, 7]), [5, 7]);
  closePt(apply(rotateAbout(90, 0, 0), [1, 0]), [0, 1]);
  assert.match(cssMatrix(rotateAbout(90, 0, 0)), /^matrix\(0,1,-1,0,0,0\)$/);
});

test("a rig with an unknown parent, a loop or no parts is refused", () => {
  const r = arm();
  r.parts[1].parent = "ghost";
  assert.throws(() => checkRig(r), /unknown parent/);
  const loop = arm();
  loop.parts[0].parent = "hand";
  assert.throws(() => checkRig(loop), /parent loop/);
  assert.throws(() => checkRig({ parts: [] }), /no parts/);
  const dup = arm();
  dup.parts[2].name = "arm";
  assert.throws(() => checkRig(dup), /duplicate/);
});

test("z orders the paint, the file order breaks ties", () => {
  const r = arm();
  r.parts[0].z = 5;
  r.parts[2].z = 1;
  assert.deepEqual(drawOrder(poseMatrices(r)).map((p) => p.part.name), ["arm", "hand", "body"]);
});

// ---- stepped poses -------------------------------------------------------------------------

const KEYS = [
  { t: 0, angles: { arm: 0, hand: 10 } },
  { t: 1, angles: { arm: 40 } },
  { t: 2, angles: { arm: 0, hand: -10 } },
];

test("stepPose holds each key until the next, on a 12 fps grid", () => {
  assert.deepEqual(stepPose(0.5, KEYS), { arm: 0, hand: 10 });
  assert.deepEqual(stepPose(0.999, KEYS), { arm: 0, hand: 10 });
  // A part a key leaves out keeps its last angle.
  assert.deepEqual(stepPose(1, KEYS), { arm: 40, hand: 10 });
  assert.deepEqual(stepPose(5, KEYS), { arm: 0, hand: -10 });
  assert.deepEqual(stepPose(-3, KEYS), { arm: 0, hand: 10 });
  // Same pose for every t inside one 1/12 s step: the key at 1 s is reached at the step that holds it.
  assert.equal(quantize(0.2, 12), 2 / 12);
  assert.equal(quantize(1 / 12, 12), 1 / 12);
});

test("keys given out of order are sorted, a single key is a still pose", () => {
  assert.deepEqual(stepPose(1.5, [...KEYS].reverse()), { arm: 40, hand: 10 });
  assert.deepEqual(stepPose(9, [{ t: 3, angles: { a: 7 } }]), { a: 7 });
  assert.throws(() => stepPose(0, []), /no keys/);
});

test("with ease the angles travel between keys, still in fps steps", () => {
  const lin = stepPose(0.5, KEYS, 12, { ease: "linear" });
  close(lin.arm, 20);
  close(lin.hand, 10);
  // Snapped: any t inside one step gives the same pose.
  assert.deepEqual(stepPose(0.5, KEYS, 12, { ease: "linear" }), stepPose(0.5 + 0.03, KEYS, 12, { ease: "linear" }));
  close(stepPose(0.25, KEYS, 12, { ease: "in" }).arm, 40 * 0.25 ** 2);
  close(stepPose(0.25, KEYS, 12, { ease: (p) => p / 2 }).arm, 40 * 0.125);
  assert.deepEqual(stepPose(5, KEYS, 12, { ease: "inOut" }), { arm: 0, hand: -10 });
  assert.throws(() => stepPose(0, KEYS, 12, { ease: "bounce" }), /unknown ease/);
});

// ---- one real run on a synthetic picture ----------------------------------------------------

test("a tiny picture is cut into parts that hold their own pixels", { timeout: 60_000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), "rig-test-"));
  try {
    const src = join(dir, "src.png");
    // 80×60: red on the left half, blue on the right.
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=red:s=40x60", "-f", "lavfi", "-i", "color=blue:s=40x60", "-filter_complex", "[0][1]hstack", "-frames:v", "1", src]);
    const rig = buildRig(
      src,
      {
        subject: "none",
        parts: [
          { name: "body", pivot: [0.5, 0.5], parent: null },
          { name: "wing", poly: [[0, 0], [0.5, 0], [0.5, 1], [0, 1]], pivot: [0.5, 0.5], parent: "body", fill: "copy" },
        ],
      },
      join(dir, "out"),
    );
    assert.deepEqual(rig.size, [80, 60]);
    const wing = rig.parts.find((p) => p.name === "wing");
    const body = rig.parts.find((p) => p.name === "body");
    assert.deepEqual(wing.pivot, [40, 30]);
    assert.equal(wing.parent, "body");
    assert.equal(wing.x, 0);
    // The wing is the left half plus its reach behind the pivot (into the body); the body keeps the
    // right half plus the patch around the pivot, so a turned wing never opens a hole.
    assert.ok(wing.w >= 40 && wing.w <= 40 + 4, `wing width ${wing.w}`);
    assert.ok(body.x < 40 && body.x + body.w === 80, `body spans ${body.x}..${body.x + body.w}`);
    assert.ok(existsSync(join(dir, "out", "wing.png")) && existsSync(join(dir, "out", "rig.json")));
    assert.deepEqual(JSON.parse(readFileSync(join(dir, "out", "rig.json"), "utf8")), rig);
    // The wing's own pixel is red.
    const px = (file, x, y) => [...execFileSync("ffmpeg", ["-loglevel", "error", "-i", join(dir, "out", file), "-vf", `crop=1:1:${x}:${y}`, "-f", "rawvideo", "-pix_fmt", "rgba", "-"]).subarray(0, 4)];
    const [r, g, b, a] = px("wing.png", 5, 30);
    assert.ok(r > 200 && g < 40 && b < 40 && a === 255);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---- texture fill ---------------------------------------------------------------------------

test("a texture joint fills what the child covered of the parent's polygon, beyond the patch", () => {
  const W = 20,
    H = 10;
  const own = (x0, x1) => Uint8Array.from({ length: W * H }, (_, k) => (k % W >= x0 && k % W < x1 ? 255 : 0));
  const child = own(10, 20),
    parent = own(0, 10),
    cover = new Uint8Array(W * H).fill(255);
  const rgba = new Uint8ClampedArray(W * H * 4).fill(200);
  const t = textureJob(child, parent, cover, rgba, W, H, [10, 5], 2, 3);
  // The hole is the child's pixels farther than rj = 2 from the pivot; the parent's are known.
  const at = (x, y) => t.unknown[(y - t.win.y) * t.w + (x - t.win.x)];
  assert.equal(at(15, 5), 255);
  assert.equal(at(10, 5), 128, "within rj of the pivot belongs to the copy patch: neither known nor to fill");
  assert.equal(at(9, 5), 0, "the parent's own pixel is a known source");
  // Where the parent's polygon does not reach, the child's pixels are neither known nor to fill.
  const half = new Uint8Array(W * H);
  for (let k = 0; k < W * H; k++) half[k] = k % W < 14 ? 255 : 0;
  const u = textureJob(child, parent, half, rgba, W, H, [10, 5], 2, 3);
  const ua = (x, y) => u.unknown[(y - u.win.y) * u.w + (x - u.win.x)];
  assert.equal(ua(12, 5), 255);
  assert.equal(ua(16, 5), 128);
  // A child that lies wholly within the patch, or outside the parent's polygon, needs none.
  assert.equal(textureJob(child, parent, new Uint8Array(W * H), rgba, W, H, [10, 5], 2, 3), null);
});

test("rig_fill --texture carries engraved stripes into a hole", { timeout: 120_000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), "rig-fill-"));
  try {
    const W = 96,
      H = 96;
    const img = new Uint8ClampedArray(W * H * 4),
      holed = new Uint8ClampedArray(W * H * 4),
      mask = new Uint8ClampedArray(W * H * 4);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4,
          v = Math.floor(y / 3) % 2 ? 30 : 225,
          hole = x >= 36 && x < 60 && y >= 36 && y < 60;
        img.set([v, v, v, 255], o);
        holed.set(hole ? [255, 0, 255, 255] : [v, v, v, 255], o);
        mask.set(hole ? [255, 255, 255, 255] : [0, 0, 0, 255], o);
      }
    writePNG(join(dir, "in.png"), W, H, holed);
    writePNG(join(dir, "mask.png"), W, H, mask);
    execFileSync("uv", ["run", "-q", "--with", "opencv-python-headless", "--with", "numpy", join(import.meta.dirname, "..", "reference", "rig_fill.py"), "--texture", join(dir, "in.png"), join(dir, "mask.png"), join(dir, "out.png")]);
    const out = readRGBA(join(dir, "out.png"), 96).rgba;
    let same = 0,
      total = 0;
    for (let y = 36; y < 60; y++)
      for (let x = 36; x < 60; x++) {
        total++;
        if (Math.abs(out[(y * W + x) * 4] - img[(y * W + x) * 4]) < 40) same++;
      }
    // Stripes of the right phase come back; a smooth fill would settle on mid grey (0 matches).
    assert.ok(same / total > 0.9, `${same}/${total} hole pixels match the stripes`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a texture joint leaves the parent opaque where the child was, and only there", { timeout: 120_000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), "rig-tex-"));
  try {
    const W = 80,
      H = 60;
    const rgba = new Uint8ClampedArray(W * H * 4);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) rgba.set(x < 40 ? [200, 20, 20, 255] : [20, 20, 200, 255], (y * W + x) * 4);
    const src = join(dir, "src.png");
    writePNG(src, W, H, rgba);
    // The body's polygon reaches 3/4 across; the wing covers the right half, beyond it nothing.
    const rig = buildRig(
      src,
      {
        subject: "none",
        parts: [
          { name: "body", pivot: [0.5, 0.5], parent: null, poly: [[0, 0], [0.75, 0], [0.75, 1], [0, 1]] },
          { name: "wing", poly: [[0.5, 0], [1, 0], [1, 1], [0.5, 1]], pivot: [0.5, 0.5], parent: "body", fill: "texture", reach: 0.05 },
        ],
      },
      join(dir, "out"),
    );
    const body = rig.parts.find((p) => p.name === "body");
    const { rgba: b } = readRGBA(join(dir, "out", "body.png"), Math.max(body.w, body.h));
    const px = (x, y) => [...b.subarray(((y - body.y) * body.w + (x - body.x)) * 4, ((y - body.y) * body.w + (x - body.x)) * 4 + 4)];
    const [r, , bl, a] = px(55, 30);
    assert.ok(a === 255 && r > 150 && bl < 80, `inside the body's polygon the hole is rebuilt from red, got ${[r, bl, a]}`);
    assert.ok(body.x + body.w <= 62, `the body stops at its polygon, not at the wing's edge: ${body.x + body.w}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---- alpha matte, overlay extras, scripted preview ------------------------------------------

test("subject alpha takes the cut-out's own transparency; extras are hidden overlay rows", { timeout: 60_000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), "rig-alpha-"));
  try {
    const src = join(dir, "src.png");
    // 40×40: opaque red in the left half, fully transparent right half.
    const rgba = new Uint8ClampedArray(40 * 40 * 4);
    for (let y = 0; y < 40; y++) for (let x = 0; x < 20; x++) rgba.set([255, 0, 0, 255], (y * 40 + x) * 4);
    writePNG(src, 40, 40, rgba);
    const out = join(dir, "out");
    mkdirSync(out);
    writePNG(join(out, "lids.png"), 6, 4, new Uint8ClampedArray(6 * 4 * 4).fill(255));
    const rig = buildRig(
      src,
      {
        subject: "alpha",
        shrink: 0,
        parts: [{ name: "body", pivot: [0.25, 0.5], parent: null }],
        extras: [{ name: "lids", file: "lids.png", x: 5, y: 7, parent: "body", z: 2 }],
      },
      out,
    );
    const body = rig.parts.find((p) => p.name === "body");
    assert.deepEqual([body.x, body.w], [0, 20], "the transparent half is not part of the body");
    const lids = rig.parts.find((p) => p.name === "lids");
    assert.deepEqual({ x: lids.x, y: lids.y, w: lids.w, h: lids.h, parent: lids.parent, z: lids.z, hidden: lids.hidden }, { x: 5, y: 7, w: 6, h: 4, parent: "body", z: 2, hidden: true });
    assert.deepEqual(lids.pivot, [8, 9]);
    assert.throws(() => buildRig(src, { subject: "alpha", parts: [{ name: "body", parent: null }], extras: [{ name: "gone", file: "gone.png", x: 0, y: 0, parent: "body" }] }, out), /gone\.png is missing/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a bad extra or preview script is refused", () => {
  const base = { subject: "none", parts: [{ name: "body", pivot: [0.5, 0.5], parent: null }] };
  const bad = (extra, re) => assert.throws(() => parseSpec({ ...base, ...extra }), re);
  bad({ extras: [{ name: "lids", file: "../lids.png", x: 0, y: 0, parent: "body" }] }, /PNG file name/);
  bad({ extras: [{ name: "lids", file: "lids.png", x: 0, y: 0, parent: "nobody" }] }, /parent "nobody"/);
  bad({ extras: [{ name: "body", file: "lids.png", x: 0, y: 0, parent: "body" }] }, /own file-safe name/);
  bad({ preview: { keys: [] } }, /preview\.keys/);
  bad({ preview: { keys: [{ t: 0 }], pad: 2 } }, /preview\.pad/);
  const ok = parseSpec({ ...base, preview: { keys: [{ t: 0, angles: {} }] }, extras: [{ name: "lids", file: "lids.png", x: 1.4, y: 2, parent: "body" }] });
  assert.deepEqual([ok.extras[0].x, ok.extras[0].z, ok.extras[0].pivot], [1, 1, [0.5, 0.5]]);
});

test("drawRig skips a hidden part unless the pose shows it", () => {
  const rig = { size: [10, 10], parts: [{ name: "body", x: 0, y: 0, w: 10, h: 10, pivot: [5, 5], parent: null, z: 0, img: {} }, { name: "lids", x: 2, y: 2, w: 4, h: 2, pivot: [4, 3], parent: "body", z: 1, hidden: true, img: {} }] };
  const drawn = (show) => {
    const names = [];
    const ctx = { drawImage: (img) => names.push(img === rig.parts[0].img ? "body" : "lids"), save() {}, restore() {}, setTransform() {} };
    drawRig(ctx, rig, { show });
    return names;
  };
  assert.deepEqual(drawn(), ["body"]);
  assert.deepEqual(drawn(["lids"]), ["body", "lids"]);
});

test("an underlay paints what the parent holds under its child, replacing any fill", { timeout: 60_000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), "rig-under-"));
  try {
    const src = join(dir, "src.png");
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=red:s=40x60", "-f", "lavfi", "-i", "color=blue:s=40x60", "-filter_complex", "[0][1]hstack", "-frames:v", "1", src]);
    const out = join(dir, "out");
    mkdirSync(out);
    const green = new Uint8ClampedArray(80 * 60 * 4);
    for (let k = 0; k < 80 * 60; k++) green.set([0, 255, 0, 255], k * 4);
    writePNG(join(out, "under.png"), 80, 60, green);
    const spec = (underlay) => ({
      subject: "none",
      parts: [
        { name: "body", pivot: [0.5, 0.5], parent: null },
        { name: "wing", poly: [[0, 0], [0.5, 0], [0.5, 1], [0, 1]], pivot: [0.9, 0.5], parent: "body", fill: "copy", reach: 0, overlap: 0, ...(underlay && { underlay }) },
      ],
    });
    const px = (file, x, y) => [...execFileSync("ffmpeg", ["-loglevel", "error", "-i", join(out, file), "-vf", `crop=1:1:${x}:${y}`, "-f", "rawvideo", "-pix_fmt", "rgba", "-"]).subarray(0, 4)];
    const bare = buildRig(src, spec(null), out);
    const b0 = bare.parts.find((p) => p.name === "body");
    assert.equal(b0.x, 40, "without an underlay the body holds nothing where the wing lay");
    const rig = buildRig(src, spec("under.png"), out);
    const body = rig.parts.find((p) => p.name === "body");
    assert.equal(body.x, 0, "the underlay fills the body under the wing");
    const [r, g, b, a] = px("body.png", 5, 30);
    assert.ok(r < 40 && g > 200 && b < 40 && a === 255);
    assert.throws(() => parseSpec(spec("../under.png")), /underlay must be a PNG file name/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
