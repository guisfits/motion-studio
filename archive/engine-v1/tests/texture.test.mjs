import { test, after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import * as K from "../styles/vox/lib/kit.js";
import { texture, textureFrame } from "../core/lib/texture.js";
import { clipFrame } from "../core/lib/clip.js";
import { ASSETS, ensureAssets } from "./_assets.mjs";

ensureAssets();
const film = fileURLToPath(new URL("./fixture-texture", import.meta.url));
const A = "../.assets";

// ── The wiggle and the frame pick are pure functions of t ──────────────────────────────────

test("textureFrame: the same step gives the same slide, whatever was drawn before", () => {
  const a = textureFrame(1.337, { seed: 4 });
  textureFrame(0.2, { seed: 4 });
  textureFrame(3.9, { seed: 4 });
  assert.deepEqual(textureFrame(1.337, { seed: 4 }), a);
});

test("textureFrame: it steps at 12 fps by default, holding a whole step and changing on the next", () => {
  const f = (t) => textureFrame(t, {});
  assert.deepEqual(f(5 / 12 + 0.001), f(5 / 12 + 0.99 / 12), "one step, one slide");
  assert.deepEqual(f(5 / 12), f(5 / 12 + 0.5 / 12), "a step starts exactly on its boundary");
  assert.equal(f(5 / 12).step, 5);
  const seen = new Set();
  for (let i = 0; i < 40; i++) {
    const { dx, dy } = f(i / 12 + 0.001);
    seen.add(`${dx.toFixed(4)},${dy.toFixed(4)}`);
  }
  assert.ok(seen.size > 35, `a new slide each step, got ${seen.size} distinct in 40`);
  const steps = new Set();
  for (let i = 0; i < 24; i++) steps.add(textureFrame(i / 24 + 0.001, {}).step);
  assert.equal(steps.size, 12, "24 samples in a second cover 12 steps");
});

test("textureFrame: the slide stays within +-wiggle px, uses the range, off is exactly still, seeds differ", () => {
  let max = 0;
  for (let i = 0; i < 2000; i++) {
    const { dx, dy } = textureFrame(i / 12 + 0.001, { wiggle: 3 });
    max = Math.max(max, Math.abs(dx), Math.abs(dy));
  }
  assert.ok(max <= 3 && max > 2.8, `within 3 px and using it, got ${max}`);
  assert.deepEqual(textureFrame(2.2, { wiggle: false }), { step: 26, dx: 0, dy: 0 });
  assert.deepEqual(textureFrame(2.2, { wiggle: 0 }), { step: 26, dx: 0, dy: 0 });
  assert.notDeepEqual(textureFrame(2.2, { seed: 5 }), textureFrame(2.2, { seed: 6 }));
  assert.throws(() => textureFrame(0, { wiggle: -1 }), /wiggle/);
  assert.throws(() => textureFrame(0, { fps: 0 }), /fps/);
});

test("clipFrame: frame-exact at the boundary, clamps or loops", () => {
  const m = { fps: 12, count: 12 };
  assert.equal(clipFrame(m, 3 / 12), 3);
  assert.equal(clipFrame(m, 3 / 12 - 0.001), 2);
  assert.equal(clipFrame(m, 5), 11);
  assert.equal(clipFrame(m, -1), 0);
  assert.equal(clipFrame(m, 1, true), 0, "a second in, it is the first frame again");
  assert.equal(clipFrame(m, -1 / 12, true), 11);
});

test("texture: refuses what it cannot honour, before touching the stage", () => {
  const bad = (o, re) => assert.throws(() => texture({}, { src: "x.png", ...o }), re);
  assert.throws(() => texture({}, {}), /src/);
  bad({ blend: "hue" }, /blend/);
  bad({ kind: "gif" }, /kind/);
  bad({ strength: -1 }, /strength/);
  bad({ scale: 0 }, /scale/);
  bad({ scale: 0.5 }, /covers the box/);
  bad({ wiggle: -2 }, /wiggle/);
  bad({ ppcm: 0 }, /ppcm/);
  assert.equal(K.texture, texture, "the vox kit re-exports it");
});

// ── In the page ────────────────────────────────────────────────────────────────────────────

let browser;
let server;
async function open(tex, { t = 0.1, ...q } = {}) {
  const { chromium } = await import("playwright");
  const { startServer, filmUrl } = await import("../core/server.mjs");
  server ??= await startServer();
  browser ??= await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const query = new URLSearchParams({ format: "9x16", render: "1", tex: JSON.stringify(tex), ...q });
  await page.goto(filmUrl(server, film, `?${query}`));
  await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
  const seek = (s) => page.evaluate((s) => window.seek(s), s);
  await seek(t);
  return { page, seek };
}
after(async () => {
  await browser?.close();
  server?.close();
});

const sha = (buf) => createHash("sha256").update(buf).digest("hex");
// The grey (red channel) at each point of the page as it is painted now.
async function grey(page, pts) {
  const file = `${tmpdir()}/texture-${process.pid}-${Math.random().toString(36).slice(2)}.png`;
  writeFileSync(file, await page.screenshot({ type: "png" }));
  return pts.map(([x, y]) =>
    execFileSync("ffmpeg", ["-loglevel", "error", "-i", file, "-vf", `crop=1:1:${x}:${y},format=rgb24`, "-f", "rawvideo", "-"])[0],
  );
}
const info = (page) =>
  page.evaluate(() => window.TEX.map((l) => ({ ...l.info, mix: l.el.style.mixBlendMode, opacity: getComputedStyle(l.el).opacity })));
const still = { wiggle: false };

test("blend auto: a light background gets multiply, a dark one screen, from the measured luma", { timeout: 120_000 }, async () => {
  const { page } = await open([
    { src: `${A}/tex-specks-light.png`, tile: true, ...still },
    { src: `${A}/tex-specks-dark.png`, tile: true, ...still },
    { src: `${A}/tex-specks-dark.png`, tile: true, blend: "multiply", ...still },
  ]);
  const [light, dark, forced] = await info(page);
  assert.equal(light.blend, "multiply");
  assert.equal(light.mix, "multiply");
  assert.ok(Math.abs(light.luma - 238 / 255) < 0.02, `luma of the light stand-in, got ${light.luma}`);
  assert.equal(dark.blend, "screen");
  assert.equal(dark.mix, "screen");
  assert.ok(Math.abs(dark.luma - 10 / 255) < 0.02, `luma of the dark stand-in, got ${dark.luma}`);
  assert.equal(forced.blend, "multiply", "an explicit blend is never overridden");
  await page.close();
});

test("tile: the picture repeats at its size times scale in both axes, never stretched", { timeout: 120_000 }, async () => {
  const marker = (o) => open([{ src: `${A}/tex-marker.png`, tile: true, blend: "multiply", ...still, ...o }]);
  // An 80x40 tile with one dark 20x20 square in its corner, over a white frame.
  const at2 = await marker({ scale: 2 });
  assert.deepEqual((await info(at2.page))[0].tile, { w: 160, h: 80 });
  const [a, b, c, d, e] = await grey(at2.page, [[10, 10], [37, 10], [43, 10], [157, 10], [163, 10]]);
  assert.ok(a < 60 && b < 60, `the square is 40 px wide at scale 2: ${a} ${b}`);
  assert.ok(c > 240 && d > 240, `then white up to the period: ${c} ${d}`);
  assert.ok(e < 60, `and the next tile starts at x=160 (the edge is softened by the upscale, so probe off it): ${e}`);
  const col = await grey(at2.page, [[10, 10], [10, 37], [10, 43], [10, 77], [10, 83]]);
  assert.ok(col[0] < 60 && col[1] < 60 && col[2] > 240 && col[3] > 240 && col[4] < 60, `period 80 down: ${col}`);
  await at2.page.close();
  const at1 = await marker({});
  const row1 = await grey(at1.page, [[10, 10], [18, 10], [22, 10], [77, 10], [83, 10]]);
  assert.ok(row1[0] < 60 && row1[1] < 60 && row1[2] > 240 && row1[3] > 240 && row1[4] < 60, `native size, period 80: ${row1}`);
  await at1.page.close();
});

test("physical scale: ppcm against the film's pixels per centimetre sizes the tile", { timeout: 120_000 }, async () => {
  const one = (pxpcm, o) => open([{ src: `${A}/tex-marker.png`, tile: true, blend: "multiply", ...still, ...o }], pxpcm ? { pxpcm } : {});
  // A 20 px/cm scan on a 40 px/cm film is drawn at twice its pixels; the default film is 40 px/cm.
  const a = await one(null, { ppcm: 20 });
  assert.deepEqual((await info(a.page))[0].tile, { w: 160, h: 80 });
  await a.page.close();
  const b = await one(60, { ppcm: 20 });
  assert.deepEqual((await info(b.page))[0].tile, { w: 240, h: 120 });
  await b.page.close();
  const c = await one(60, { ppcm: 20, scale: 0.5 });
  assert.deepEqual((await info(c.page))[0].tile, { w: 120, h: 60 }, "scale multiplies on top");
  await c.page.close();
});

test("untiled it covers the frame at the picture's aspect ratio, uniformly scaled", { timeout: 120_000 }, async () => {
  const { page } = await open([{ src: `${A}/tex-specks-light.png`, ...still }]);
  const [l] = await info(page);
  assert.equal(l.tile.w, l.tile.h, "a square picture stays square");
  assert.ok(Math.abs(l.tile.h - 1920) < 1e-6, `covers the long side, got ${l.tile.h}`);
  await page.close();
});

test("strength is a curve on the texture, never the layer's opacity", { timeout: 120_000 }, async () => {
  const at = async (strength) => {
    const { page } = await open([{ src: `${A}/tex-marker.png`, tile: true, blend: "multiply", strength, ...still }]);
    const [v] = await grey(page, [[10, 10]]);
    const [l] = await info(page);
    await page.close();
    return { v, opacity: l.opacity };
  };
  const [s1, s5, s0, s2] = [await at(1), await at(0.5), await at(0), await at(2)];
  assert.ok(Math.abs(s1.v - 32) <= 3, `strength 1 is the texture: ${s1.v}`);
  assert.ok(Math.abs(s5.v - (255 - 0.5 * 223)) <= 4, `strength 0.5 lifts the darks halfway to white: ${s5.v}`);
  assert.ok(s0.v >= 252, `strength 0 is neutral: ${s0.v}`);
  assert.ok(s2.v <= 4, `strength 2 pushes the dark past black and clips: ${s2.v}`);
  for (const s of [s1, s5, s0, s2]) assert.equal(s.opacity, "1");
});

test("overlay normalises first: the background of a light texture lands on 50 % grey", { timeout: 120_000 }, async () => {
  const run = async (o) => {
    // Overlay over a 50 % grey frame returns the (normalised) texture itself.
    const { page } = await open([{ src: `${A}/tex-specks-light.png`, tile: true, blend: "overlay", ...still, ...o }], { bg: "#808080" });
    const [v] = await grey(page, [[1, 0]]); // a pixel of the texture's background
    const [l] = await info(page);
    await page.close();
    return { v, l };
  };
  const norm = await run({});
  assert.equal(norm.l.normalize, true, "overlay normalises by default");
  assert.ok(Math.abs(norm.v - 128) <= 6, `peak at 50 %: ${norm.v}`);
  const raw = await run({ normalize: false });
  assert.equal(raw.l.normalize, false);
  assert.ok(raw.v > 225, `un-normalised it stays near the texture's own 93 %: ${raw.v}`);
});

test("the ground breathes: the slide steps at 12 fps within +-wiggle px and the edge never shows", { timeout: 120_000 }, async () => {
  const { page, seek } = await open([{ src: `${A}/tex-paper.png`, wiggle: 3, seed: 2 }]);
  const read = () =>
    page.evaluate(() => {
      const el = window.TEX[0].el;
      const inner = el.firstElementChild;
      const m = new DOMMatrix(getComputedStyle(inner).transform);
      const [w, i] = [el.getBoundingClientRect(), inner.getBoundingClientRect()];
      return { e: m.e, f: m.f, covers: i.left <= w.left + 1e-6 && i.top <= w.top + 1e-6 && i.right >= w.right - 1e-6 && i.bottom >= w.bottom - 1e-6 };
    });
  const seen = new Set();
  for (let i = 0; i < 30; i++) {
    await seek(i / 12 + 0.001);
    const a = await read();
    await seek(i / 12 + 0.08);
    const b = await read();
    assert.deepEqual(a, b, "held for the whole step");
    assert.ok(Math.abs(a.e) <= 3 && Math.abs(a.f) <= 3, `within 3 px: ${a.e},${a.f}`);
    assert.ok(a.covers, "the oversized layer still covers its box");
    seen.add(`${a.e.toFixed(3)},${a.f.toFixed(3)}`);
  }
  assert.ok(seen.size > 25, `${seen.size} distinct slides in 30 steps`);
  await page.close();
});

test("a film-scratch sequence plays frame-exactly, in any seek order, and loops", { timeout: 120_000 }, async () => {
  const dust = { src: `${A}/tex-dust`, kind: "video", ...still };
  const { page, seek } = await open([dust], { bg: "#000000" });
  const [l] = await info(page);
  assert.equal(l.blend, "screen", "dust on black screens");
  const level = async (t) => {
    await seek(t);
    return (await grey(page, [[540, 960]]))[0];
  };
  // Frame N is a flat grey of 10 + 20 N.
  for (const [t, n] of [[0.25, 3], [0, 0], [11 / 12 + 0.01, 11], [1.0, 0], [0.25 - 0.001, 2], [0.5, 6], [0.25, 3]])
    assert.ok(Math.abs((await level(t)) - (10 + 20 * n)) <= 4, `t=${t} shows frame ${n}`);
  await page.close();
  const hold = await open([{ ...dust, loop: false }], { bg: "#000000" });
  await hold.seek(1.5);
  assert.ok(Math.abs((await grey(hold.page, [[540, 960]]))[0] - 230) <= 4, "loop:false holds the last frame");
  await hold.page.close();
});

test("a sequence frame that cannot be decoded fails the seek, naming the frame", { timeout: 120_000 }, async () => {
  const gap = `${ASSETS}tex-gap`;
  rmSync(gap, { recursive: true, force: true });
  cpSync(`${ASSETS}tex-dust`, gap, { recursive: true });
  rmSync(`${gap}/00005.jpg`);
  const { page, seek } = await open([{ src: `${A}/tex-gap`, kind: "video", ...still }]);
  await seek(0.25); // frame 3 is there
  await assert.rejects(seek(4 / 12 + 0.01), /frame 4\b.*decode/);
  await page.close();
  rmSync(gap, { recursive: true, force: true });
});

test("the same frame is the same pixels: seeking away and back, or a fresh page, repaints it byte for byte", { timeout: 120_000 }, async () => {
  const tex = [
    { src: `${A}/tex-paper.png`, wiggle: 2, seed: 3 },
    { src: `${A}/tex-dust`, kind: "video", wiggle: 1, seed: 8 },
  ];
  const a = await open(tex, { t: 0.4, demo: 1 });
  const first = sha(await a.page.screenshot({ type: "png" }));
  await a.seek(2.6);
  await a.seek(0.1);
  await a.seek(0.4);
  assert.equal(sha(await a.page.screenshot({ type: "png" })), first, "after seeking away and back");
  await a.seek(0.4 + 3 / 12);
  assert.notEqual(sha(await a.page.screenshot({ type: "png" })), first, "other frames differ");
  await a.page.close();
  const b = await open(tex, { t: 0.4, demo: 1 });
  assert.equal(sha(await b.page.screenshot({ type: "png" })), first, "in a fresh page");
  await b.page.close();
});

test("a target element: the layer lies on that sheet, clipped to its box", { timeout: 120_000 }, async () => {
  // A white sheet (its own stacking context) on a 75 % grey frame; a 4000x2000 tile whose dark
  // square covers the sheet. Only the sheet may darken.
  const { page } = await open([{ src: `${A}/tex-marker.png`, tile: true, scale: 50, blend: "multiply", target: "sheet", ...still }], { sheet: 1, bg: "#c0c0c0" });
  assert.equal(await page.evaluate(() => window.TEX[0].el.parentElement === document.querySelector("#stage [style*='rotate']")), true);
  const [inside, outside, outside2] = await grey(page, [[400, 550], [50, 50], [900, 1500]]);
  assert.ok(inside < 60, `on the sheet: ${inside}`);
  assert.ok(Math.abs(outside - 192) <= 2 && Math.abs(outside2 - 192) <= 2, `off the sheet it is untouched: ${outside} ${outside2}`);
  await page.close();
});

test("a box target is placed and clipped on the stage", { timeout: 120_000 }, async () => {
  const { page } = await open([{ src: `${A}/tex-marker.png`, tile: true, scale: 50, blend: "multiply", target: { x: 100, y: 200, w: 300, h: 400 }, ...still }], { bg: "#c0c0c0" });
  const [inside, left, below] = await grey(page, [[250, 400], [90, 400], [250, 610]]);
  assert.ok(inside < 60, `inside the box: ${inside}`);
  assert.ok(Math.abs(left - 192) <= 2 && Math.abs(below - 192) <= 2, `outside it: ${left} ${below}`);
  await page.close();
});

test("layer order: a layer built before finish is inside its wrapper, above the table, below its overlay", { timeout: 120_000 }, async () => {
  const { page } = await open([{ src: `${A}/tex-paper.png` }], { demo: 1, finish: 1 });
  const order = await page.evaluate(() => {
    const [layer, wrap, overlay] = [window.TEX[0].el, window.FIN.wrap, window.FIN.overlay];
    const dom = layer.parentElement; // stage.dom: the table's view first, then the layer
    return {
      inWrap: wrap.contains(layer),
      notInOverlay: !overlay.contains(layer),
      afterTable: dom.firstElementChild !== layer && !!(dom.firstElementChild.compareDocumentPosition(layer) & Node.DOCUMENT_POSITION_FOLLOWING),
      grainInOverlay: overlay.querySelector("svg") != null,
    };
  });
  assert.deepEqual(order, { inWrap: true, notInOverlay: true, afterTable: true, grainInOverlay: true });
  await page.close();
});
