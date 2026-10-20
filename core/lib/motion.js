// Motion primitives for films rendered as a pure function of time.
// Everything here is closed-form: the value at t never depends on earlier frames, so
// seek(t) can paint frame 812 without simulating frames 0..811, in any order, identically
// on every run.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, p) => a + (b - a) * p;

// Linear 0→1 progress of t across [a, b]. For gating, not for visible motion (use springs).
export const progress = (t, a, b) => clamp((t - a) / (b - a));

// Stiffness/damping presets. Pick by what moves, not by taste per shot.
export const SPRINGS = {
  snappy: { k: 320, d: 30 }, // UI: buttons, toggles, leading edges. A hair of overshoot.
  default: { k: 170, d: 26 }, // cards, containers, camera. Settles without overshoot.
  heavy: { k: 120, d: 24 }, // big type, phone, logo lockups. Overdamped: never overshoots.
  playful: { k: 200, d: 12 }, // visible overshoot. Rarely right for a sober tone.
};

// Closed-form damped spring from 0 to 1, starting at t = 0 with zero velocity.
export function spring(t, k = SPRINGS.default.k, d = SPRINGS.default.d) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k);
  const z = d / (2 * w0);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return (
      1 -
      Math.exp(-z * w0 * t) *
        (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t))
    );
  }
  if (z === 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  const s = Math.sqrt(z * z - 1);
  const r1 = -w0 * (z - s);
  const r2 = -w0 * (z + s);
  return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
}

// When a spring first reaches `frac` of its way (default 95%): the moment a thing placed by it
// visibly lands (frac 0.5: the middle of a travel, where a whoosh should peak). Sounds sit there,
// not at the spring's start. The step is 1 ms, so it is exact to the frame; null when it never
// gets there within `max` seconds.
export function springReach(k, d, frac = 0.95, max = 8) {
  for (let t = 0.001; t <= max; t += 0.001) if (spring(t, k, d) >= frac) return t;
  return null;
}

// A reveal (a pen writing a line, a wipe) paced by a spring but finished on time: 0 before tIn,
// exactly 1 from tIn + dur on. The plain spring only approaches 1, so a revealed line would keep
// its last glyph cropped through the tail; here the spring is scaled so it reaches 1 at `dur`
// (default: when the spring has visibly arrived, 97%). Pure in t, monotone, no jump at the end.
export function revealProgress(t, tIn, { k = 40, d = 12.6, dur } = {}) {
  const span = dur ?? springReach(k, d, 0.97) ?? 1;
  const u = t - tIn;
  if (u <= 0) return 0;
  if (u >= span) return 1;
  return clamp(spring(u, k, d) / spring(span, k, d));
}

// A value that changes target several times: keys = [[time, value], ...] sorted by time.
// Each change adds its own spring from its own start time instead of restarting one spring,
// so motion stays continuous through retargets and is still a pure function of t.
export function track(t, keys, k, d) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++)
    v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
  return v;
}

// A tab/selection indicator that stretches while it travels: the leading edge rides a stiffer
// spring than the trailing edge. stops = [[time, x], ...]; width is the resting width.
export function indicator(t, stops, width) {
  const lead = track(t, stops, 320, 30);
  const trail = track(t, stops, 140, 22);
  return { left: Math.min(lead, trail), right: Math.max(lead, trail) + width };
}

// Opacity of content inside a morphing container: enters just after the morph starts at tIn,
// leaves just before the next morph at tOut, so old and new text never overlap.
export function swapAlpha(t, tIn, tOut) {
  return Math.min(
    clamp((t - tIn - 0.08) / 0.12),
    clamp((tOut - 0.1 - t) / 0.1),
  );
}

// Wrap t into [0, dur) for seamless loops (the last frame must equal the first).
export const loopT = (t, dur) => ((t % dur) + dur) % dur;

// Seeded PRNG (mulberry32). Never Math.random in a film: the render must repeat exactly.
export function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// Time held on a stop-motion grid: 12 fps is "on twos" at 24. Cut-out pieces moved on a
// stepped clock read as paper animated by hand, not as a smooth digital slide.
export const stepped = (t, fps = 12) => Math.floor(t * fps + 1e-6) / fps;

// When an eased move goes fastest: the time in [t0, t1] where curve(t) changes most per frame.
// A hard cut lands there (craft: "cut at peak velocity"), so the motion carries across the cut
// and keeps its direction. curve(t) returns a number or an object of numbers (a camera pose);
// an object's speed is the length of its change, so pass only the fields that matter, in the
// units that matter (a zoom-through passes Math.log(z): a zoom reads as change of scale ratio).
// Sampled every `step` s (default 1/240, a quarter of a 60 fps frame).
export function cutAtPeak(curve, t0, t1, step = 1 / 240) {
  const at = (t) => {
    const v = curve(t);
    return typeof v === "number" ? [v] : Object.values(v);
  };
  let best = t0;
  let top = -1;
  for (let t = t0; t <= t1 + 1e-9; t += step) {
    const a = at(t - step / 2);
    const b = at(t + step / 2);
    const speed = Math.hypot(...a.map((v, i) => b[i] - v));
    if (speed > top + 1e-12) (top = speed), (best = t);
  }
  return best;
}

// Seeded smooth value noise in 2-D, summed over `octaves` (fractal Brownian motion): about −1..1,
// the same for the same seed and point. For organic edges (a tear front, an ink blot's rim); a
// fixed field sampled at a moving point changes shape smoothly instead of re-rolling per frame.
// periodX: wrap x every periodX units (an edge that closes on itself, sampled by angle).
export function fbm(seed, { octaves = 4, periodX } = {}) {
  const r = rng(seed);
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const vals = Array.from({ length: 256 }, () => r() * 2 - 1);
  const wrap = (i, p) => (p ? ((i % p) + p) % p : i);
  const lattice = (ix, iy) => vals[perm[(perm[ix & 255] + iy) & 255]];
  const smooth = (u) => u * u * (3 - 2 * u);
  const noise = (x, y, p) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = smooth(x - ix);
    const fy = smooth(y - iy);
    const x0 = wrap(ix, p);
    const x1 = wrap(ix + 1, p);
    const a = lerp(lattice(x0, iy), lattice(x1, iy), fx);
    const b = lerp(lattice(x0, iy + 1), lattice(x1, iy + 1), fx);
    return lerp(a, b, fy);
  };
  return (x, y = 0) => {
    let sum = 0;
    let amp = 0.5;
    let f = 1;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += amp * noise(x * f, y * f, periodX ? periodX * f : undefined);
      norm += amp;
      amp *= 0.5;
      f *= 2;
    }
    return sum / norm;
  };
}
