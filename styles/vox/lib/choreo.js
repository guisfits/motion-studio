// The choreography of paper on the table, as pure maths. A clipping carries a list of moves
// ({ kind, at, ...params }); pose(moves, t) sums what every move does to it at t, so a piece can
// be slapped down, dragged by its neighbour, folded and peeled off, all from t alone (render
// contract: seek any frame in any order). paper.js turns a pose into an element.
//
// Pose fields: visible · dx, dy (px from the rest spot) · rot (deg) · scale · lift (height off
// the table: 1 = in the hand, 0 = flat, < 0 = pressed in by an overshoot) · dz (stacking order
// change) · curl (corner peel 0..1) · fold (0..1 along the fold axis) · flip (0..1, turned over at
// 1) · crumple (0..1, a ball at 1).

import {
  spring,
  springReach,
  stepped,
  rng,
  clamp,
} from "../../../core/lib/motion.js";

// The hand: a slap overshoots (paper pressed down, then it relaxes); slides glide in.
const SLAP = { k: 260, d: 14 };
const SLIDE = { k: 70, d: 15 };
const SOFT = { k: 120, d: 18 };
const FAST = { k: 320, d: 30 };
const HAND_FPS = 12;

const hand = (t, at, sp) => spring(stepped(t - at, HAND_FPS), sp.k, sp.d);
const smooth = (t, at, sp) => spring(t - at, sp.k, sp.d);
const reach = (at, sp, fps = 0) => {
  const r = springReach(sp.k, sp.d);
  return at + (fps ? Math.ceil(r * fps - 1e-9) / fps : r);
};

// Each move: (t, m) → partial pose; land(m) → its contact cue (or null).
export const MOVES = {
  slap: {
    pose: (t, m) => {
      if (t < m.at) return { visible: false };
      const e = hand(t, m.at, SLAP);
      const turn = m.turn ?? 6;
      return {
        lift: 1 - e,
        rot: turn * (1 - e),
        scale: 0.18 * Math.max(0, 1 - e),
      };
    },
    land: (m) => ({ t: reach(m.at, SLAP, HAND_FPS), type: "paper-place" }),
  },
  slide: {
    pose: (t, m) => {
      if (t < m.at) return { visible: false };
      const e = smooth(t, m.at, SLIDE);
      const [fx, fy] = m.from ?? [0, 900];
      return {
        dx: fx * (1 - e),
        dy: fy * (1 - e),
        rot: (fx > 0 ? 7 : -7) * (1 - e),
        lift: 0.15 * (1 - e),
      };
    },
    land: (m) => ({ t: reach(m.at, SLIDE), type: "paper-slide" }),
  },
  // Out to the side on top, then back in under the piece at z = under.
  slideUnder: {
    pose: (t, m) => {
      if (t < m.at) return { visible: false };
      const e = smooth(t, m.at, SLIDE);
      const [fx, fy] = m.from ?? [600, 0];
      return {
        dx: fx * (1 - e),
        dy: fy * (1 - e),
        dz: e > 0.5 ? -(m.under + 1) : 0,
      };
    },
    land: (m) => ({ t: reach(m.at, SLIDE), type: "paper-slide", gain: 0.7 }),
  },
  // Pushed by a neighbour: it ends `by` away from where it was.
  drag: {
    pose: (t, m) => {
      const e = t < m.at ? 0 : smooth(t, m.at, SOFT);
      const [bx, by] = m.by;
      return { dx: bx * e, dy: by * e, rot: (m.turn ?? 3) * e };
    },
    land: (m) => ({ t: m.at, type: "paper-slide", gain: 0.5 }),
  },
  // A corner curls up (curl 0 → 1 over ~0.4 s), then the piece is lifted off.
  peel: {
    pose: (t, m) => {
      if (t < m.at) return {};
      const c = smooth(t, m.at, FAST);
      const off = smooth(t, m.at + 0.45, SOFT);
      return { curl: c, lift: off, dy: -400 * off, visible: off < 0.98 };
    },
    land: (m) => ({ t: m.at, type: "sticker-peel" }),
  },
  flip: {
    pose: (t, m) => ({ flip: t < m.at ? 0 : hand(t, m.at, SOFT) }),
    land: (m) => ({ t: m.at, type: "flip" }),
  },
  // A fold to `to` (0..1); a later fold to 0 unfolds. The latest started fold wins (see pose()).
  fold: {
    pose: (t, m) =>
      t < m.at
        ? {}
        : {
            fold: {
              from: m.fromFold ?? 0,
              to: m.to ?? 0.5,
              e: hand(t, m.at, SOFT),
              at: m.at,
            },
          },
    land: (m) => ({ t: m.at, type: "fold" }),
  },
  crumple: {
    pose: (t, m) => {
      if (t < m.at) return {};
      const c = hand(t, m.at, FAST);
      const th = smooth(t, m.at + 0.5, SOFT);
      const [tx, ty] = m.throwTo ?? [1400, -600];
      return {
        crumple: c,
        dx: tx * th,
        dy: ty * th,
        rot: 160 * th,
        visible: th < 0.98,
      };
    },
    land: (m) => ({ t: m.at, type: "crumple" }),
  },
  lift: {
    pose: (t, m) => {
      if (t < m.at) return {};
      const e = smooth(t, m.at, FAST);
      return {
        lift: e,
        dy: -(m.dist ?? 500) * e,
        rot: -4 * e,
        visible: e < 0.98,
      };
    },
    land: (m) => ({ t: m.at, type: "paper-slide" }),
  },
};

// Folds chain in `at` order: each one starts where the fold before it stands at its `at`, so an
// unfold continues from the current fold instead of snapping. `fromFold` overrides the chain.
function resolveFolds(moves) {
  const starts = new Map();
  let last = null;
  const folds = moves
    .filter((m) => m.kind === "fold")
    .sort((a, b) => a.at - b.at);
  for (const m of folds) {
    const from =
      m.fromFold ??
      (last ? last.from + (last.to - last.from) * hand(m.at, last.at, SOFT) : 0);
    starts.set(m, from);
    last = { from, to: m.to ?? 0.5, at: m.at };
  }
  return starts;
}

// Sums every move's partial pose at t. Moves may come in any order: the effects add up, and the
// fold is the one started latest (by `at`), so the result is a pure function of (moves, t).
export function pose(moves, t) {
  const starts = resolveFolds(moves);
  const p = {
    visible: true,
    dx: 0,
    dy: 0,
    rot: 0,
    scale: 1,
    lift: 0,
    dz: 0,
    curl: 0,
    fold: 0,
    flip: 0,
    crumple: 0,
  };
  let fold = null;
  for (const m of moves) {
    const mv = MOVES[m.kind];
    if (!mv) throw new Error(`choreo: unknown move "${m.kind}"`);
    const q = mv.pose(t, m.kind === "fold" ? { ...m, fromFold: starts.get(m) } : m);
    if (q.visible === false) p.visible = false;
    p.dx += q.dx ?? 0;
    p.dy += q.dy ?? 0;
    p.rot += q.rot ?? 0;
    p.scale += q.scale ?? 0;
    p.lift += q.lift ?? 0;
    p.dz += q.dz ?? 0;
    p.curl = Math.max(p.curl, q.curl ?? 0);
    p.flip = Math.max(p.flip, q.flip ?? 0);
    p.crumple = Math.max(p.crumple, q.crumple ?? 0);
    if (q.fold && (!fold || q.fold.at >= fold.at)) fold = q.fold;
  }
  if (fold) p.fold = clamp(fold.from + (fold.to - fold.from) * fold.e, 0, 1);
  return p;
}

// Contact cues, time-sorted; hits within 80 ms merge into one, louder (a pile landing at once).
export function contacts(moves) {
  const raw = moves
    .map((m) => ({ gain: 1, ...MOVES[m.kind].land(m) }))
    .sort((a, b) => a.t - b.t);
  const out = [];
  for (const c of raw) {
    const prev = out[out.length - 1];
    if (prev && prev.type === c.type && c.t - prev.t < 0.08)
      prev.gain = Math.min(2, prev.gain + 0.35 * c.gain);
    else out.push({ ...c });
  }
  return out;
}

// Rest spots for n clippings dropped as a pile: seeded jitter, each one on top of the last.
export function pile(n, { x, y, spread = 60, seed = 1, z0 = 0 }) {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => ({
    x: x + (r() * 2 - 1) * spread,
    y: y + (r() * 2 - 1) * spread,
    rot: (r() * 2 - 1) * 12,
    z: z0 + i,
  }));
}

// Which of `drawings` hand-redrawn edges shows at t (the "boil" of paper animated on twos).
export const boilStep = (t, fps = HAND_FPS, drawings = 3) => {
  const n = Math.floor(t * fps + 1e-6);
  return ((n % drawings) + drawings) % drawings;
};
