import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  checkCapHeight,
  checkContrast,
  contrastRatio,
  luminance,
} from "../core/checks/legibility.mjs";
import { sampleBox } from "../core/checks/media.mjs";

const W = 540,
  H = 960;
const codes = (f) => [...new Set(f.map((x) => x.code))].sort();
const caption = (o = {}) => ({
  id: "cap-1",
  role: "caption",
  text: "o monge",
  box: [100, 700, 300, 40],
  alpha: 1,
  cap: 0.03 * H,
  color: "#111111",
  ...o,
});
// 1 s at 30 fps with the given caption on every frame.
const trace = (cap) => ({
  W,
  H,
  fps: 30,
  frames: Array.from({ length: 30 }, (_, i) => ({ t: i / 30, items: [cap], camera: null })),
});
// A sampler returning an rgb24 buffer of `n` pixels: `share` of them text-coloured, the rest bg.
const sampler = (bg, text = [17, 17, 17], share = 0.25) => () => {
  const n = 400;
  const px = Array.from({ length: n }, (_, i) => (i < n * share ? text : bg));
  return Buffer.from(px.flat());
};

test("WCAG luminance and contrast: black on white is 21, equal colours 1", () => {
  assert.equal(luminance([255, 255, 255]), 1);
  assert.equal(luminance([0, 0, 0]), 0);
  assert.equal(Math.round(contrastRatio(1, 0) * 10) / 10, 21);
  assert.equal(contrastRatio(0.5, 0.5), 1);
});

test("T10: a caption cap height inside 2.5–4.5 % of the frame passes", () => {
  assert.deepEqual(checkCapHeight(trace(caption())), []);
});

test("T10: a caption too small is red, too big is orange, none registered is red", () => {
  const small = checkCapHeight(trace(caption({ cap: 0.02 * H })));
  assert.deepEqual(codes(small), ["T10"]);
  assert.equal(small[0].severity, "red");
  const big = checkCapHeight(trace(caption({ cap: 0.05 * H })));
  assert.equal(big[0].severity, "orange");
  const none = checkCapHeight(trace(caption({ cap: undefined })));
  assert.equal(none[0].severity, "red");
  assert.match(none[0].msg, /cap/);
  // A caption only fading (never legible) is T2's; T10 judges the legible frames.
  assert.deepEqual(checkCapHeight(trace(caption({ cap: 0.01 * H, alpha: 0.5 }))), []);
});

test("T11: dark text on a light plate passes; on a dark picture it is red", () => {
  assert.deepEqual(checkContrast(trace(caption()), sampler([240, 236, 226])), []);
  const dark = checkContrast(trace(caption()), sampler([60, 50, 40]));
  assert.deepEqual(codes(dark), ["T11"]);
  assert.equal(dark[0].severity, "red");
  assert.match(dark[0].msg, /cap-1/);
});

test("T11: the background is the median of the box, so the glyphs do not count", () => {
  // 40 % of the box is white glyphs on a black plate: the plate decides.
  const f = checkContrast(trace(caption({ color: "#ffffff" })), sampler([0, 0, 0], [255, 255, 255], 0.4));
  assert.deepEqual(f, []);
});

test("T11: a caption without a parseable text colour is red", () => {
  for (const color of [undefined, "ink", "#12"]) {
    const f = checkContrast(trace(caption({ color })), sampler([255, 255, 255]));
    assert.deepEqual(codes(f), ["T11"], String(color));
    assert.match(f[0].msg, /colour/);
  }
  // #rgb and rgb() are colours.
  for (const color of ["#111", "rgb(17, 17, 17)"])
    assert.deepEqual(checkContrast(trace(caption({ color })), sampler([255, 255, 255])), [], color);
});

test("sampleBox reads the pixels of a trace box from the rendered video", { timeout: 60_000 }, () => {
  const dir = fileURLToPath(new URL("./.tmp-films/legibility", import.meta.url));
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const mp4 = `${dir}/draft.mp4`;
  // A 108x192 video (the 540x960 frame at 1/5): white, its right half black.
  const r = spawnSync("ffmpeg", [
    "-loglevel", "error", "-f", "lavfi", "-i", "color=c=white:s=108x192:d=1:r=30",
    "-vf", "drawbox=x=54:y=0:w=54:h=192:color=black:t=fill", "-pix_fmt", "yuv420p", mp4,
  ]);
  assert.equal(r.status, 0, String(r.stderr));
  const sample = sampleBox(mp4, W, H);
  const mean = (b) => b.reduce((a, v) => a + v, 0) / b.length;
  assert.ok(mean(sample(0.5, [20, 100, 200, 300])) > 230);
  assert.ok(mean(sample(0.5, [300, 100, 200, 300])) < 25);
  // A box partly off the frame is clamped to it.
  assert.ok(mean(sample(0.5, [400, -50, 300, 200])) < 25);
  rmSync(dir, { recursive: true, force: true });
});
