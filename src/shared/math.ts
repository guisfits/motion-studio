import { interpolate } from "remotion";

/** Clamps `v` to the 0..1 range. */
export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/**
 * 0..1 progress of `t` across `[from, from + len]`, held at both ends, optionally eased. A `len`
 * of 0 or less is a step at `from` (Remotion's `interpolate` throws on an empty range, which an
 * empty timeline or a zero stagger would otherwise hit).
 */
export const ramp01 = (t: number, from: number, len: number, easing?: (t: number) => number): number =>
  len > 0
    ? interpolate(t, [from, from + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing })
    : t >= from
      ? 1
      : 0;
