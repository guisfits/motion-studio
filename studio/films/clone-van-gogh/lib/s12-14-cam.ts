// Camera of S12, read off the reference pictures (the tracker follows the revolving wall and reads ~1.03 total,
// the figure's height grows 53 % -> 62 % (f381) -> ~71 % (f396) -> ~75 % (f399) of the frame):
// scale about the world point (540, ANCHOR_Y), the point whose height barely changes while the figure grows.
export const S12_ANCHOR_Y = 1081;

const KEYS: [number, number][] = [
  [0, 1.03],
  [3, 1.11],
  [6, 1.2],
  [10, 1.27],
  [15, 1.34],
  [21, 1.42],
  [23, 1.5],
  [24, 1.58],
];

export const s12Scale = (f: number): number => {
  if (f <= KEYS[0][0]) return KEYS[0][1];
  for (let i = 1; i < KEYS.length; i++) {
    if (f <= KEYS[i][0]) {
      const [f0, s0] = KEYS[i - 1];
      const [f1, s1] = KEYS[i];
      return s0 * (s1 / s0) ** ((f - f0) / (f1 - f0));
    }
  }
  return KEYS[KEYS.length - 1][1];
};
