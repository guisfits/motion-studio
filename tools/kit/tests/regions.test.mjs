import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cutRegions, readRGBA, writePNG } from "../reference/regions.mjs";

const dir = mkdtempSync(join(tmpdir(), "regions-"));
const jpg = join(dir, "scan.jpg");
execFileSync("ffmpeg", [
  "-loglevel",
  "error",
  "-y",
  "-f",
  "lavfi",
  "-i",
  "color=c=0x8a7a60:s=400x300",
  "-frames:v",
  "1",
  jpg,
]);

test("a JPEG scan (no alpha) cut into two torn clippings", () => {
  const entry = {
    id: "scan",
    cut: "regions",
    oven: { seed: 4 },
    regions: [
      {
        id: "left",
        poly: [
          [0.05, 0.1],
          [0.45, 0.1],
          [0.45, 0.9],
          [0.05, 0.9],
        ],
      },
      {
        id: "right",
        poly: [
          [0.55, 0.1],
          [0.95, 0.1],
          [0.95, 0.9],
          [0.55, 0.9],
        ],
      },
    ],
  };
  const out = cutRegions(jpg, entry, dir);
  assert.deepEqual(
    out.map((p) => p.split("/").pop()),
    ["scan-left.png", "scan-right.png"],
  );
  const { w, h, rgba } = readRGBA(out[0]);
  assert.ok(w < 400 && h < 300, "cropped to the region (plus rim margin)");
  assert.equal(rgba[3], 0, "corner is transparent");
  const c = ((h >> 1) * w + (w >> 1)) * 4;
  assert.equal(rgba[c + 3], 255, "centre is opaque");
});

test("an empty region fails loudly with its id", () => {
  const entry = {
    id: "scan",
    cut: "regions",
    regions: [
      {
        id: "nothing",
        poly: [
          [0.2, 0.2],
          [0.2, 0.2],
          [0.2, 0.2],
        ],
      },
    ],
  };
  assert.throws(() => cutRegions(jpg, entry, dir), /scan-nothing.*empty/);
});

test("a PNG with its own transparency keeps it inside the polygon", () => {
  const w = 200,
    h = 100;
  const src = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    src.set([30, 60, 90, i % w < w / 2 ? 0 : 255], i * 4); // left half already clear
  }
  const png = join(dir, "cutout-with-alpha.png");
  writePNG(png, w, h, src);
  const whole = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  const [out] = cutRegions(
    png,
    { id: "keep", cut: "regions", regions: [{ id: "all", poly: whole }] },
    dir,
  );
  const clip = readRGBA(out);
  assert.ok(clip.w < 130, "cropped to the opaque half, not the whole polygon");
  const px = (x, y) => clip.rgba[(y * clip.w + x) * 4 + 3];
  assert.equal(px(1, 50), 0, "the source's transparent half stays transparent");
  assert.equal(px(clip.w - 20, 50), 255, "the source's opaque half stays opaque");
});

test("a huge source is capped to 1600px on the long side before baking", () => {
  const big = join(dir, "big.jpg");
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=0x6a5a40:s=3200x1600", "-frames:v", "1", big]);
  const { w, h } = readRGBA(big);
  assert.deepEqual([w, h], [1600, 800]);
  const entry = {
    id: "big",
    cut: "regions",
    regions: [{ id: "all", poly: [[0, 0], [1, 0], [1, 1], [0, 1]] }],
  };
  const [out] = cutRegions(big, entry, dir);
  const clip = readRGBA(out);
  assert.ok(clip.w <= 1600 && clip.h <= 800, `clipping is ${clip.w}x${clip.h}`);
});

test("a small region of a big scan is cut at the scan's own resolution, then fitted", () => {
  // A 4000x2000 scan; the region is its top-left 400x200 corner. Fitting the whole scan to
  // 1600 px first would leave that corner 160 px wide.
  const big = join(dir, "detail.jpg");
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=0x6a5a40:s=4000x2000", "-frames:v", "1", big]);
  const entry = {
    id: "detail",
    cut: "regions",
    regions: [{ id: "corner", poly: [[0, 0], [0.1, 0], [0.1, 0.1], [0, 0.1]] }],
  };
  const [out] = cutRegions(big, entry, dir);
  const clip = readRGBA(out);
  assert.ok(clip.w >= 400 && clip.h >= 200, `clipping is ${clip.w}x${clip.h}`);
  assert.ok(clip.w <= 400 + 30 && clip.h <= 200 + 30, `only the rim pads it: ${clip.w}x${clip.h}`);
});

test("a polygon partly off the image clamps to it; fully off fails with its id", () => {
  const part = {
    id: "scan",
    cut: "regions",
    regions: [{ id: "edge", poly: [[-0.3, -0.3], [0.4, -0.3], [0.4, 0.5], [-0.3, 0.5]] }],
  };
  const [out] = cutRegions(jpg, part, dir);
  const clip = readRGBA(out);
  assert.ok(clip.w <= 400 * 0.4 + 30 && clip.h <= 300 * 0.5 + 30, `clipping is ${clip.w}x${clip.h}`);
  assert.equal(clip.rgba[((clip.h >> 1) * clip.w + (clip.w >> 1)) * 4 + 3], 255);
  const off = {
    id: "scan",
    cut: "regions",
    regions: [{ id: "gone", poly: [[1.2, 1.2], [1.6, 1.2], [1.6, 1.6], [1.2, 1.6]] }],
  };
  assert.throws(() => cutRegions(jpg, off, dir), /scan-gone.*empty/);
});

test("EXIF orientation is honoured: no squashing, pixels match the upright image", () => {
  const raw = join(dir, "raw.jpg");
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=blue:s=400x300,drawbox=x=200:y=0:w=200:h=300:c=red:t=fill", "-frames:v", "1", raw]);
  const jpeg = readFileSync(raw);
  // APP1 "Exif" segment with one IFD0 entry: Orientation (0x0112) = 6, rotate 90 clockwise.
  const tiff = Buffer.from("4d4d002a000000080001011200030000000100060000" + "00000000", "hex");
  const exif = Buffer.concat([Buffer.from("Exif\0\0"), tiff]);
  const seg = Buffer.concat([Buffer.from([0xff, 0xe1, 0, 0]), exif]);
  seg.writeUInt16BE(exif.length + 2, 2);
  const rot = join(dir, "rot.jpg");
  writeFileSync(rot, Buffer.concat([jpeg.subarray(0, 2), seg, jpeg.subarray(2)]));
  const { w, h, rgba } = readRGBA(rot);
  assert.deepEqual([w, h], [300, 400], "dimensions are the upright ones");
  const px = (x, y) => rgba.subarray((y * w + x) * 4, (y * w + x) * 4 + 3);
  const top = px(150, 50),
    bottom = px(150, 350);
  assert.ok(top[2] > top[0], "left half (blue) lands on top after a clockwise turn");
  assert.ok(bottom[0] > bottom[2], "right half (red) lands at the bottom");
});

test("a malformed poly fails naming its region", () => {
  const bad = (poly) => ({ id: "scan", cut: "regions", regions: [{ id: "oops", poly }] });
  for (const poly of [undefined, [[0.1, 0.1], [0.5, 0.5]], [[0.1, 0.1], [0.5, "x"], [0.2, 0.9]], [[0.1, 0.1], [NaN, 0.5], [0.2, 0.9]]])
    assert.throws(() => cutRegions(jpg, bad(poly), dir), /scan-oops.*bad poly/);
});

test("duplicate region ids in one entry fail instead of overwriting each other", () => {
  const sq = [[0.1, 0.1], [0.4, 0.1], [0.4, 0.4], [0.1, 0.4]];
  const entry = { id: "scan", cut: "regions", regions: [{ id: "a", poly: sq }, { id: "a", poly: sq }] };
  assert.throws(() => cutRegions(jpg, entry, dir), /scan-a.*duplicate/);
});

test("oven paper and grain reach the bake: a red paper gives a red rim", () => {
  const poly = [
    [0.1, 0.1],
    [0.9, 0.1],
    [0.9, 0.9],
    [0.1, 0.9],
  ];
  const red = (oven, id) => {
    const out = cutRegions(jpg, { id, cut: "regions", oven, regions: [{ id: "r", poly }] }, dir);
    const { rgba } = readRGBA(out[0]);
    let n = 0;
    for (let i = 0; i < rgba.length; i += 4)
      if (rgba[i + 3] > 0 && rgba[i] > rgba[i + 1] + 80) n++;
    return n;
  };
  assert.equal(red({ seed: 2 }, "cream"), 0, "default rim is cream");
  assert.ok(red({ seed: 2, paper: [220, 40, 40], grain: 0 }, "redrim") > 0, "paper colour used");
});

test("oven paper must be [r, g, b] and grain a number: a hex string fails instead of baking a black rim", () => {
  const poly = [
    [0.1, 0.1],
    [0.9, 0.1],
    [0.9, 0.9],
    [0.1, 0.9],
  ];
  const cut = (oven) =>
    cutRegions(jpg, { id: "badoven", cut: "regions", oven, regions: [{ id: "r", poly }] }, dir);
  assert.throws(() => cut({ paper: "#cc0000" }), /badoven.*oven\.paper/);
  assert.throws(() => cut({ paper: [220, 40] }), /oven\.paper/);
  assert.throws(() => cut({ paper: [220, 40, "x"] }), /oven\.paper/);
  assert.throws(() => cut({ grain: "0.1" }), /badoven.*oven\.grain/);
  assert.doesNotThrow(() => cut({ paper: [220, 40, 40], grain: 0 }));
});
