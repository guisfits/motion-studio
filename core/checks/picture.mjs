// Gates on what is on screen against the paper: each beat's hero is up by its first key word (H1),
// every picture on screen is a ready, licensed manifest asset (P1), each beat's zoom target stays
// in the safe box once its key word is spoken (T9), each emphasis move is big enough on its own
// and punches stay rare (T7). Pure: trace + sheet + manifest in, findings out. Trace ids of
// hero/support/piece items are manifest asset ids; a beat's zoom target is the `target` item
// `<beat id>-target`.
import { NORMS } from "./norms.mjs";
import { finding } from "./report.mjs";
import { storyOf } from "./house.mjs";

const PICTURES = new Set(["hero", "support", "piece"]);
const EPS = 1e-6;
// Sheet `zoom.kind`s that are emphasis moves (a drift, pan or tilt is not judged by scale).
const EMPHASIS = new Set(["push-in", "pull-out"]);

const inside = ([x, y, w, h], [sx, sy, sw, sh]) =>
  x >= sx - EPS && y >= sy - EPS && x + w <= sx + sw + EPS && y + h <= sy + sh + EPS;

// T9: from the beat's first key word (where its move has landed) to the beat's end, the target
// is registered and inside the safe box (trace.safe, else the whole frame). A key word on the beat's
// first frame (a hard cut on the word) is read from the beat's first sampled frame, never from the
// previous scene's.
function zoomTargets(trace, beats) {
  const out = [];
  const frames = trace.frames;
  const fps = trace.fps ?? NORMS.fps;
  const safe = trace.safe ?? [0, 0, trace.W, trace.H];
  for (const b of beats) {
    const key = b.key?.[0];
    if (!b.zoom?.target || !key) continue;
    const id = `${b.id}-target`;
    const start = Math.max(key.t - 0.5 / fps, b.t?.[0] ?? -Infinity);
    const span = frames.filter((f) => f.t >= start - EPS && f.t <= b.t[1] + EPS);
    const boxOf = (f) => f.items.find((it) => it?.role === "target" && it.id === id)?.box;
    if (!span.length || !boxOf(span[0])) {
      out.push(finding("red", "T9", key.t, `${b.id}: zoom target ${b.zoom.target} not registered at "${key.word}" (trace id ${id})`));
      continue;
    }
    const off = span.find((f) => boxOf(f) && !inside(boxOf(f), safe));
    if (off)
      out.push(finding("red", "T9", off.t, `${b.id}: zoom target ${b.zoom.target} leaves the safe box`));
  }
  return out;
}

// The biggest scale move inside [t0, t1]: frames are split at hard cuts (a change of camera.shot),
// so a cut is never read as a move. `ratio` is max/min scale of that segment; `spanS` is how long
// the scale actually moves in it (the frames whose step is above `holdRate`, a held camera's
// breathing does not count), first to last.
function biggestMove(frames, [t0, t1], fps, holdRate) {
  const segs = new Map();
  for (const f of frames)
    if (f.camera && f.t >= t0 - EPS && f.t <= t1 + EPS) {
      const k = f.camera.shot ?? 0;
      segs.set(k, [...(segs.get(k) ?? []), f]);
    }
  let best = { ratio: 1, spanS: 0 };
  for (const seg of segs.values()) {
    const s = seg.map((f) => f.camera.scale);
    const ratio = Math.max(...s) / Math.min(...s);
    if (ratio <= best.ratio) continue;
    let first = -1,
      last = -1;
    for (let i = 1; i < seg.length; i++)
      if (Math.abs(s[i] - s[i - 1]) / s[i - 1] > holdRate / fps) {
        if (first < 0) first = i - 1;
        last = i;
      }
    best = { ratio, spanS: first < 0 ? 0 : seg[last].t - seg[first].t };
  }
  return best;
}

// T7: each emphasis move is big enough on its own, punches stay rare. A register that sets
// camera.maxPushRatePerS / minMoveS (the instructive one) also holds the move to a calm bell:
// the average scale change per second over the move, and the move's length.
function emphasisMoves(trace, beats, norms) {
  const out = [];
  const cam = norms.camera;
  const fps = trace.fps ?? NORMS.fps;
  let punches = 0;
  for (const b of beats) {
    if (!Array.isArray(b.t)) continue;
    const { ratio, spanS } = biggestMove(trace.frames, b.t, fps, cam.holdRate);
    if (ratio >= cam.punchMax - EPS) punches++;
    if (!EMPHASIS.has(b.zoom?.kind)) continue;
    if (ratio - 1 < cam.emphasisMinScaleDelta - EPS) {
      out.push(
        finding("orange", "T7", b.t[0], `${b.id}: ${b.zoom.kind} moves only ${(100 * (ratio - 1)).toFixed(0)} % (≥ ${100 * cam.emphasisMinScaleDelta} %)`),
      );
      continue;
    }
    if (cam.minMoveS !== undefined && spanS < cam.minMoveS - EPS)
      out.push(
        finding("orange", "T7", b.t[0], `${b.id}: ${b.zoom.kind} lasts ${spanS.toFixed(2)} s (a calm move spans ≥ ${cam.minMoveS} s)`),
      );
    else if (cam.maxPushRatePerS !== undefined && (ratio - 1) / spanS > cam.maxPushRatePerS + EPS)
      out.push(
        finding("orange", "T7", b.t[0], `${b.id}: ${b.zoom.kind} changes scale ${(100 * (ratio - 1) / spanS).toFixed(0)} %/s (≤ ${100 * cam.maxPushRatePerS} %/s)`),
      );
  }
  if (punches > cam.maxPunches)
    out.push(finding("orange", "T7", null, `${punches} punches (scale ×${cam.punchMax} or more; ≤ ${cam.maxPunches} per film)`));
  return out;
}

// `norms` is the register's (normsFor(sheet.register)); register A when omitted.
export function checkPicture(fullTrace, sheet, manifest, norms = NORMS) {
  const out = [];
  if ((fullTrace.frames ?? []).some((f) => !Array.isArray(f.items))) return out; // T0 already reports it
  // H1, T7 and T9 read the story: a declared house outro (core/checks/house.mjs) is not judged.
  const trace = storyOf(fullTrace);
  const frames = trace.frames ?? [];

  // H1: the window is in film frames (NORMS.fps), whatever rate the trace was sampled at.
  const [from, to] = NORMS.sync.heroWindowFrames.map((n) => n / NORMS.fps);
  for (const b of sheet.beats ?? []) {
    const asset = b.hero?.asset;
    const key = b.key?.[0];
    if (!asset || !key) continue;
    // A key word on the beat's first frame: the window opens at the cut and closes on the beat's
    // first sampled frame, since the frames before the cut are the previous scene.
    const open = b.t ? Math.max(key.t + from, b.t[0]) : key.t + from;
    const first = b.t ? frames.find((f) => f.t >= b.t[0] - EPS)?.t : undefined;
    const close = Math.max(key.t + to, first !== undefined && first - key.t <= 1 / (trace.fps ?? NORMS.fps) + EPS ? first : -Infinity);
    const landed = frames.some(
      (f) =>
        f.t >= open - EPS &&
        f.t <= close + EPS &&
        f.items.some(
          (it) => it.id === asset && (it.alpha ?? 1) >= NORMS.frames.heroAlpha,
        ),
    );
    if (!landed)
      out.push(
        finding(
          "red",
          "H1",
          key.t,
          `${b.id}: hero ${asset} is not on screen at "${key.word}"`,
        ),
      );
  }

  if (frames.some((f) => f.camera)) out.push(...emphasisMoves(trace, sheet.beats ?? [], norms));
  out.push(...zoomTargets(trace, sheet.beats ?? []));

  // P1: captions, lettering and marks are drawn by the film, not taken from the manifest.
  const usable = new Set(
    (manifest.assets ?? [])
      .filter((a) => a.status === "ready" && a.licence)
      .map((a) => a.id),
  );
  const flagged = new Set();
  for (const f of fullTrace.frames ?? [])
    for (const it of f.items)
      if (PICTURES.has(it.role) && !usable.has(it.id) && !flagged.has(it.id)) {
        flagged.add(it.id);
        out.push(
          finding(
            "red",
            "P1",
            f.t,
            `placeholder or unknown asset on screen: ${it.id}`,
          ),
        );
      }
  return out;
}
