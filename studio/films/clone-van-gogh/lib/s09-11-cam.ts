// Measured camera of S09-S11 in the reference: per local frame the cumulative [scale, tx, ty] about the
// frame centre (translation in native px — motion-measure already reports native px; an earlier x2 'ref is 540 wide' factor was wrong), composed from motion-measure's per-frame steps
// (out/measure/ref/frames.csv). Local 0 is the identity. S11's table starts at its local 1 (f349 of the
// reference: the cut frame f348 is a different picture, so there is no step into it).
import { HEIGHT, WIDTH } from "../scene";

export type CamRow = [number, number, number];

export const CAM_S09: [number, number, number][] = [
  [1.0, 0.0, 0.0],
  [1.1286, 1.7, -0.0],
  [1.196, 2.6, 1.2],
  [1.2487, 2.8, 0.8],
  [1.2951, 2.8, 1.0],
  [1.3355, 3.5, 0.7],
  [1.3703, 3.6, -0.4],
  [1.4019, 5.7, 0.1],
  [1.4301, 6.2, 0.5],
  [1.4545, 6.4, 1.0],
  [1.478, 7.0, 0.7],
  [1.4975, 7.8, 0.1],
  [1.5169, 10.1, 0.8],
  [1.5306, 10.2, 1.1],
  [1.5438, 11.8, -0.2],
  [1.5474, 11.4, -1.8],
  [1.5522, 9.8, -8.9],
  [1.5544, 9.6, -21.1],
  [1.5545, 9.3, -38.1],
  [1.5564, 6.5, -60.3],
  [1.557, 6.2, -90.6],
  [1.5574, 6.6, -129.8],
  [1.5599, 8.1, -177.1],
  [1.5598, 8.1, -237.3],
  [1.5596, 8.1, -315.8],
  [1.5575, 8.8, -422.1],
  [1.5575, 9.0, -571.2],
  [1.5572, 9.6, -917.5],
];

export const CAM_S10: [number, number, number][] = [
  [1.0, 0.0, 0.0],
  [0.9889, -12.8, -121.8],
  [0.9836, -17.3, -175.6],
  [0.9736, -26.4, -212.2],
  [0.9705, -28.2, -239.6],
  [0.9671, -29.0, -258.8],
  [0.963, -28.6, -275.4],
  [0.9666, -29.7, -286.5],
  [0.965, -28.8, -297.0],
  [0.9582, -25.6, -303.1],
  [0.9553, -23.2, -308.6],
  [0.9461, -16.9, -305.6],
  [0.9427, -15.4, -305.4],
  [0.9322, -8.8, -293.8],
  [0.9274, -5.4, -289.2],
  [0.9287, -4.9, -290.6],
  [0.9274, -1.2, -290.6],
  [0.9346, 4.6, -295.9],
  [0.9362, 6.2, -298.8],
  [0.9426, 6.0, -300.4],
  [0.9435, 5.8, -300.9],
  [0.9555, -1.9, -301.4],
  [0.9557, -4.4, -301.1],
  [0.9555, -6.0, -298.4],
  [0.9542, -6.9, -296.6],
  [0.9624, -5.7, -296.9],
  [0.9634, -6.1, -296.1],
  [0.973, -7.5, -297.1],
  [0.9895, -8.0, -298.8],
  [0.9977, -8.2, -299.4],
  [1.0033, 0.5, -298.4],
];

export const CAM_S11: [number, number, number][] = [
  [1.0, 0.0, 0.0],
  [1.0439, 0.3, -0.6],
  [1.0781, 0.5, -0.1],
  [1.1056, 0.3, 0.8],
  [1.1307, 0.7, 0.8],
  [1.1518, 0.9, 0.1],
  [1.1695, 1.1, 0.1],
  [1.1856, 1.0, 0.0],
  [1.2002, 0.9, 0.1],
  [1.2131, 1.0, -0.3],
  [1.2228, 1.2, -0.5],
  [1.2323, 0.7, -0.1],
  [1.24, 0.7, -0.1],
  [1.2455, 1.1, 0.1],
  [1.2494, 1.2, 0.1],
  [1.253, 0.6, -0.1],
  [1.2552, 0.3, -0.2],
  [1.2577, 0.5, -0.1],
  [1.2605, 0.6, -0.1],
  [1.2637, 0.3, -0.6],
  [1.2684, 0.5, -0.6],
  [1.2751, 1.1, -0.2],
  [1.2857, 0.8, 0.1],
  [1.301, 0.4, 0.8],
  [1.3258, 0.8, 1.3],
  [1.3901, 0.7, 1.1],
];

/** Row at a (fractional) local frame, interpolated geometrically in scale and linearly in translation. */
export const camRow = (table: CamRow[], f: number): { s: number; tx: number; ty: number } => {
  const i = Math.max(0, Math.min(table.length - 1, Math.floor(f)));
  const j = Math.min(table.length - 1, i + 1);
  const u = Math.max(0, Math.min(1, f - i));
  const [s0, x0, y0] = table[i];
  const [s1, x1, y1] = table[j];
  return { s: s0 * (s1 / s0) ** u, tx: x0 + (x1 - x0) * u, ty: y0 + (y1 - y0) * u };
};

/** CSS transform of a plane at depth `d` (0..1 parallax: its scale exponent and its share of the translation). */
export const camTransform = (c: { s: number; tx: number; ty: number }, d = 1, shareT = d): string =>
  `translate(${WIDTH / 2 + c.tx * shareT}px, ${HEIGHT / 2 + c.ty * shareT}px) scale(${c.s ** d}) translate(${-WIDTH / 2}px, ${-HEIGHT / 2}px)`;
