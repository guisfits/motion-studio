// Ease curves for camera legs, ported from the engine's core/lib/table.js and motion.js.
// The engine ran GLIDE/MOVE/WHIP as springs; here each is a closed-form curve of leg progress,
// so a frame never depends on the one before it (a 10-minute film stays exact at frame 18 000).

export type CamEase = "glide" | "move" | "whip";

// Engine smootherstep (core/lib/motion.js): the "bell" every baseline leg uses.
export const smootherstep = (p: number): number => {
  const t = Math.min(1, Math.max(0, p));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export type EasePreset = {
  /** Seconds the travel takes; the leg then holds until its end key. Infinity = whole leg. */
  travelSeconds: number;
};

// glide: slow drift over the whole leg (engine GLIDE, settles ~1.2 s+); move: a confident
// ~0.7 s travel (engine k95/d17); whip: lands hard in ~0.35 s (engine k260/d30).
export const EASES: Record<CamEase, EasePreset> = {
  glide: { travelSeconds: Infinity },
  move: { travelSeconds: 0.7 },
  whip: { travelSeconds: 0.35 },
};

export const DEFAULT_EASE: CamEase = "glide";

/** Leg progress 0..1 for `elapsed` frames into a leg of `length` frames. */
export const easeProgress = (ease: CamEase, elapsed: number, length: number, fps: number): number => {
  const travel = Math.min(length, EASES[ease].travelSeconds * fps);
  return travel <= 0 ? 1 : smootherstep(elapsed / travel);
};
