import { Easing, interpolate } from "remotion";

export type HandwriteSpec = {
  fps: number;
  /** Seconds the pen touches down. */
  startS: number;
  /** Seconds the whole text takes to write. */
  durS: number;
  lines: number;
  /** Poses per second (12 reads as twos at 24 fps); omit for every frame. */
  stepFps?: number;
};

const inOut = Easing.inOut(Easing.sin);

/**
 * Write-on progress of line `index` (0..1): the lines are written one after the other, each with the
 * pen easing in and out like a hand, so a short line is quick and a long one slow.
 */
export const handwriteProgress = (frame: number, index: number, { fps, startS, durS, lines, stepFps }: HandwriteSpec): number => {
  const f = stepFps ? Math.floor((frame / fps) * stepFps) * (fps / stepFps) : frame;
  const t = f / fps - startS;
  const slice = durS / lines;
  return interpolate(t, [index * slice, (index + 1) * slice], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: inOut,
  });
};

/**
 * CSS gradient mask that shows the first `p` of a line: solid up to the pen, a soft `feather` edge
 * (CSS length) behind which the ink is still wet. Hidden at 0, exactly whole at 1.
 */
export const handwriteMask = (p: number, feather = "0.35em"): string =>
  `linear-gradient(90deg, #000 calc(${p} * (100% + ${feather}) - ${feather}), transparent calc(${p} * (100% + ${feather})))`;
