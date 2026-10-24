import { random } from "remotion";

const TURNS = 1.07;
const SAMPLES = 72;

/**
 * Hand-drawn ellipse around a unit box, as a path in a 0..100 viewBox, drawn `progress` (0..1) of
 * the way round. The pen starts at the upper left, goes round once and overshoots past its start;
 * radii drift slowly and the end sits a little outside the start (seeded). The path is cut by
 * geometry (the polyline stops at the pen), never by a dash, so `non-scaling-stroke` is safe.
 * Empty before the pen touches down.
 */
export const circleMarkPath = (seed: string, progress: number): string => {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= 0) return "";
  const j = (k: string, amp: number) => (random(`${seed}-${k}`) - 0.5) * 2 * amp;
  const tilt = j("tilt", 0.07);
  const a0 = -Math.PI * 0.82 + j("a0", 0.2);
  const rx = 46 + j("rx", 2);
  const ry = 46 + j("ry", 2);
  const grow = 5 + j("grow", 1.5);
  const n = Math.max(2, Math.ceil(SAMPLES * p) + 1);
  const pts: string[] = [];
  const phase = j("w", 3);
  for (let i = 0; i < n; i++) {
    const u = Math.min(i / SAMPLES, p);
    const th = a0 + u * TURNS * Math.PI * 2;
    const wob = 1 + Math.sin(u * 9 + phase) * 0.018;
    const spread = wob + (u * grow) / 100;
    const x = 50 + rx * spread * Math.cos(th + tilt);
    const y = 50 + ry * spread * Math.sin(th);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(" ");
};

export type MarkBox = { x: number; y: number; w: number; h: number };

/** The box the mark occupies when drawn around `box` with `pad` (fraction of each side) margin. */
export const circleMarkBox = (box: MarkBox, pad = 0.18): MarkBox => ({
  x: box.x - box.w * pad,
  y: box.y - box.h * pad,
  w: box.w * (1 + 2 * pad),
  h: box.h * (1 + 2 * pad),
});
