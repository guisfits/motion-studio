// A film that closes on the project's house outro (a pre-approved closing piece it imports) puts
// nothing of it in the trace. It declares the window as `FILM.house = [t0, t1]` (seconds, t1 at the
// film's end); sampleTrace carries it as `trace.house`. The picture and rhythm gates read the
// story only: frames from t0 on are dropped and the story ends at t0. Captions, legibility and
// media gates keep reading the whole render.
import { NORMS } from "./norms.mjs";

const EPS = 1e-6;

// Why the declaration is unusable, or null when it is fine (or absent).
export function houseError(trace) {
  const h = trace.house;
  if (h === undefined || h === null) return null;
  if (!Array.isArray(h) || h.length !== 2 || !h.every(Number.isFinite))
    return "FILM.house must be [t0, t1] in seconds";
  const [t0, t1] = h;
  if (!(t0 > 0 && t1 > t0)) return `FILM.house [${t0}, ${t1}] must satisfy 0 < t0 < t1`;
  const dur = trace.dur ?? (trace.frames?.length ?? 0) / (trace.fps ?? NORMS.fps);
  if (t1 < dur - 1 / (trace.fps ?? NORMS.fps) - EPS)
    return `FILM.house ends at ${t1} s, before the film's end (${dur} s): the house window must close the film`;
  return null;
}

// The house window start when the declaration is valid, else null.
export const houseStart = (trace) => (trace.house && !houseError(trace) ? trace.house[0] : null);

// The trace the picture and rhythm gates read: the story, ending where the house window begins.
export function storyOf(trace) {
  const t0 = houseStart(trace);
  if (t0 === null) return trace;
  return {
    ...trace,
    dur: t0,
    frames: (trace.frames ?? []).filter((f) => f.t < t0 - EPS),
  };
}
