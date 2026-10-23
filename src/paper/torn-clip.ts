import { random } from "remotion";

// Seeded 1-D value noise, smooth between lattice points. Same seed + x -> same value.
const noise = (seed: string, x: number): number => {
  const i = Math.floor(x);
  const f = x - i;
  const s = f * f * (3 - 2 * f);
  const a = random(`${seed}:${i}`) * 2 - 1;
  const b = random(`${seed}:${i + 1}`) * 2 - 1;
  return a + (b - a) * s;
};

const fbm = (seed: string, x: number, octaves: number): number => {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  let freq = 1;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(`${seed}:o${o}`, x * freq);
    norm += amp;
    amp /= 2;
    freq *= 2;
  }
  return sum / norm;
};

/** Torn-line field, -1..1 along u (0..1): 0.65 coarse (3 octaves) + 0.35 fine (2 octaves, x40). */
const edgeField = (seed: string, u: number): number =>
  0.65 * fbm(`${seed}:coarse`, u * 3, 3) + 0.35 * fbm(`${seed}:fine`, u * 40, 2);

const pt = (x: number, y: number) => {
  const c = (v: number) => Math.min(100, Math.max(0, v)).toFixed(2);
  return `${c(x)}% ${c(y)}%`;
};

/**
 * CSS `polygon()` for a sheet with a torn edge on all four sides. `amp` is the bite in % of the
 * side (points stray 0..2*amp inward), `teeth` the points along each long side (short sides get
 * half). Deterministic: same arguments, same string.
 */
export const tornClip = (seed: string, amp = 2.2, teeth = 26): string => {
  const bite = (side: string, u: number) => amp * (1 + edgeField(`${seed}:${side}`, u));
  const half = Math.max(2, Math.round(teeth / 2));
  const pts: string[] = [];
  for (let i = 0; i <= teeth; i++) pts.push(pt((i / teeth) * 100, bite("top", i / teeth)));
  for (let i = 1; i <= half; i++) pts.push(pt(100 - bite("right", i / half), (i / half) * 100));
  for (let i = 1; i <= teeth; i++) {
    const u = 1 - i / teeth;
    pts.push(pt(u * 100, 100 - bite("bottom", u)));
  }
  // the left side stops short of the start so the ring does not repeat its first point
  for (let i = 1; i < half; i++) {
    const u = 1 - i / half;
    pts.push(pt(bite("left", u), u * 100));
  }
  return `polygon(${pts.join(",")})`;
};

/**
 * Two clips for a sheet torn across, top and bottom half, sharing one ragged line at `at` % of
 * the height (`bite` = how far it strays, % of height). Plain edges elsewhere; give each half a
 * `tornClip` too if the outer edges should be torn.
 */
export const tornSplitClips = (
  seed: string,
  at = 50,
  bite = 3,
  teeth = 48,
): { top: string; bottom: string } => {
  const line: string[] = [];
  const reversed: string[] = [];
  for (let i = 0; i <= teeth; i++) {
    const u = i / teeth;
    const p = pt(u * 100, at + bite * edgeField(`${seed}:rip`, u));
    line.push(p);
    reversed.unshift(p);
  }
  return {
    top: `polygon(0% 0%,100% 0%,${reversed.join(",")})`,
    bottom: `polygon(${line.join(",")},100% 100%,0% 100%)`,
  };
};
