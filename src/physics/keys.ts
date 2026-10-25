// Keyframe tables measured off a reference (`[[frame, value], ...]`, frames ascending) read as
// motion. Lesson of the lion clone (S10): a plain cubic overshoots between measured keys and a
// linear table kinks; a monotone cubic does neither.

export type Key = readonly [frame: number, value: number];

/**
 * Value at frame `f` along `ks`, a monotone cubic (Fritsch–Carlson): smooth velocity, never past
 * a neighbouring key, flat where two keys hold the same value. Clamped outside the table.
 */
export const monotoneKeys = (f: number, ks: readonly Key[]): number => {
  const n = ks.length;
  if (n === 1 || f <= ks[0][0]) return ks[0][1];
  if (f >= ks[n - 1][0]) return ks[n - 1][1];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((ks[i + 1][1] - ks[i][1]) / (ks[i + 1][0] - ks[i][0]));
  const m: number[] = [d[0]];
  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const h = Math.hypot(a, b);
    if (h > 3) {
      m[i] = (3 * a * d[i]) / h;
      m[i + 1] = (3 * b * d[i]) / h;
    }
  }
  let i = 0;
  while (f > ks[i + 1][0]) i++;
  const h = ks[i + 1][0] - ks[i][0];
  const t = (f - ks[i][0]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * ks[i][1] +
    (t3 - 2 * t2 + t) * h * m[i] +
    (-2 * t3 + 3 * t2) * ks[i + 1][1] +
    (t3 - t2) * h * m[i + 1]
  );
};

/** Straight linear interpolation along `ks` (gates: fades, wipes). Clamped outside the table. */
export const linearKeys = (f: number, ks: readonly Key[]): number => {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (f <= ks[i][0]) {
      return ks[i - 1][1] + ((ks[i][1] - ks[i - 1][1]) * (f - ks[i - 1][0])) / (ks[i][0] - ks[i - 1][0]);
    }
  }
  return ks[ks.length - 1][1];
};
