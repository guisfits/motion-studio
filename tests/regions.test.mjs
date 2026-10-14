import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cutRegions, readRGBA, writePNG } from "../core/reference/regions.mjs";

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
  const px = (x, y) => clip.rgba[(y * clip.w + x) * 4 + 3];
  assert.equal(px(40, 50), 0, "the source's transparent half stays transparent");
  assert.equal(px(150, 50), 255, "the source's opaque half stays opaque");
});
