import { carryAt, type CarryOptions } from "./carry";
import { setDownTravel } from "./set-down-travel";

export type Side = "top" | "bottom" | "left" | "right";

export const DIR: Record<Side, [number, number]> = {
  top: [0, -1],
  bottom: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export type SetDownPoseOptions = Partial<Omit<CarryOptions, "delay">> & {
  delay: number;
  from?: Side;
  rotate?: number;
  margin?: number;
  size?: [number, number];
};

export type SetDownPose = {
  /** Offset from the resting position, px. */
  dx: number;
  dy: number;
  /** Total rotation in degrees (resting rotation plus the in-flight tilt). */
  rotate: number;
  /** 0..1: how high the sheet is held above the desk. */
  lift: number;
};

/**
 * Where a `SetDown` sheet is at `frame` of its sequence, relative to its resting position. The
 * component draws from this and a film's `traceAt` reads it, so the traced box follows the
 * entrance and not the rest pose.
 */
export const setDownPose = (
  frame: number,
  fps: number,
  width: number,
  height: number,
  { delay, from = "top", rotate = 0, margin = 0, size, dur, over, stepFps }: SetDownPoseOptions,
): SetDownPose => {
  const { remaining, lift } = carryAt(frame, fps, { delay, dur, over, stepFps });
  const [dx, dy] = DIR[from];
  const travel = setDownTravel(from, width, height, { size, margin });
  const tilt = Math.max(0, remaining) * 5 * (dx !== 0 ? dx : 1);
  return { dx: dx * remaining * travel, dy: dy * remaining * travel, rotate: rotate + tilt, lift };
};
