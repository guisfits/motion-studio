import { bounce } from "../../../../src/physics";
import type { RigPose } from "../../../../src/rig";

// Gesture timeline for the S08/S13 puppets: a joint angle is a sum of spring steps, so every
// beat overshoots and rings out like a hand-animated arm. Pure in (frame, fps).

export type Beat = { at: number; to: number; hz?: number; damping?: number };

/** Angle of one joint: starts at `rest`, each beat is a damped-spring step to `to` from where the previous one ended. */
export function joint(frame: number, fps: number, rest: number, beats: Beat[]): number {
  let a = rest;
  let from = rest;
  for (const b of beats) {
    const k = bounce(frame - b.at, fps, { hz: b.hz ?? 2.4, damping: b.damping ?? 0.38 });
    a += (b.to - from) * k;
    from = b.to;
  }
  return a;
}

/** Slow idle sway: two incommensurate sines, amplitude in degrees. */
export const sway = (frame: number, fps: number, amp: number, hz: number, ph = 0) =>
  amp * (0.65 * Math.sin(2 * Math.PI * hz * (frame / fps) + ph) + 0.35 * Math.sin(2 * Math.PI * hz * 1.9 * (frame / fps) + ph * 2.3));

export type JointSpec = { rest: number; beats: Beat[] };
export const poseOf = (frame: number, fps: number, spec: Record<string, JointSpec>): RigPose =>
  Object.fromEntries(Object.entries(spec).map(([k, v]) => [k, joint(frame, fps, v.rest, v.beats)]));
