import { random } from "remotion";
import { stepFrame } from "./step";

export type Wiggle = { x: number; y: number; rotate: number };

/**
 * Seeded paper "boil": a new offset every pose of the stepped clock, held in between.
 * `amp` bounds x and y in px and rotate in degrees (so amp 2 = +-2 px, +-2 deg at most; callers
 * scale rotate down, the demos use 0.25). Pure in (seed, frame): a seek lands on the same pose.
 */
export const wiggle = (
  seed: string,
  frame: number,
  fps: number,
  amp: number,
  stepFps = 12,
): Wiggle => {
  if (amp === 0) return { x: 0, y: 0, rotate: 0 };
  const pose = stepFrame(frame, fps, stepFps);
  const at = (axis: string) => (random(`${seed}:${axis}:${pose}`) * 2 - 1) * amp;
  return { x: at("x"), y: at("y"), rotate: at("r") };
};
