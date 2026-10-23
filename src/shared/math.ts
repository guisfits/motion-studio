/** Clamps `v` to the 0..1 range. */
export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
