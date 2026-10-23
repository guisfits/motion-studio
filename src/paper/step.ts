/**
 * Holds `frame` on a stop-motion clock of `stepFps` poses per second.
 *
 * Returns the integer frame at which the current pose started, so a piece driven by it keeps one
 * pose and then jumps. When fps/stepFps is whole (24 -> 12) every hold is equal; otherwise the
 * clock stays true to `stepFps` and the holds are uneven (30 -> 12 holds 3,2,3,2: the same 3:2
 * cadence a 24 -> 30 pulldown has). The result never runs ahead of `frame`.
 */
export const stepFrame = (frame: number, fps: number, stepFps = 12): number => {
  if (stepFps >= fps) return frame;
  const pose = Math.floor((frame * stepFps) / fps + 1e-9);
  return Math.max(0, Math.ceil((pose * fps) / stepFps - 1e-9));
};
