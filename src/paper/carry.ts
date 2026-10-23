import { stepFrame } from "./step";
import { clamp01 } from "../shared/math";

export type CarryOptions = {
  /** Seconds before the piece starts travelling. */
  delay: number;
  /** Travel time in seconds, ease-out cubic. Baseline 0.55. */
  dur?: number;
  /** Overshoot as a fraction of the travel, damped `exp(-14s)*sin(24s)`. Baseline 0.04. */
  over?: number;
  /** Poses per second of the stepped clock; at or above fps = every frame. */
  stepFps?: number;
};

export type Carry = {
  /**
   * Distance still to go as a fraction of the travel: 1 = off-frame start, 0 = landed,
   * negative = overshooting past the target.
   */
  remaining: number;
  /** 0..1: how high the sheet is held above the desk (drives the shadow). */
  lift: number;
};


/** Paper set-down curve ported from the engine's `carryIn`. Pure in the frame. */
export const carryAt = (
  frame: number,
  fps: number,
  { delay, dur = 0.55, over = 0.04, stepFps = 12 }: CarryOptions,
): Carry => {
  const t = stepFrame(frame, fps, stepFps) / fps;
  const s = (t - delay) / dur;
  if (s <= 0) return { remaining: 1, lift: 0 };
  if (s < 1) {
    const eased = 1 - (1 - s) ** 3;
    return { remaining: 1 - eased, lift: clamp01(s * 5) * (1 - eased) };
  }
  const since = t - (delay + dur);
  return { remaining: -over * Math.exp(-14 * since) * Math.sin(24 * since), lift: 0 };
};
