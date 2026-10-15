import { test, after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import * as K from "../styles/vox/lib/kit.js";

const film = fileURLToPath(new URL("./fixture-finish", import.meta.url));

// ── The per-frame draw is a pure function of the frame index ──────────────────────────────

test("finishFrame: the same frame gives the same flicker and weave, whatever was drawn before", () => {
  const a = K.finishFrame(1.337, {});
  K.finishFrame(0.2, {});
  K.finishFrame(3.9, {});
  assert.deepEqual(K.finishFrame(1.337, {}), a);
});

test("finishFrame: it holds for a whole frame and changes on the next", () => {
  const fps = 24;
  const f = (t) => K.finishFrame(t, { fps });
  assert.deepEqual(f(10 / fps + 0.001), f(10 / fps + 0.9 / fps), "one frame, one draw");
  assert.deepEqual(f(10 / fps), f(10 / fps + 0.5 / fps), "a frame starts exactly on its boundary");
  const seen = new Set();
  for (let i = 0; i < 40; i++) seen.add(f(i / fps + 0.001).gain.toFixed(6));
  assert.ok(seen.size > 30, `flicker is new each frame, got ${seen.size} distinct gains in 40`);
  const weaves = new Set();
  for (let i = 0; i < 40; i++) {
    const { dx, dy } = f(i / fps + 0.001);
    weaves.add(`${dx.toFixed(4)},${dy.toFixed(4)}`);
  }
  assert.ok(weaves.size > 30, `weave steps each frame, got ${weaves.size} distinct offsets`);
});

test("finishFrame: flicker stays within the stops asked, weave within the pixels asked", () => {
  let maxG = 0;
  let maxD = 0;
  for (let i = 0; i < 2000; i++) {
    const { gain, dx, dy } = K.finishFrame(i / 24 + 0.001, { flicker: 0.03, weave: 1 });
    maxG = Math.max(maxG, Math.abs(Math.log2(gain)));
    maxD = Math.max(maxD, Math.abs(dx), Math.abs(dy));
  }
  assert.ok(maxG <= 0.03 + 1e-9, `|stops| <= 0.03, got ${maxG}`);
  assert.ok(maxG > 0.025, `it uses the range, got ${maxG}`);
  assert.ok(maxD <= 1 + 1e-9, `|weave| <= 1 px, got ${maxD}`);
  assert.ok(maxD > 0.9, `it uses the range, got ${maxD}`);
});

test("finishFrame: a step switched off is exactly neutral; a seed makes another film", () => {
  const off = K.finishFrame(2.2, { flicker: false, weave: false });
  assert.deepEqual(off, { gain: 1, dx: 0, dy: 0 });
  assert.deepEqual(K.finishFrame(2.2, { flicker: 0, weave: 0 }), off);
  assert.notDeepEqual(K.finishFrame(2.2, { seed: 5 }), K.finishFrame(2.2, { seed: 6 }));
});

// ── In the page ────────────────────────────────────────────────────────────────────────────

let browser;
let server;
async function open(finish, t = 0.1) {
  const { chromium } = await import("playwright");
  const { startServer, filmUrl } = await import("../core/server.mjs");
  server ??= await startServer();
  browser ??= await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const q = finish === undefined ? "" : `&finish=${encodeURIComponent(typeof finish === "string" ? finish : JSON.stringify(finish))}`;
  await page.goto(filmUrl(server, film, `?format=9x16&render=1${q}`));
  await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
  const seek = (s) => page.evaluate((s) => window.seek(s), s);
  await seek(t);
  return { page, seek };
}
after(async () => {
  await browser?.close();
  server?.close();
});

const matrix = (page) =>
  page.evaluate(() => {
    const m = new DOMMatrix(getComputedStyle(window.FIN.wrap).transform);
    return { a: m.a, d: m.d, e: m.e, f: m.f };
  });
const png = (page) => page.screenshot({ type: "png" });
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
test("the composite weaves at scale 1.02 within 1 px and the weave steps from frame to frame", { timeout: 120_000 }, async () => {
  const { page, seek } = await open({ weave: 1 });
  const seen = new Set();
  for (let i = 0; i < 30; i++) {
    await seek(i / 24 + 0.001);
    const m = await matrix(page);
    assert.ok(Math.abs(m.a - 1.02) < 1e-9 && Math.abs(m.d - 1.02) < 1e-9, `scale 1.02, got ${m.a},${m.d}`);
    assert.ok(Math.abs(m.e) <= 1 + 1e-6 && Math.abs(m.f) <= 1 + 1e-6, `translate within 1 px, got ${m.e},${m.f}`);
    seen.add(`${m.e.toFixed(3)},${m.f.toFixed(3)}`);
  }
  assert.ok(seen.size > 20, `${seen.size} distinct offsets in 30 frames`);
  await page.close();
});

test("same frame, same pixels: seeking away and back, or loading again, repaints it byte for byte", { timeout: 120_000 }, async () => {
  const a = await open({}, 0.9);
  const first = sha(await png(a.page));
  await a.seek(2.4);
  await a.seek(0.31);
  await a.seek(0.9);
  assert.equal(sha(await png(a.page)), first, "after seeking away and back");
  await a.page.close();
  const b = await open({}, 0.9);
  assert.equal(sha(await png(b.page)), first, "in a fresh page");
  await b.page.close();
});

test("different frames differ: the flicker and the weave move the picture", { timeout: 120_000 }, async () => {
  const { page, seek } = await open({}, 0.1);
  const one = sha(await png(page));
  await seek(0.1 + 3 / 24);
  assert.notEqual(sha(await png(page)), one);
  await page.close();
});

test("the table camera is untouched: the world transform is the same with and without the finish", { timeout: 120_000 }, async () => {
  const world = (page) =>
    page.evaluate(() => {
      const w = document.querySelector("#stage [style*='transform-origin: 0px 0px']");
      return { tf: w.style.transform, inFinish: window.FIN ? window.FIN.wrap.contains(w) : null };
    });
  const withF = await open({}, 0.8);
  const without = await open("none", 0.8);
  const a = await world(withF.page);
  const b = await world(without.page);
  assert.equal(a.tf, b.tf, "the camera's matrix is the film's, not the finish's");
  assert.equal(a.inFinish, true, "the finish wraps the table, it is not the table");
  await withF.page.close();
  await without.page.close();
});

test("every step off: the finish leaves the page exactly as the film built it", { timeout: 120_000 }, async () => {
  const off = { flicker: false, weave: false, fringe: false, vignette: false, scan: false, grain: false };
  const a = await open(off, 0.8);
  const b = await open("none", 0.8);
  const html = (p) => p.evaluate(() => document.querySelector("#stage").outerHTML);
  assert.equal(await html(a.page), await html(b.page));
  assert.equal(sha(await png(a.page)), sha(await png(b.page)));
  await a.page.close();
  await b.page.close();
});

test("one step alone touches only its own property", { timeout: 120_000 }, async () => {
  const only = async (opts) => {
    const { page, seek } = await open({ flicker: false, weave: false, fringe: false, vignette: false, scan: false, grain: false, ...opts });
    await seek(0.5);
    const r = await page.evaluate(() => {
      const cs = getComputedStyle(window.FIN.wrap);
      return { filter: cs.filter, transform: cs.transform, overlay: window.FIN.overlay.children.length };
    });
    await page.close();
    return r;
  };
  const flick = await only({ flicker: 0.03 });
  assert.match(flick.filter, /brightness/);
  assert.equal(flick.transform, "none");
  assert.equal(flick.overlay, 0);
  const weave = await only({ weave: 1 });
  assert.equal(weave.filter, "none");
  assert.notEqual(weave.transform, "none");
  const vig = await only({ vignette: 0.35 });
  assert.equal(vig.filter, "none");
  assert.equal(vig.transform, "none");
  assert.equal(vig.overlay, 1);
});

const rgbAt = async (page, pts) => {
  const buf = await png(page);
  const { writeFileSync } = await import("node:fs");
  const { execFileSync } = await import("node:child_process");
  const { tmpdir } = await import("node:os");
  const file = `${tmpdir()}/finish-${process.pid}-${Math.random().toString(36).slice(2)}.png`;
  writeFileSync(file, buf);
  return pts.map(([x, y]) => [
    ...execFileSync("ffmpeg", ["-loglevel", "error", "-i", file, "-vf", `crop=1:1:${x}:${y}`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]).subarray(0, 3),
  ]);
};

test("the vignette darkens the edges and leaves the middle alone", { timeout: 120_000 }, async () => {
  const none = { flicker: false, weave: false, fringe: false, scan: false, grain: false, vignette: false };
  const flat = await open(none, 0.1);
  const vig = await open({ ...none, vignette: 0.35 }, 0.1);
  const pts = [[540, 600], [540, 5], [5, 400], [3, 3]];
  const f = await rgbAt(flat.page, pts);
  const v = await rgbAt(vig.page, pts);
  assert.ok(Math.abs(v[0][0] - f[0][0]) <= 3, `middle unchanged: ${v[0]} vs ${f[0]}`);
  const ratio = (i) => v[i][0] / f[i][0];
  assert.ok(ratio(1) < 0.7 && ratio(1) > 0.6, `the top edge is multiplied by ~0.65, got ${ratio(1)}`);
  assert.ok(ratio(2) < 0.75, `the side edge is darkened too, got ${ratio(2)}`);
  assert.ok(ratio(3) < ratio(1), "corners are darker than the edges");
  await flat.page.close();
  await vig.page.close();
});

test("the fringe shifts red left and blue right at a hard edge, and it is global", { timeout: 120_000 }, async () => {
  const none = { flicker: false, weave: false, vignette: false, scan: false, grain: false };
  const { page } = await open({ ...none, fringe: 4 }, 0.1);
  // The white bar spans x 520..560 on a dark band; probe 2 px outside each side.
  const [left, right] = await rgbAt(page, [[517, 960], [563, 960]]);
  assert.ok(left[0] > left[2] + 60, `left of the bar red leads: ${left}`);
  assert.ok(right[2] > right[0] + 60, `right of the bar blue trails: ${right}`);
  await page.close();
});

test("the edges never show: blur, fringe and weave leave the frame's borders at the sheet's colour", { timeout: 120_000 }, async () => {
  const none = { flicker: false, vignette: false, grain: false };
  const { page, seek } = await open({ ...none, weave: 1, fringe: 2, scan: 2 }, 0.1);
  for (let i = 0; i < 12; i++) {
    await seek(i / 24 + 0.001);
    const pts = [[0, 0], [1079, 0], [0, 1919], [1079, 1919], [540, 0], [540, 1919], [0, 400], [1079, 400]];
    for (const c of await rgbAt(page, pts)) {
      assert.ok(c.every((v, k) => Math.abs(v - [0xd8, 0xd2, 0xc0][k]) <= 12), `a border pixel kept the sheet, got ${c}`);
    }
  }
  await page.close();
});
