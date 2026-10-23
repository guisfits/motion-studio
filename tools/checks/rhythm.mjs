// Edit rhythm against register A (grammar §10): how often the picture, the caption or the shot
// changes, read from the sampled trace. Pure: trace (+ words) in, findings out.
//
// An edit event is a frame where one of these differs from its last value:
//   - the hero on screen (the first `hero` item at alpha >= NORMS.frames.heroAlpha), a fade does
//     not count until it is legible;
//   - the caption chunk (id of the `caption` item at alpha >= NORMS.caption.legibleAlpha); a
//     caption leaving is not an event, the next one arriving is;
//   - the camera's `shot` (a film reports a new value after each hard cut);
//   - an arrival, for a register that lists "arrival" in rhythm.events: a hero, support or piece
//     (never a ground) legible for the first time in the film.
// Frame 0 sets the first values and is not an event; events within NORMS.rhythm.eventMergeS of
// the last one are the same edit.
import { NORMS } from "./norms.mjs";
import { finding } from "./report.mjs";
import { storyOf } from "./house.mjs";
import { groundIds } from "./grounds.mjs";

const EPS = 1e-6;

const legibleHero = (items) =>
  items.find((i) => i?.role === "hero" && (i.alpha ?? 1) >= NORMS.frames.heroAlpha)?.id;
const legibleCaption = (items) =>
  items.find((i) => i?.role === "caption" && (i.alpha ?? 1) >= NORMS.caption.legibleAlpha)?.id;

const PIECES = new Set(["hero", "support", "piece"]);

export function editEvents(trace, { events = NORMS.rhythm.events, grounds = new Set() } = {}) {
  const frames = trace.frames ?? [];
  const kinds = new Set(events);
  const reads = [
    kinds.has("hero") && ((f) => legibleHero(f.items ?? [])),
    kinds.has("caption") && ((f) => legibleCaption(f.items ?? [])),
    kinds.has("shot") && ((f) => f.camera?.shot),
  ].filter(Boolean);
  const last = reads.map(() => undefined);
  const arrived = new Set();
  const out = [];
  frames.forEach((f, i) => {
    let changed = false;
    if (kinds.has("arrival"))
      for (const it of f.items ?? []) {
        if (!PIECES.has(it?.role) || grounds.has(it.id) || (it.alpha ?? 1) < NORMS.frames.heroAlpha) continue;
        if (!arrived.has(it.id) && i > 0) changed = true;
        arrived.add(it.id);
      }
    reads.forEach((read, k) => {
      const v = read(f);
      if (v === undefined || v === null) return;
      if (v !== last[k] && i > 0) changed = true;
      last[k] = v;
    });
    if (changed && !(out.length && f.t - out.at(-1) < NORMS.rhythm.eventMergeS - EPS)) out.push(f.t);
  });
  return out;
}

// Gates per stage (crew-v2 spec): R3 needs the voice against the animatic, R4 the finished cut.
const GATES = {
  animatic: ["R1", "R2", "R3"],
  draft: ["R1", "R2", "R4"],
  final: ["R1", "R2", "R4"],
};

// The camera holds still over [t0, t1] when its scale and centre barely move.
function stillOver(frames, t0, t1, W, R) {
  const cams = frames
    .filter((f) => f.t >= t0 - EPS && f.t <= t1 + EPS)
    .map((f) => f.camera)
    .filter(Boolean);
  if (!cams.length) return true;
  const s = cams.map((c) => c.scale);
  const span = (k) => Math.max(...cams.map((c) => c[k] ?? 0)) - Math.min(...cams.map((c) => c[k] ?? 0));
  const scale = Math.max(...s);
  return (
    Math.max(...s) / Math.min(...s) - 1 < R.stillTravel &&
    Math.max(span("x"), span("y")) * scale < R.stillTravel * W
  );
}

// A declared house outro (`trace.house`, tools/checks/house.mjs) is not part of the cut: the story
// ends where it begins, so R4's last 5 s are the story's.
// `norms` is the register's (normsFor(sheet.register)); register A when omitted.
// `manifest` (optional) names the ground assets that are no arrival.
export function checkRhythm(fullTrace, words, { stage, norms = NORMS, manifest }) {
  const R = norms.rhythm;
  const trace = storyOf(fullTrace);
  const gates = new Set(GATES[stage] ?? []);
  const frames = trace.frames ?? [];
  if (!frames.length || frames.some((f) => !Array.isArray(f.items))) return []; // T0 reports it
  const fps = trace.fps ?? NORMS.fps;
  const dur = trace.dur ?? frames.length / fps;
  const ev = editEvents(trace, { events: R.events, grounds: groundIds(manifest) });
  const n = Math.max(ev.length, 1);
  const out = [];
  const between = (a, b) => ev.filter((t) => t >= a - EPS && t < b - EPS).length;

  if (gates.has("R1")) {
    const asl = dur / n;
    const [lo, hi] = R.aslRange;
    if (asl < lo || asl > hi)
      out.push(
        finding(
          "red",
          "R1",
          null,
          `average event length ${asl.toFixed(2)} s over ${ev.length} events (${lo}–${hi} s)`,
        ),
      );
    const bounds = [0, ...ev, dur];
    for (let i = 1; i < bounds.length; i++) {
      const [a, b] = [bounds[i - 1], bounds[i]];
      if (b - a >= R.maxStillHoldS && stillOver(frames, a, b, trace.W, R)) {
        out.push(
          finding(
            "orange",
            "R1",
            a,
            `still hold of ${(b - a).toFixed(1)} s (no event, camera still; < ${R.maxStillHoldS} s)`,
          ),
        );
        break;
      }
    }
  }

  // Any 10 s window that ends before the last 5 s (the ending is R4's).
  if (gates.has("R2")) {
    const [lo, hi] = R.eventsPer10s;
    let few = null,
      many = null;
    for (let s = 0; s + 10 <= dur - 5 + EPS; s += 1 / fps) {
      const k = between(s, s + 10);
      if (k < lo && !few) few = [s, k];
      if (k > hi && !many) many = [s, k];
    }
    if (few)
      out.push(
        finding("orange", "R2", few[0], `only ${few[1]} events in the 10 s from here (< ${lo})`),
      );
    if (many)
      out.push(
        finding("orange", "R2", many[0], `too many: ${many[1]} events in the 10 s from here (> ${hi})`),
      );
  }

  if (gates.has("R3")) {
    const spoken = (words?.words ?? []).filter((w) => w.start >= -EPS && w.start <= dur).length;
    const per = spoken / n;
    const [lo, hi] = R.wordsPerEvent;
    if (per < lo || per > hi)
      out.push(
        finding(
          "orange",
          "R3",
          null,
          `${per.toFixed(1)} spoken words per event (${spoken} words, ${ev.length} events; ${lo}–${hi})`,
        ),
      );
  }

  if (gates.has("R4") && dur > 10) {
    const body = between(0, dur - 5) / (dur - 5);
    const end = between(dur - 5, dur + 1) / 5;
    if (end > R.endSlowdown * body + EPS)
      out.push(
        finding(
          "orange",
          "R4",
          dur - 5,
          `the last 5 s cut at ${(end / body).toFixed(2)}x the body rate (≤ ${R.endSlowdown}x)`,
        ),
      );
  }
  return out;
}
