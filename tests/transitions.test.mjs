import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ensureAssets } from "./_assets.mjs";

const studio = fileURLToPath(new URL("..", import.meta.url));
const film = fileURLToPath(new URL("./fixture-transitions", import.meta.url));
ensureAssets();

async function inPage(fn, query = "") {
  const { chromium } = await import("playwright");
  const { startServer, filmUrl } = await import("../core/server.mjs");
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto(filmUrl(server, film, `?format=9x16&render=1${query}`));
    await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
    return await page.evaluate(fn);
  } finally {
    await browser.close();
    server.close();
  }
}

// Everything the tests read, from one page load. `styles(t)` seeks t and reads the moving parts'
// styles, so a second visit to the same t (after others, out of order) must read the same.
let R;
const facts = async () =>
  (R ??= await inPage(async () => {
    const { tr, pt, ink, zt, tape, shots, E } = window.TR;
    const styles = async (t) => {
      await window.seek(t);
      const s = (el) => `${el.style.clipPath}|${el.style.transform}|${el.style.display}|${el.style.filter}`;
      return [shots.A.view, shots.B.view, shots.C.view, shots.D.view, shots.E.view, tape.el].map(s).join("\n");
    };
    const ts = [0.8, 2.4, 3.8, 5.5, 6.9, 7.95];
    const first = [];
    for (const t of ts) first.push(await styles(t));
    const again = [];
    for (const t of [...ts].reverse()) again.unshift(await styles(t));
    const at = async (t, read) => (await window.seek(t), read());
    const disp = (el) => el.style.display;
    return {
      first, again,
      cues: window.CUES,
      tear: {
        tIn: 0.6, contact: tr.contact, done: tr.done, cues: tr.cues(),
        p: [0.59, 0.6, 0.6 + 1 / 12 - 1e-3, 0.6 + 1 / 12 + 1e-3, tr.done - 1e-3, tr.done].map(tr.progress),
        steps: Array.from({ length: 8 }, (_, i) => tr.progress(0.6 + (i + 1) / 12 + 1e-4) - tr.progress(0.6 + i / 12 + 1e-4)),
        hold: [tr.progress(0.7), tr.progress(0.7 + 1 / 30)],
        before: await at(0.5, () => shots.A.view.style.clipPath),
        mid: await at(0.85, () => shots.A.view.style.clipPath),
        after: await at(tr.done + 0.01, () => disp(shots.A.view)),
      },
      page: {
        tIn: 2.0, done: pt.done, cues: pt.cues(),
        a: [1.99, 2.0, pt.done - 1e-3, pt.done].map(pt.angle),
        hold: [pt.angle(2.26), pt.angle(2.26 + 1 / 10)],
        steps: new Set(Array.from({ length: 90 }, (_, i) => pt.angle(2.0 + i / 100))).size,
        mid: await at(2.4, () => shots.B.view.style.transform),
        after: await at(pt.done + 0.01, () => [disp(shots.B.view), shots.B.view.style.transform]),
      },
      ink: {
        tIn: 3.6, done: ink.done, cues: ink.cues(),
        before: await at(3.55, () => shots.D.view.style.clipPath),
        mid: await at(3.75, () => [shots.D.view.style.clipPath, disp(shots.C.view)]),
        after: await at(ink.done + 0.01, () => [shots.D.view.style.clipPath, disp(shots.C.view)]),
      },
      zoom: {
        tIn: 5.2, cut: zt.cut, done: zt.done, cues: zt.cues(),
        p: [5.19, zt.done].map(zt.progress),
        s: [zt.scale(5.2), zt.scale(zt.done)],
        before: await at(zt.cut - 1e-3, () => [disp(shots.D.view), disp(shots.E.view)]),
        onCut: await at(zt.cut, () => [disp(shots.D.view), disp(shots.E.view), shots.E.view.style.overflow]),
        end: await at(zt.done - 1e-3, () => new DOMMatrix(shots.E.view.style.transform).toString()),
        after: await at(zt.done, () => [shots.E.view.style.transform, shots.E.view.style.overflow, disp(shots.D.view)]),
      },
      tape: {
        tIn: 6.8, pressed: tape.pressed, cues: tape.cues(),
        laid: [6.79, 6.8, tape.pressed - 1e-3, tape.pressed].map(tape.laid),
        lifted: await at(tape.pressed - 0.01, () => tape.el.style.filter),
        down: await at(tape.pressed + 0.5, () => tape.el.style.filter),
      },
      cut: {
        a: E.at(7.9 - 1e-3), b: E.at(7.9),
        blur: [E.blurAt(7.9), E.blurAt(7.9 + 1 / 120)],
        cues: E.cues().filter((c) => Math.abs(c.t - 7.9) < 1.5 && /whoosh|swish/.test(c.type)),
      },
    };
  }));

test("transitions are pure functions of t: the same styles at the same t in any order", { timeout: 120_000 }, async () => {
  const { first, again } = await facts();
  assert.deepEqual(again, first);
});

test("tearReveal: uneven 12 fps rip from 0 to 1, heard at its first step, the shot gone after", { timeout: 120_000 }, async () => {
  const { tear } = await facts();
  const [pre, at0, step0, step1, last, end] = tear.p;
  assert.equal(pre, 0);
  assert.equal(at0, 0);
  assert.equal(step0, 0, "nothing moves before the first 1/12 s step");
  assert.ok(step1 > 0 && last < 1 && end === 1, JSON.stringify(tear.p));
  assert.equal(tear.hold[0], tear.hold[1], "holds within a 12 fps step");
  const sizes = tear.steps.map((s) => s.toFixed(4));
  assert.ok(new Set(sizes).size >= 4, `uneven steps (${sizes})`);
  assert.deepEqual(tear.cues, [{ t: tear.contact, type: "tear", gain: 1 }]);
  assert.ok(Math.abs(tear.contact - (tear.tIn + 1 / 12)) < 1e-9);
  assert.equal(tear.before, "", "untouched before the rip");
  assert.match(tear.mid, /^polygon\(/);
  assert.equal(tear.after, "none");
});

test("pageTurn: 0° → 180° on an 8 fps clock, heard as it lifts, the shot gone after", { timeout: 120_000 }, async () => {
  const { page } = await facts();
  assert.deepEqual(page.a.map((a) => Math.round(a)), [0, 0, Math.round(page.a[2]), 180]);
  assert.ok(page.a[2] > 150 && page.a[2] < 180);
  assert.equal(page.hold[0], page.hold[1], "holds within an 8 fps step");
  assert.ok(page.steps <= Math.ceil(0.9 * 8) + 1, `${page.steps} poses in 0.9 s`);
  assert.deepEqual(page.cues, [{ t: page.tIn, type: "page", gain: 0.9 }]);
  assert.match(page.mid, /rotateY\(-\d/);
  assert.deepEqual(page.after, ["none", ""]);
});

test("inkBlot cover + reveal: the drop's contact heard, the next shot grows inside the ink until it fills the frame", { timeout: 120_000 }, async () => {
  const { ink } = await facts();
  assert.deepEqual(ink.cues.map((c) => c.type), ["drip", "splash"]);
  assert.equal(ink.cues[0].t, ink.tIn);
  assert.ok(ink.done > ink.tIn && ink.done < ink.tIn + 2, `covered at ${ink.done}`);
  assert.equal(ink.before, "polygon(0px 0px, 0px 0px, 0px 0px)", "nothing of the next shot before the drop lands");
  assert.match(ink.mid[0], /^polygon\((?:[-\d.]+px [-\d.]+px,?\s*){96}\)$/);
  assert.equal(ink.mid[1], "", "the outgoing shot stays while ink spreads");
  assert.deepEqual(ink.after, ["", "none"], "full frame: no clip, the outgoing shot off");
});

test("inkBlot matte: real ink footage multiplied on the contact, frame-synced, gone once covered", { timeout: 120_000 }, async () => {
  const m = await inPage(async () => {
    const { ink } = window.TR;
    const el = [...document.querySelectorAll("img")].find((i) => i.style.mixBlendMode === "multiply");
    const read = async (t) => (await window.seek(t), [el.style.visibility, el.src.split("/").pop()]);
    return { before: await read(3.5), on: await read(3.6 + 0.3), after: await read(ink.done + 0.01) };
  }, "&matte=1");
  assert.equal(m.before[0], "hidden");
  assert.deepEqual(m.on, ["visible", "00004.jpg"], "0.3 s after the contact = frame 4 of 12 fps");
  assert.equal(m.after[0], "hidden");
});

test("zoomThrough: one eased scale move cut at its peak, the next shot lands upright at scale 1", { timeout: 120_000 }, async () => {
  const { zoom } = await facts();
  assert.deepEqual(zoom.p, [0, 1]);
  assert.ok(Math.abs(zoom.s[0] - 1) < 1e-9 && Math.abs(zoom.s[1] - 14) < 1e-9);
  // Symmetric ease: the peak is the middle of the move.
  assert.ok(Math.abs(zoom.cut - (zoom.tIn + 0.55)) < 1 / 240 + 1e-9, `cut at ${zoom.cut}`);
  assert.deepEqual(zoom.cues, [{ t: zoom.cut, type: "whoosh", gain: 0.7 }]);
  assert.deepEqual(zoom.before, ["", "none"]);
  assert.deepEqual(zoom.onCut, ["none", "", "visible"], "hard cut; the next table shows around its window");
  const m = zoom.end.match(/matrix\(([^)]+)\)/)[1].split(",").map(Number);
  assert.ok(Math.abs(m[0] - 1) < 2e-3 && Math.abs(m[4]) < 2 && Math.abs(m[5]) < 2, zoom.end);
  assert.deepEqual(zoom.after, ["", "hidden", "none"], "upright, its window clipping again");
});

test("tapeOn: laid from 0 to 1 on the 12 fps clock, heard on the press, then holds flat", { timeout: 120_000 }, async () => {
  const { tape } = await facts();
  assert.deepEqual(tape.laid.map((v) => +v.toFixed(6)), [0, 0, +tape.laid[2].toFixed(6), 1]);
  assert.ok(tape.laid[2] > 0.5 && tape.laid[2] < 1);
  assert.ok(Math.abs(tape.pressed - (tape.tIn + 4 / 12)) < 1e-9, `pressed at ${tape.pressed}`);
  assert.deepEqual(tape.cues, [{ t: tape.pressed, type: "tape", gain: 0.9 }]);
  assert.match(tape.lifted, /9px 8px/, "hovering before the press");
  assert.match(tape.down, /1px 1\.2px/, "flat after it");
});

test("table hard cut: an instant jump between stations, never smeared, never whooshed", { timeout: 120_000 }, async () => {
  const { cut } = await facts();
  assert.ok(Math.hypot(cut.b.x - cut.a.x, cut.b.y - cut.a.y) > 2000, "jumps in one frame");
  for (const b of cut.blur) assert.ok(b.sx === 0 && b.sy === 0, `no smear (${JSON.stringify(b)})`);
  assert.deepEqual(cut.cues, []);
});

test("transition stills render: the tear splits two grounds, the ink-filled frame is the next shot", { timeout: 180_000 }, () => {
  rmSync(`${film}/out`, { recursive: true, force: true });
  execFileSync("node", [`${studio}/core/render.mjs`, film, "--stills", "0.85,4.6"], { stdio: "pipe" });
  const px = (png, x, y) => [
    ...execFileSync("ffmpeg", ["-loglevel", "error", "-i", png, "-vf", `crop=1:1:${x}:${y}`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]).subarray(0, 3),
  ];
  const near = (got, want, tol = 14) => got.every((c, i) => Math.abs(c - want[i]) <= tol);
  const tear = `${film}/out/stills-9x16/000-0.85s.png`;
  // Ground of A (#b8473a) above the front, of B (#c9a227) below it, at the frame's left margin.
  assert.ok(near(px(tear, 30, 150), [0xb8, 0x47, 0x3a]), `top ${px(tear, 30, 150)}`);
  assert.ok(near(px(tear, 30, 1850), [0xc9, 0xa2, 0x27]), `bottom ${px(tear, 30, 1850)}`);
  const ink = `${film}/out/stills-9x16/001-4.60s.png`;
  assert.ok(near(px(ink, 30, 150), [0x3a, 0x2a, 0x20]), `D's ground fills the frame ${px(ink, 30, 150)}`);
});
