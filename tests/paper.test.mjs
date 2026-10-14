import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { ensureAssets } from "./_assets.mjs";

const fixture = fileURLToPath(new URL("./fixture-paper", import.meta.url));
ensureAssets();

async function inPage(fn) {
  const { chromium } = await import("playwright");
  const { startServer, filmUrl } = await import("../core/server.mjs");
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1080, height: 1920 },
    });
    await page.goto(filmUrl(server, fixture, "?format=9x16&render=1"));
    await page.waitForFunction(() => window.ready === true, null, {
      timeout: 60_000,
    });
    return await page.evaluate(fn);
  } finally {
    await browser.close();
    server.close();
  }
}

test("clipping: stacking, boil, fold, crumple, determinism", async () => {
  const r = await inPage(async () => {
    const { A, B } = window.PAPER;
    const snap = (e) => ({
      t: e.style.transform,
      c: e.firstChild.style.clipPath,
      z: e.style.zIndex,
      v: e.style.visibility,
    });
    await window.seek(0.3);
    const hiddenA = A.el.style.visibility;
    await window.seek(1.5);
    const s15 = snap(A.el);
    const zA = +A.el.style.zIndex,
      zB = +B.el.style.zIndex;
    await window.seek(1.5 + 1 / 12);
    const clipNext = A.el.firstChild.style.clipPath;
    await window.seek(2.6);
    const folded = A.el.dataset.fold;
    await window.seek(4.5);
    const gone = A.el.style.visibility;
    await window.seek(1.5);
    const again = snap(A.el);
    return {
      hiddenA,
      s15,
      zA,
      zB,
      clipNext,
      folded,
      gone,
      again,
      cues: window.CUES.map((c) => c.type),
    };
  });
  assert.equal(r.hiddenA, "hidden");
  assert.ok(r.zB < r.zA, "B slid under A");
  assert.notEqual(r.clipNext, r.s15.c, "torn edge boils on the 12 fps clock");
  assert.ok(Math.abs(+r.folded - 0.5) < 0.05);
  assert.equal(r.gone, "hidden");
  assert.deepEqual(
    r.again,
    r.s15,
    "same t, same frame after seeking elsewhere",
  );
  assert.deepEqual(r.cues.sort(), [
    "crumple",
    "fold",
    "paper-place",
    "paper-slide",
  ]);
});

test("clipping: flip shows the rear, edges, halftone, invalid edge", async () => {
  const { chromium } = await import("playwright");
  const { startServer, filmUrl } = await import("../core/server.mjs");
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto(filmUrl(server, fixture, "?format=9x16&render=1"));
    await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
    const px = async (t, x, y) => {
      await page.evaluate((s) => window.seek(s), t);
      const buf = await page.screenshot({ clip: { x, y, width: 1, height: 1 } });
      return buf.toString("base64");
    };
    const state = async (t) => {
      await page.evaluate((s) => window.seek(s), t);
      return page.evaluate(() => {
        const { C, D, H } = window.PAPER;
        const [face, rear] = C.el.children;
        return {
          face: face.style.visibility,
          rear: rear.style.visibility,
          cFaceClip: face.style.clipPath,
          dFaceClip: D.el.firstChild.style.clipPath,
          hFilter: H.el.firstChild.style.filter,
        };
      });
    };
    const before = await state(0.8);
    const front = await px(0.8, 200, 300);
    const after = await state(2.5);
    const turned = await px(2.5, 200, 300);
    const empty = await px(2.5, 10, 1800);
    assert.equal(before.face, "visible");
    assert.equal(before.rear, "hidden");
    assert.equal(after.face, "hidden");
    assert.equal(after.rear, "visible");
    assert.notEqual(turned, front, "the reverse is a different picture");
    assert.notEqual(turned, empty, "the reverse renders, not blank");
    assert.equal(after.cFaceClip, "", "straight edge: no clip-path");
    assert.equal(after.dFaceClip, "", "baked edge: no clip-path");
    assert.match(after.hFilter, /url\("?#/, "halftone filter on the face");
    const threw = await page.evaluate(() => {
      try {
        window.clipping(window.STAGE, { img: window.STAGE.img.a, w: 10, x: 0, y: 0, edge: "x" });
      } catch (e) {
        return e.message;
      }
      return "";
    });
    assert.match(threw, /edge "x"/);
  } finally {
    await browser.close();
    server.close();
  }
});

// Builds extra clippings on the fixture's stage and reads back what draw(t) set on them.
async function probe(fn) {
  const { chromium } = await import("playwright");
  const { startServer, filmUrl } = await import("../core/server.mjs");
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto(filmUrl(server, fixture, "?format=9x16&render=1"));
    await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
    return await page.evaluate(fn);
  } finally {
    await browser.close();
    server.close();
  }
}

test("clipping: a piece slid under another ends below it whatever its own z", async () => {
  const r = await probe(() => {
    const S = window.STAGE;
    const target = window.clipping(S, { img: S.img.a, w: 200, x: 300, y: 300, z: 2 });
    const mover = window.clipping(S, {
      img: S.img.b, w: 200, x: 300, y: 300, z: 6,
      moves: [{ kind: "slideUnder", at: 0, from: [600, 0], under: 2 }],
    });
    target.draw(5);
    mover.draw(5);
    return { target: +target.el.style.zIndex, mover: +mover.el.style.zIndex };
  });
  assert.ok(r.mover < r.target, `mover ${r.mover} is under target ${r.target}`);
});

test("clipping: the reverse has the same torn edge and darkens with the fold", async () => {
  const r = await probe(async () => {
    const S = window.STAGE;
    const c = window.clipping(S, {
      img: S.img.a, back: S.img.b, w: 200, x: 300, y: 300, seed: 9,
      moves: [{ kind: "flip", at: 0 }, { kind: "fold", at: 0, to: 1 }],
    });
    c.draw(4);
    const [face, rear] = c.el.children;
    return { face: face.style.clipPath, rear: rear.style.clipPath, faceF: face.style.filter, rearF: rear.style.filter };
  });
  assert.ok(r.face.startsWith("polygon"));
  assert.equal(r.rear, r.face, "reverse is cut like the face");
  assert.match(r.rearF, /brightness\(0\.75\)/, "reverse darkens in the fold");
});
