// Samples the film's trace and checks what a viewer reads: caption reading time, words cut by the
// frame edge, empty frames (incl. the closing pull-out), hero placement, camera emphasis.
import { chromium } from "playwright";
import { startServer, filmUrl, rootFor } from "../server.mjs";
import { layout } from "../lib/layout.js";
import { NORMS } from "./norms.mjs";
import { finding } from "./report.mjs";
import { houseError, houseStart } from "./house.mjs";
import { groundIds } from "./grounds.mjs";

export async function sampleTrace(
  filmDir,
  { format = "9x16", fps = NORMS.fps, root } = {},
) {
  const L = layout(format);
  const server = await startServer(0, rootFor(filmDir, root));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: L.W, height: L.H },
      deviceScaleFactor: 1,
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e));
    await page.goto(filmUrl(server, filmDir, `?format=${format}&render=1`));
    try {
      await page.waitForFunction(
        () => window.ready === true || window.__filmError,
        null,
        { timeout: 60_000 },
      );
    } catch (e) {
      throw errors[0] ?? e;
    }
    if (errors.length) throw errors[0];
    const { dur, W, H, house } = await page.evaluate(() => ({
      dur: window.FILM.dur,
      W: window.FILM.W,
      H: window.FILM.H,
      house: window.FILM.house,
    }));
    if (!(Number.isFinite(dur) && dur > 0))
      throw new Error(
        `FILM.dur must be a positive number of seconds, got ${dur}`,
      );
    const n = Math.round(dur * fps);
    const frames = await page.evaluate(
      ({ n, fps }) => {
        const out = [];
        for (let i = 0; i < n; i++) {
          const t = i / fps;
          window.seek(t);
          out.push({
            t,
            items: window.trace ? window.trace(t) : null,
            camera: window.camera ? window.camera(t) : null,
          });
        }
        return out;
      },
      { n, fps },
    );
    if (errors.length) throw errors[0];
    // Trace boxes are in the film's own frame pixels; a film that declares W/H overrides the layout,
    // and the format's safe box [x, y, w, h] is scaled to that frame.
    const [fw, fh] = [W ?? L.W, H ?? L.H];
    const [sx, sy] = [fw / L.W, fh / L.H];
    const safe = [L.box.x * sx, L.box.y * sy, L.box.w * sx, L.box.h * sy];
    const out = { W: fw, H: fh, dur, fps, safe, frames };
    if (house !== undefined && house !== null) out.house = house;
    return out;
  } finally {
    await browser.close();
    server.close();
  }
}

// The part of a box inside the W x H frame: what is off screen fills nothing.
const visibleArea = ([x, y, w, h], W, H) =>
  Math.max(0, Math.min(x + w, W) - Math.max(x, 0)) *
  Math.max(0, Math.min(y + h, H) - Math.max(y, 0));
const crosses = ([x, y, w, h], W, H) =>
  x < 0 || y < 0 || x + w > W || y + h > H;

// `ground` (a ground or paper under the pieces) and `target` (a beat's zoom target part, T9) are
// registered for the gates that read them; neither counts as coverage.
const ROLES = new Set([
  "caption",
  "lettering",
  "hero",
  "support",
  "mark",
  "piece",
  "ground",
  "target",
]);
const COVER = new Set(["hero", "support", "piece"]);
// An item every gate can measure, alpha defaulted to 1 as makeTrace does; null when malformed (a
// NaN would make every comparison false, so the gate would pass on it).
function normalize(it) {
  const alpha = it?.alpha ?? 1;
  const ok =
    ROLES.has(it?.role) &&
    Array.isArray(it.box) &&
    it.box.length === 4 &&
    it.box.every(Number.isFinite) &&
    Number.isFinite(alpha) &&
    alpha >= 0 &&
    alpha <= 1;
  return ok ? { ...it, alpha } : null;
}

// Each id's frames in order, split into runs of consecutive frames: Map(id → [[{ i, box, alpha }]]).
// An id registered under two roles (a hero that becomes a support) is one thing; in a frame that
// has it twice, the first wins.
function runsOf(frames, roles) {
  const runs = new Map();
  frames.forEach((f, i) => {
    for (const it of f.items) {
      if (!roles(it)) continue;
      const rs = runs.get(it.id) ?? [];
      const run = rs.at(-1);
      const at = { i, box: it.box, alpha: it.alpha };
      if (run?.at(-1).i === i) continue;
      if (run?.at(-1).i === i - 1) run.push(at);
      else rs.push([at]);
      runs.set(it.id, rs);
    }
  });
  return runs;
}
const moved = (a, b, px = 0.5) => a.some((v, k) => Math.abs(v - b[k]) > px);

// T4 does not read text crossing the edge while it slides in or out: the frames of a run before
// its first frame wholly inside (or after its last), where the box is moving to the next frame (or
// from the previous one). Text that never fits, or sits still across the edge, is still read.
function edgeTransit(frames, W, H) {
  const out = new Set();
  const text = (it) => it.role === "caption" || it.role === "lettering";
  for (const [id, rs] of runsOf(frames, text))
    for (const run of rs) {
      const inside = run.map((e) => !crosses(e.box, W, H));
      const first = inside.indexOf(true);
      if (first < 0) continue;
      const last = inside.lastIndexOf(true);
      run.forEach((e, k) => {
        if (k < first ? moved(e.box, run[k + 1].box) : k > last && moved(e.box, run[k - 1].box))
          out.add(`${id}:${e.i}`);
      });
    }
  return out;
}

// How each piece (hero, support, piece; never a ground) first shows in each of its runs, for T12
// (a pop-in) and T5's entrance grace: [{ id, i, how }] where `how` is "edge" (the box touches or
// crosses the frame edge), "moves" (it travels or scales in), "fades" (alpha under heroAlpha),
// "uncovered" (inside a piece that moves off it), or "in place".
function entrances(frames, W, H, grounds, fps, F) {
  const piece = (it) => COVER.has(it.role) && !grounds.has(it.id);
  const all = runsOf(frames, piece);
  const near = F.edgePx;
  const touches = ([x, y, w, h]) => !(x > near && y > near && x + w < W - near && y + h < H - near);
  const span = Math.max(1, Math.round(F.entryWindowS * fps));
  const travels = (e0, later) =>
    later.some(
      (e) =>
        Math.max(Math.abs(e.box[0] - e0.box[0]), Math.abs(e.box[1] - e0.box[1])) >= F.entryTravel * W ||
        Math.abs(e.box[2] / e0.box[2] - 1) >= F.entryScale ||
        Math.abs(e.box[3] / e0.box[3] - 1) >= F.entryScale,
    );
  const contains = (a, b) =>
    b[0] >= a[0] - near && b[1] >= a[1] - near && b[0] + b[2] <= a[0] + a[2] + near && b[1] + b[3] <= a[1] + a[3] + near;
  const out = [];
  for (const [id, rs] of all)
    for (const run of rs) {
      const v = run.findIndex((e) => e.alpha > 0 && visibleArea(e.box, W, H) > 0);
      if (v < 0) continue;
      const e0 = run[v];
      const later = run.slice(v + 1, v + 1 + span);
      // Under another piece on the frame before, which travels or leaves within the window.
      const uncovered = () =>
        [...all].some(
          ([other, ors]) =>
            other !== id &&
            ors.some((o) => {
              const k = o.findIndex((e) => e.i === e0.i - 1);
              if (k < 0 || !contains(o[k].box, e0.box)) return false;
              const after = o.slice(k + 1, k + 1 + span);
              return after.length < span || travels(o[k], after);
            }),
        );
      const how = touches(e0.box)
        ? "edge"
        : travels(e0, later)
          ? "moves"
          : e0.alpha < F.heroAlpha
            ? "fades"
            : uncovered()
              ? "uncovered"
              : "in place";
      out.push({ id, i: e0.i, how });
    }
  return out.sort((a, b) => a.i - b.i);
}

// `manifest` (optional) names the ground assets T5 must not count.
export function checkTrace(tr, { manifest, norms = NORMS } = {}) {
  const { W, H } = tr;
  const grounds = groundIds(manifest);
  const fps = tr.fps ?? NORMS.fps;
  if (!tr.frames?.length)
    return [finding("red", "T0", null, "no frames were sampled")];
  if (tr.frames.some((f) => !Array.isArray(f.items)))
    return [finding("red", "T0", null, "film exposes no window.trace")];
  const malformed = new Map();
  const frames = tr.frames.map((f) => ({
    ...f,
    items: f.items.map((it) => {
      const n = normalize(it);
      if (!n && !malformed.has(it?.id))
        malformed.set(
          it?.id,
          finding("red", "T0", f.t, `malformed trace item ${it?.id}`),
        );
      return n;
    }),
  }));
  // A NaN scale would silence both camera gates (T7, T8).
  const badCam = frames.find(
    (f) => f.camera && !(Number.isFinite(f.camera.scale) && f.camera.scale > 0),
  );
  if (badCam)
    malformed.set(
      Symbol.for("camera"),
      finding(
        "red",
        "T0",
        badCam.t,
        "malformed camera: scale must be a positive number",
      ),
    );
  const badHouse = houseError(tr);
  if (badHouse) malformed.set(Symbol.for("house"), finding("red", "T0", null, badHouse));
  if (malformed.size) return [...malformed.values()];
  // The house outro puts nothing in the trace: the picture gates (T5, T6, camera) skip its frames.
  const houseT0 = houseStart(tr) ?? Infinity;
  const story = (f) => f.t < houseT0 - 1e-6;
  const out = [];
  const once = new Set();
  const flag = (sev, code, t, msg, key = code) => {
    if (!once.has(key)) {
      once.add(key);
      out.push(finding(sev, code, t, msg));
    }
  };
  const transit = edgeTransit(frames, W, H);
  // A scene opens at frame 0 and at every hard cut (a new camera shot): a composed picture.
  const cutAt = (i) =>
    i === 0 || (frames[i].camera?.shot != null && frames[i].camera.shot !== frames[i - 1].camera?.shot);
  const F = norms.frames;
  const entries = entrances(frames, W, H, grounds, fps, F);
  // T5's grace: the first entranceGraceS of a scene whose first piece arrives entering.
  const graced = [];
  frames.forEach((f, i) => {
    if (!cutAt(i)) return;
    const first = entries.find((e) => e.i >= i);
    if (first && frames[first.i].t - f.t < F.entranceGraceS - 1e-6 && first.how !== "in place")
      graced.push([f.t, f.t + F.entranceGraceS]);
  });
  const inGrace = (t) => graced.some(([a, b]) => t >= a - 1e-6 && t < b - 1e-6);
  for (const e of entries) {
    const f = frames[e.i];
    if (e.how !== "in place" || cutAt(e.i) || !story(f)) continue;
    flag(
      "orange",
      "T12",
      f.t,
      `${e.id} appears in place at full size (a pop-in, or its trace box leaves out its entrance)`,
      `T12:${e.id}:${e.i}`,
    );
  }
  const captions = new Map();
  frames.forEach((f, fi) => {
    let cover = 0;
    for (const it of f.items) {
      // A display word bled off the edge on purpose says so with `bleed: true`; a caption is
      // read, never bled, so the flag does not excuse one.
      const bled = it.role === "lettering" && it.bleed === true;
      if (
        (it.role === "caption" || it.role === "lettering") &&
        !bled &&
        crosses(it.box, W, H) &&
        !transit.has(`${it.id}:${fi}`)
      )
        flag(
          "red",
          "T4",
          f.t,
          `${it.id} "${it.text}" crosses the frame edge`,
          `T4:${it.id}`,
        );
      if (it.role === "caption") {
        const c = captions.get(it.id) ?? {
          text: it.text,
          first: f.t,
          legible: 0,
        };
        if (it.alpha >= NORMS.caption.legibleAlpha) c.legible += 1 / fps;
        captions.set(it.id, c);
      }
      if (COVER.has(it.role) && !grounds.has(it.id))
        cover += visibleArea(it.box, W, H) * it.alpha;
    }
    if (!story(f)) return;
    const hero = f.items.find(
      (i) => i.role === "hero" && i.alpha >= NORMS.frames.heroAlpha,
    );
    if (!hero)
      flag(
        "orange",
        "T6",
        f.t,
        "no hero on screen",
        `T6:none:${Math.floor(f.t)}`,
      );
    else {
      const cx = (hero.box[0] + hero.box[2] / 2) / W;
      const [a, b] = NORMS.frames.heroThird;
      if (cx < a || cx > b)
        flag(
          "orange",
          "T6",
          f.t,
          `hero ${hero.id} off the middle third`,
          `T6:${hero.id}`,
        );
    }
    if (cover / (W * H) < NORMS.frames.minCoverage && !inGrace(f.t))
      flag(
        "red",
        "T5",
        f.t,
        `pieces cover ${Math.round((100 * cover) / (W * H))} % of the frame`,
      );
  });
  for (const [id, c] of captions) {
    const words = c.text.trim().split(/\s+/).length;
    if (c.legible + 1e-6 < NORMS.caption.minLegibleS)
      flag(
        "red",
        "T2",
        c.first,
        `caption ${id} "${c.text}" legible ${c.legible.toFixed(2)} s`,
        `T2:${id}`,
      );
    else if (c.text.length / c.legible > NORMS.caption.maxCps)
      flag(
        "red",
        "T1",
        c.first,
        `caption ${id} at ${(c.text.length / c.legible).toFixed(1)} cps`,
        `T1:${id}`,
      );
    if (words > NORMS.caption.maxWords)
      flag(
        "orange",
        "T3",
        c.first,
        `caption ${id} has ${words} words`,
        `T3:${id}`,
      );
  }
  const storyFrames = frames.filter(story);
  const cams = storyFrames.map((f) => f.camera).filter(Boolean);
  if (cams.length) {
    const s = cams.map((c) => c.scale);
    const delta = Math.max(...s) / Math.min(...s) - 1;
    if (delta < norms.camera.emphasisMinScaleDelta)
      flag(
        "orange",
        "T7",
        null,
        `camera scale moves only ${(100 * delta).toFixed(0)} %`,
      );
    // A frame step under norms.camera.holdRate is a held camera (the table's breathing), not a
    // move, so its near-linear stretches are not T8.
    const moving = (d, base) => Math.abs(d) / base > norms.camera.holdRate / fps;
    let run = 0;
    for (let i = 2; i < s.length; i++) {
      const d1 = s[i - 1] - s[i - 2],
        d2 = s[i] - s[i - 1];
      run = moving(d1, s[i - 2]) && Math.abs(d2 - d1) < 1e-7 ? run + 1 : 0;
      if (run > norms.camera.maxLinearRunFrames) {
        flag("yellow", "T8", storyFrames[i].t, "camera move is linear (no ease)");
        break;
      }
    }
  }
  return out;
}
