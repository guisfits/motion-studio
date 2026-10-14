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

test("clipping: the shadow falls the same way on screen however the piece is turned", async () => {
  const r = await probe(() => {
    const S = window.STAGE;
    const off = (rot) => {
      const c = window.clipping(S, { img: S.img.a, w: 200, x: 300, y: 300, rot, moves: [] });
      c.draw(1);
      const m = /drop-shadow\(rgba\([^)]*\) (-?[\d.]+)px (-?[\d.]+)px/.exec(c.el.style.filter);
      const a = (rot * Math.PI) / 180;
      const [lx, ly] = [+m[1], +m[2]];
      return [lx * Math.cos(a) - ly * Math.sin(a), lx * Math.sin(a) + ly * Math.cos(a)];
    };
    return { up: off(0), turned: off(90) };
  });
  assert.ok(Math.abs(r.up[0] - r.turned[0]) < 0.01 && Math.abs(r.up[1] - r.turned[1]) < 0.01, JSON.stringify(r));
});

test("clipping: a flip with no back shows blank paper, cut and shaded like the face", async () => {
  const r = await probe(() => {
    const S = window.STAGE;
    const c = window.clipping(S, {
      img: S.img.a, w: 200, x: 300, y: 300, seed: 9,
      moves: [{ kind: "flip", at: 0 }, { kind: "fold", at: 0, to: 1 }],
    });
    c.draw(4);
    const [face, rear] = c.el.children;
    return {
      face: face.style.visibility,
      rearVis: rear.style.visibility,
      rearTag: rear.tagName,
      rearBg: rear.style.backgroundColor,
      rearClip: rear.style.clipPath === face.style.clipPath && face.style.clipPath.startsWith("polygon"),
      rearFilter: rear.style.filter,
    };
  });
  assert.equal(r.face, "hidden");
  assert.equal(r.rearVis, "visible");
  assert.equal(r.rearTag, "DIV", "blank paper, not the mirrored face");
  assert.equal(r.rearBg, "rgb(239, 231, 214)");
  assert.ok(r.rearClip, "same torn edge as the face");
  assert.match(r.rearFilter, /brightness\(0\.75\)/);
});

test("clipping: once its exit move is over, nothing of the piece stays on screen, and seeking back shows it again", async () => {
  const r = await probe(() => {
    const S = window.STAGE;
    const shown = (el) => el.checkVisibility({ visibilityProperty: true });
    const everyNode = (c) => [c.el, ...c.el.querySelectorAll("*")];
    const out = {};
    for (const kind of ["peel", "crumple", "lift"]) {
      const c = window.clipping(S, {
        img: S.img.a, back: S.img.b, w: 200, x: 300, y: 300,
        moves: [{ kind: "slap", at: 0 }, { kind, at: 1 }],
      });
      // A part a film adds on the piece (typed text) keeps its own explicit visibility.
      const part = document.createElement("div");
      part.style.cssText = "position:absolute;width:20px;height:20px;visibility:visible";
      c.el.append(part);
      c.draw(0.8);
      c.draw(6);
      const gone = everyNode(c).map(shown);
      c.draw(0.8);
      out[kind] = { visibleBefore: shown(c.el) && shown(c.el.firstChild), gone, again: shown(c.el) && shown(c.el.firstChild) && shown(part), n: gone.length };
    }
    return out;
  });
  for (const [kind, o] of Object.entries(r)) {
    assert.ok(o.visibleBefore, `${kind}: shown while it is on the table`);
    assert.ok(o.n >= 5, `${kind}: wrapper, faces, flap and the added part were all checked`);
    assert.deepEqual(o.gone.filter(Boolean), [], `${kind}: everything is hidden after the exit`);
    assert.ok(o.again, `${kind}: seeking back shows the piece and its part again`);
  }
});

test("clipping: a tucked piece lifts from its own stacking, not from the piece it slid under", async () => {
  const r = await probe(() => {
    const S = window.STAGE;
    const target = window.clipping(S, { img: S.img.a, w: 200, x: 300, y: 300, z: 2 });
    const mover = window.clipping(S, {
      img: S.img.b, w: 200, x: 300, y: 300, z: 6,
      moves: [
        { kind: "slideUnder", at: 0, from: [600, 0], under: 2 },
        { kind: "peel", at: 3 },
      ],
    });
    const z = (t) => (target.draw(t), mover.draw(t), [+target.el.style.zIndex, +mover.el.style.zIndex]);
    const tucked = z(2.9);
    const peeling = z(3.2);
    const again = z(2.9);
    return { tucked, peeling, again };
  });
  assert.ok(r.tucked[1] < r.tucked[0], "tucked: below the target");
  assert.equal(r.peeling[1], 60, "peeling: at its own z (6) above the table, not under the target");
  assert.ok(r.peeling[1] > r.peeling[0], "it lifts off the top of the pile");
  assert.deepEqual(r.again, r.tucked, "seeking back tucks it again");
});

test("handText: written left to right, and the last glyph is fully shown (no clip) at tIn + dur", async () => {
  const r = await probe(() => {
    const S = window.STAGE;
    const h = window.K.handText(S, { text: "Quem?", x: 100, y: 100, size: 80, tIn: 1, dur: 0.8 });
    const at = (t) => (h.draw(t), { v: h.el.style.visibility, c: h.el.style.clipPath });
    const out = { before: at(0.9), mid: at(1.3), end: at(1.8), late: at(4), back: at(1.3) };
    out.cues = h.cues();
    out.endAt = h.end;
    return out;
  });
  assert.equal(r.before.v, "hidden");
  assert.match(r.mid.c, /^inset\(/, "clipped while it is being written");
  assert.equal(r.end.v, "visible");
  assert.equal(r.end.c, "none", "nothing crops the last glyph (or an overhang) once written");
  assert.equal(r.late.c, "none");
  assert.deepEqual(r.back, r.mid, "seeking back re-crops it");
  assert.equal(r.endAt, 1.8);
  assert.deepEqual(r.cues.map((c) => c.type), ["pen"]);
});

// ── Collage language (LOOK-17): crops, rims, flat paper, discs, sliced silhouettes, ransom labels ──

test("clipping: a crop shows part of a big image, its height follows the crop, a rim lies under a deeper-torn face", async () => {
  const r = await probe(() => {
    const S = window.STAGE, img = S.img.a;
    const c = window.clipping(S, { img, w: 300, x: 500, y: 500, crop: [0.5, 0.25, 1, 0.75], rim: true, moves: [{ kind: "slap", at: 0 }] });
    c.draw(1);
    const face = c.el.firstChild, inner = face.firstChild;
    const rim = [...c.el.children].find((e) => e.dataset.part === "rim");
    return {
      h: c.h, expectH: (0.5 * img.naturalHeight * 300) / (0.5 * img.naturalWidth),
      innerW: parseFloat(inner.style.width), innerL: parseFloat(inner.style.left), innerT: parseFloat(inner.style.top),
      innerH: parseFloat(inner.style.height),
      rimClip: rim?.style.clipPath, faceClip: face.style.clipPath, rimZ: rim?.style.zIndex, rimBg: rim?.style.background,
    };
  });
  assert.ok(Math.abs(r.h - r.expectH) < 0.01, `h ${r.h} vs ${r.expectH}`);
  assert.equal(r.innerW, 600, "the image is scaled so the crop's width fills the piece");
  assert.equal(r.innerL, -300);
  assert.ok(Math.abs(r.innerT + 0.25 * r.innerH) < 0.01, "the crop's top sits on the piece's top");
  assert.match(r.rimClip, /^polygon\(/);
  assert.match(r.faceClip, /^polygon\(/);
  assert.notEqual(r.rimClip, r.faceClip, "rim and face have their own tears");
  assert.equal(r.rimZ, "-1", "the rim lies under the face");
  assert.ok(r.rimBg, "the rim is paper-coloured");
});

test("clipping: flat coloured paper needs no image; a disc is cut round", async () => {
  const r = await probe(() => {
    const S = window.STAGE;
    const band = window.clipping(S, { color: "rgb(200, 160, 60)", w: 400, h: 120, x: 300, y: 300, moves: [{ kind: "slap", at: 0 }] });
    const disc = window.clipping(S, { color: "rgb(120, 30, 20)", w: 200, x: 300, y: 600, edge: "disc", moves: [{ kind: "slap", at: 0 }] });
    band.draw(1); disc.draw(1);
    return { bh: band.h, bg: band.el.firstChild.style.background, dh: disc.h, dclip: disc.el.firstChild.style.clipPath };
  });
  assert.equal(r.bh, 120);
  assert.match(r.bg, /rgb\(200, 160, 60\)/);
  assert.equal(r.dh, 200, "a flat piece without h is square");
  assert.match(r.dclip, /^ellipse\(/);
  await assert.rejects(probe(() => window.clipping(window.STAGE, { w: 100, x: 0, y: 0 })), /img or a color/);
});

test("sliced: a silhouette cut in horizontal bands whose neighbouring tears match exactly", async () => {
  const r = await probe(() => {
    const S = window.STAGE;
    const parts = window.K.sliced(S, { img: S.img.a, w: 400, x: 540, y: 900, cuts: [0.3, 0.45], seed: 4, moves: (i) => [{ kind: "slap", at: 0.1 * i }] });
    parts.forEach((p) => p.draw(2));
    const pts = (p) => p.el.firstChild.style.clipPath.replace(/^polygon\(|\)$/g, "").split(",").map((s) => s.trim());
    const [a, b, c] = parts.map(pts);
    return { n: parts.length, hs: parts.map((p) => p.h), aEnd: a.slice(-12), bStart: b.slice(0, 12), cues: parts.map((p) => p.cues().length) };
  });
  assert.equal(r.n, 3);
  assert.ok(r.hs.every((h) => h === r.hs[0]), "every band is a full-size box (one shared frame)");
  assert.deepEqual(r.aEnd.slice().reverse(), r.bStart, "the cut under band 1 is the cut over band 2");
  assert.deepEqual(r.cues, [1, 1, 1]);
});

test("ransom: a black strip whose caps are typed on, sized to its text, with key cues after its landing", async () => {
  const r = await probe(() => {
    const S = window.STAGE;
    const l = window.K.ransom(S, { text: "Uma palavra", size: 50, x: 400, y: 400, tIn: 1, cps: 10 });
    const txt = (t) => (l.draw(t), l.el.querySelector("[data-part=text]").textContent);
    return { w: l.w, h: l.h, t0: txt(0.5), t1: txt(1.35), t2: txt(3), types: l.cues().map((c) => c.type), first: l.cues()[0].t };
  });
  assert.ok(r.w > 200 && r.w < 600, `width ${r.w}`);
  assert.ok(r.h > 50 && r.h < 110, `height ${r.h}`);
  assert.equal(r.t0, "");
  assert.equal(r.t1, "UMA");
  assert.equal(r.t2, "UMA PALAVRA");
  assert.equal(r.types[0], "paper-place");
  assert.equal(r.types.filter((t) => t === "key").length, 10);
});
