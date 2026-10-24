import { random } from "remotion";

// Closed-form object physics for collage motion: every function is pure in (frame, fps, seed), so
// any frame renders alone and a film's trace can call the same maths. Times are in seconds through
// `fps`, so a 16 fps clone and a 30 fps film move alike.

export type PiecePose = { x: number; y: number; rotate: number; scale: number };
export type Offset = { x: number; y: number; rotate: number };

/**
 * Damped-spring step response 0 -> 1 (After Effects "inertial bounce" as a closed form).
 * `hz` = natural frequency, `damping` = ratio (<1 overshoots: 0.35 ~ 30 % over, 0.6 ~ 10 %; 1 = fastest with
 * no overshoot; >1 creeps in slower).
 */
export function bounce(frame: number, fps: number, { hz = 2.2, damping = 0.35 }: { hz?: number; damping?: number } = {}): number {
  if (frame <= 0) return 0;
  const t = frame / fps;
  const w = 2 * Math.PI * hz;
  // Critical (and a hair over, where the overdamped form below cancels badly): fastest without overshoot.
  if (damping >= 1 && damping < 1 + 1e-4) return 1 - Math.exp(-w * t) * (1 + w * t);
  if (damping > 1) {
    // Overdamped: two real decay rates, slower than critical the higher the damping.
    const r = Math.sqrt(damping * damping - 1);
    const s1 = -w * (damping - r);
    const s2 = -w * (damping + r);
    return 1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1);
  }
  const wd = w * Math.sqrt(1 - damping * damping);
  return 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + ((damping * w) / wd) * Math.sin(wd * t));
}

// Natural frequency at which `bounce` FIRST reaches `target` (< 1) after `seconds`. The response
// depends on hz * t only, so this finds the first crossing u of the 1 Hz response and returns
// u / seconds. Before its first peak the response rises monotonically, so bisect on [0, peak]:
// an underdamped spring peaks (above 1) at t = 1 / (2 sqrt(1 - damping^2)) for 1 Hz; bisecting on
// hz directly could land on a later crossing, when a low damping rings back below the target.
function hzReaching(target: number, seconds: number, damping: number): number {
  const at = (u: number) => bounce(u, 1, { hz: 1, damping });
  let lo = 0;
  let hi = damping < 1 ? 1 / (2 * Math.sqrt(1 - damping * damping)) : 1;
  while (at(hi) < target) hi *= 2; // overdamped/critical: monotone, widen until bracketed
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (at(mid) >= target) hi = mid;
    else lo = mid;
  }
  return hi / Math.max(seconds, 1e-6);
}

export type ThrowIn = {
  from: PiecePose;
  to: PiecePose;
  /** Frames until the piece is ~95 % of the way (the throw itself); the settle rings on after. */
  frames?: number;
  /** Peak height of the flight arc in px (upward), 0 = straight. */
  arc?: number;
  /** Spring damping of the landing: lower = more wobble. */
  damping?: number;
};

/** A piece thrown onto the set: fast arc, lands, its rotation and scale wobble and settle. */
export function throwIn(frame: number, fps: number, { from, to, frames = 4, arc = 0, damping = 0.45 }: ThrowIn): PiecePose {
  if (frame <= 0) return { ...from };
  const hz = hzReaching(0.95, frames / fps, damping);
  const p = bounce(frame, fps, { hz, damping });
  const r = bounce(frame, fps, { hz: hz * 0.8, damping: damping * 0.8 }); // rotation lags and wobbles a little more
  const flight = Math.min(1, Math.max(0, p));
  return {
    x: from.x + (to.x - from.x) * p,
    y: from.y + (to.y - from.y) * p - arc * 4 * flight * (1 - flight),
    rotate: from.rotate + (to.rotate - from.rotate) * r,
    scale: from.scale + (to.scale - from.scale) * p,
  };
}

export type Flutter = {
  x: number;
  y: number;
  /** Fall speed, px per second. */
  fall: number;
  /** Side-to-side sway amplitude, px. */
  sway: number;
  swayHz: number;
  /** Mean spin, degrees per second (sign from the seed). */
  spin: number;
};

/** A falling leaf or scrap of paper: falls, sways, spins, and tumbles in depth (`flip` = rotateY deg). */
export function flutter(frame: number, fps: number, seed: string, o: Flutter): Offset & { flip: number } {
  const t = frame / fps;
  const ph = random(`${seed}:ph`) * Math.PI * 2;
  const dir = random(`${seed}:dir`) < 0.5 ? -1 : 1;
  const w = 2 * Math.PI * o.swayHz;
  return {
    x: o.x + o.sway * Math.sin(w * t + ph),
    y: o.y + o.fall * t,
    // the leaf leans into its swing, plus its slow spin
    rotate: dir * o.spin * t + 25 * Math.cos(w * t + ph),
    flip: (180 * o.swayHz * 1.3 * t + random(`${seed}:flip`) * 360) % 360,
  };
}

/** Slow floating drift (clocks, frames, ornaments): two incommensurate sines, never above `amp`. */
export function drift(frame: number, fps: number, seed: string, { amp, hz }: { amp: number; hz: number }): Offset {
  const t = frame / fps;
  const s = (axis: string, k: number) =>
    0.6 * Math.sin(2 * Math.PI * hz * k * t + random(`${seed}:${axis}:a`) * 6.283) +
    0.4 * Math.sin(2 * Math.PI * hz * 1.7 * k * t + random(`${seed}:${axis}:b`) * 6.283);
  return { x: amp * s("x", 1), y: amp * s("y", 0.83), rotate: amp * 0.1 * s("r", 0.61) };
}

/** Camera/object shake from an impact at `at`: strongest on the hit, decaying exponentially. */
export function impactShake(
  frame: number,
  fps: number,
  seed: string,
  { at, amp, hz = 9, decay = 6 }: { at: number; amp: number; hz?: number; decay?: number },
): Offset {
  if (frame < at) return { x: 0, y: 0, rotate: 0 };
  const t = (frame - at) / fps;
  const env = amp * Math.exp(-decay * t);
  const a = 2 * Math.PI * hz * t + random(`${seed}:ph`) * 6.283;
  return { x: env * Math.cos(a), y: env * Math.sin(a), rotate: env * 0.05 * Math.sin(a * 1.3) };
}

export type Hover = {
  from: PiecePose;
  to: PiecePose;
  /** Frames the carry takes; the piece is exactly on `to` from this frame on (drift then fades in). Default 24. */
  frames?: number;
  /** Drift amplitude in px once arrived (rotation drifts by amp * 0.1 deg, as in `drift`). Default 4. */
  amp?: number;
  /** Drift speed in Hz. Default 0.45. */
  hz?: number;
  /** Seconds the drift takes to fade in after arrival, so the float starts at rest. Default 0.5. */
  settle?: number;
};

// Quintic smootherstep 0 -> 1: zero speed at both ends, monotone, never past 1.
const glide = (u: number): number => {
  const c = Math.min(1, Math.max(0, u));
  return c * c * c * (c * (c * 6 - 15) + 10);
};

/**
 * A piece carried slowly to a target and left floating there: it glides in (starts and ends at rest,
 * never overshoots, unlike `throwIn`'s landing wobble), then drifts around the target within `amp`.
 * The drift is `drift`'s seeded float, faded in over `settle` so the piece does not jump on arrival.
 */
export function hover(frame: number, fps: number, seed: string, { from, to, frames = 24, amp = 4, hz = 0.45, settle = 0.5 }: Hover): PiecePose {
  const k = glide(frame / Math.max(1, frames));
  const float = glide((frame - frames) / Math.max(1, settle * fps));
  const d = float > 0 ? drift(frame, fps, seed, { amp, hz }) : { x: 0, y: 0, rotate: 0 };
  return {
    x: from.x + (to.x - from.x) * k + d.x * float,
    y: from.y + (to.y - from.y) * k + d.y * float,
    rotate: from.rotate + (to.rotate - from.rotate) * k + d.rotate * float,
    scale: from.scale + (to.scale - from.scale) * k,
  };
}
