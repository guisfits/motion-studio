import { cameraAt, DEFAULT_FPS, type CamKey } from "./path";

export type PeakOptions = {
  /**
   * What "fastest" means. `screen` (default) is `cameraAt`'s velocity, what the eye sees travel.
   * `scale` is the change of log(zoom): a dive reads as a change of scale ratio, so a zoom-through
   * cuts where that is fastest.
   */
  metric?: "screen" | "scale";
  /** The composition rate the keys are timed at (`useVideoConfig().fps`); default 30, as `cameraAt`. */
  fps?: number;
};

const SAMPLE = 0.05; // frames

/**
 * The frame in [from, to] where the camera is fastest: cut there and the motion carries across
 * the cut ("cut on the curve"). Built on `cameraAt`, so it follows the same easing as the render.
 * Returns a whole frame (a cut sits on one); the first of equals wins.
 */
export function cutAtPeak(
  keys: CamKey[],
  from: number,
  to: number,
  { metric = "screen", fps = DEFAULT_FPS }: PeakOptions = {},
): number {
  const speed = (f: number): number => {
    if (metric === "screen") return cameraAt(keys, f, fps).velocity;
    const a = cameraAt(keys, f - 1, fps);
    const b = cameraAt(keys, f + 1, fps);
    return Math.abs(Math.log(b.zoom) - Math.log(a.zoom));
  };
  let best = from;
  let top = -1;
  for (let f = from; f <= to + 1e-9; f += SAMPLE) {
    const v = speed(f);
    if (v > top + 1e-9) (top = v), (best = f);
  }
  return Math.min(to, Math.max(from, Math.round(best)));
}

export type ZoomThroughOptions = {
  /** Frame the dive starts on. */
  at: number;
  /** Frames the dive lasts, ending on the next shot's landing pose. */
  dur?: number;
  /** The outgoing shot's camera when the dive starts. */
  from: { x: number; y: number; zoom?: number };
  /** The world point (px) dived into: a hole, a word, an eye. It glides to the frame's centre. */
  target: { x: number; y: number };
  /** The incoming shot's camera when the dive lands (its own world, centred on x, y). */
  next: { x: number; y: number; zoom?: number };
  /** Total scale gained over the dive. */
  depth?: number;
  /** Power of the symmetric ease-in-out (After Effects' Easy Ease is about 2.4). */
  ease?: number;
};

export type ZoomThrough = {
  /** `Camera` keys: the dive, a hard cut (two keys on one frame) at the peak, the landing. */
  keys: CamKey[];
  /** Frame the picture cuts to the next shot on: the dive's fastest point. */
  cutFrame: number;
  /** Frame the move lands on. */
  endFrame: number;
};

const easeInOut = (u: number, power: number): number => {
  const a = Math.min(1, Math.max(0, u)) ** power;
  const b = (1 - Math.min(1, Math.max(0, u))) ** power;
  return a / (a + b || 1);
};

/**
 * The into-screen dive: the camera pushes into `target` of the outgoing shot, accelerating (one
 * eased scale move, log scale), the point gliding to the frame's centre, and hard-cuts to the
 * next shot at the move's peak; the incoming shot rides the same move, from `depth` times
 * smaller, and lands on `next`. A keys builder: one function feeds the render and the trace.
 * Keys are per-frame on a linear ease, so each frame is exact and independent of the others.
 */
export function zoomThrough({
  at,
  dur = 33,
  from,
  target,
  next,
  depth = 12,
  ease = 2.4,
}: ZoomThroughOptions): ZoomThrough {
  const z0 = from.zoom ?? 1;
  const z1 = next.zoom ?? 1;
  const end = at + dur;
  const p = (f: number) => easeInOut((f - at) / dur, ease);
  // Screen offset from the frame's centre of the dived point: starts where `from` shows it and glides to 0.
  const off0 = { x: z0 * (target.x - from.x), y: z0 * (target.y - from.y) };
  const outgoing = (f: number): CamKey => {
    const zoom = z0 * depth ** p(f);
    const k = 1 - p(f);
    return { frame: f, zoom, x: target.x - (off0.x * k) / zoom, y: target.y - (off0.y * k) / zoom, ease: "linear" };
  };
  const incoming = (f: number): CamKey => {
    const zoom = z1 * depth ** (p(f) - 1);
    const k = 1 - p(f);
    return { frame: f, zoom, x: next.x - (off0.x * k) / zoom, y: next.y - (off0.y * k) / zoom, ease: "linear" };
  };

  const out: CamKey[] = [];
  for (let f = at; f <= end; f++) out.push(outgoing(f));
  const cutFrame = cutAtPeak(out, at, end, { metric: "scale" });
  const keys = out.filter((k) => k.frame <= cutFrame);
  for (let f = cutFrame; f <= end; f++) keys.push(incoming(f));
  return { keys, cutFrame, endFrame: end };
}
