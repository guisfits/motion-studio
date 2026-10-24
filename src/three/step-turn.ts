import { stepFrame } from "../paper";

/** The leaf turn of a book: a value, or a function of the frame (needed to step it). */
export type TurnInput = number | ((frame: number) => number);

/**
 * The extra leaf turn (0..1) at `frame`. With `stepFps` (the old engine's page turn was 8) a
 * function `turn` is read at the start frame of the current pose, so the leaf holds and jumps;
 * a plain number cannot be re-read at an earlier time and is returned as is.
 */
export const turnAt = (turn: TurnInput, frame: number, fps: number, stepFps?: number): number => {
  if (typeof turn === "number") return turn;
  return turn(stepFps === undefined ? frame : stepFrame(frame, fps, stepFps));
};
