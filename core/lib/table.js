// The infinite table: a film is shot on a surface far bigger than the frame.
// Surfaces (wood, paper, photographs, collage) lie on it; pieces are placed on it; the camera
// never stops: it travels to where the next object is (that IS the transition), zooms, turns a
// little, and breathes while it holds.
//
//   const table = makeTable(stage);
//   table.surface({ x: 0, y: 0, w: 2400, h: 3000, src: "assets/wood.jpg" });
//   const [figure] = table.add(() => [K.piece(stage, { img, w: 540, x: 600, y: 900, tIn: 1 })]);
//   table.camera([[0, { x: 540, y: 960, z: 1 }], [T.next, { x: 2200, y: 1300, z: 1.2, r: -3 }]]);
//   stage.run((t) => { table.draw(t); ... });     // draws the camera and everything added to it
//
// World coordinates are pixels on the table; the frame is 1080×1920 of it at zoom 1.

import { track, rng, spring, springReach, progress, clamp } from "./motion.js";
import { theme } from "./theme.js";
const C = () => theme().colors;

// A cinematic glide: slower and softer than the UI springs, settles in ~1.2 s.
export const GLIDE = { k: 48, d: 13 };
// Camera move styles (a locked-off camera reads dead on social video): a key may
// carry `ease`. move = a confident travel (~0.7 s), whip = a whip pan that lands hard (~0.35 s,
// render with --sub 8 so it blurs), glide = slow drift.
export const EASE = { glide: GLIDE, move: { k: 95, d: 17 }, whip: { k: 260, d: 30 } };
// Sound of the camera: moves under WHOOSH_MIN px of travel (world px at zoom 1, plus
// 900 per unit of zoom and 14 per degree of roll) are silent; over SWISH_MIN is a whip; keys closer
// than WHOOSH_TRAVEL seconds are one travel and share one whoosh.
export const WHOOSH_MIN = 500;
export const SWISH_MIN = 1400;
export const WHOOSH_TRAVEL = 1.2;

// Motion blur (without it, whips ghost as stacked copies). The camera's screen-space velocity
// is measured over one 60 fps frame; above BLUR_FLOOR px/frame the world is smeared along the
// travel by an SVG Gaussian whose long axis is turned to the direction of motion. Zero when slow.
export const BLUR_FLOOR = 4; // px per frame below which nothing blurs (the handheld drift is ~1)
export const BLUR_GAIN = 0.35; // stdDeviation per px/frame above the floor (≈ a 180° shutter)
export const BLUR_MAX = 90; // px: a whip never melts the frame into a wash
const FRAME = 1 / 60;

// The smear for a camera velocity (pure; exported for tests): { sx, sy, angle } where sx runs
// along the travel and sy across it (rotation and zoom add a little in both).
export function blurFor(v, gain = 1) {
  const along = Math.hypot(v.vx, v.vy);
  const spin = v.spin ?? 0; // px/frame at a typical radius, from roll and zoom
  const s = (px) => Math.min(BLUR_MAX, Math.max(0, px - BLUR_FLOOR) * BLUR_GAIN * gain);
  return { sx: s(along + spin), sy: s(spin * 0.6), angle: (Math.atan2(v.vy, v.vx) * 180) / Math.PI };
}

export function makeTable(stage, { breathe = 1, blur = 1 } = {}) {
  const { W, H } = stage;
  const view = document.createElement("div");
  Object.assign(view.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${W}px`,
    height: `${H}px`,
    overflow: "hidden",
  });
  const world = document.createElement("div");
  Object.assign(world.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: "0",
    height: "0",
    transformOrigin: "0 0",
  });
  // The blur rig: `smear` is turned to the travel direction and carries the filter (CSS filters
  // work in the element's own frame, so its local x IS the direction of motion); `upright`
  // turns back, so the world itself is never rotated by it.
  const smear = document.createElement("div");
  const upright = document.createElement("div");
  for (const el of [smear, upright])
    Object.assign(el.style, { position: "absolute", left: "0", top: "0", width: `${W}px`, height: `${H}px`, transformOrigin: "50% 50%" });
  const fid = `tableBlur${(stage.__tables = (stage.__tables ?? 0) + 1)}`;
  const fsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  Object.assign(fsvg.style, { position: "absolute", width: "0", height: "0" });
  // The region is big enough that the turned rig still covers every corner of the frame.
  fsvg.innerHTML = `<filter id="${fid}" x="-80%" y="-80%" width="260%" height="260%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0" edgeMode="none"/></filter>`;
  const gauss = fsvg.querySelector("feGaussianBlur");
  upright.append(world);
  smear.append(upright);
  view.append(fsvg, smear);
  stage.dom.append(view);
  const parts = [];
  let keys = [[0, { x: W / 2, y: H / 2, z: 1, r: 0 }]];

  const at = (t) => {
    // Each key brings its own spring (its `ease`), so one move can whip and the next glide.
    const ax = (k) => {
      let v = keys[0][1][k] ?? (k === "z" ? 1 : 0);
      let prev = v;
      for (let i = 1; i < keys.length; i++) {
        const [tt, key] = keys[i];
        const next = key[k] ?? prev;
        const e = EASE[key.ease ?? "move"] ?? EASE.move;
        v += (next - prev) * spring(t - tt, e.k, e.d);
        prev = next;
      }
      return v;
    };
    const x = ax("x");
    const y = ax("y");
    const z = ax("z");
    const r = ax("r");
    // Never a dead camera: a slow handheld drift and a creeping push while it holds.
    const b = breathe;
    return {
      x: x + b * (14 * Math.sin(t * 0.45) + 6 * Math.sin(t * 1.1 + 1)),
      y: y + b * (10 * Math.cos(t * 0.38) + 5 * Math.sin(t * 0.9)),
      z: z * (1 + b * 0.012 * Math.sin(t * 0.3)),
      r: r + b * 0.35 * Math.sin(t * 0.27),
    };
  };

  const velocity = (t) => {
    const a = at(t);
    const b = at(t - FRAME);
    // Where the world point now at the centre was on screen one frame ago.
    const rad = (-b.r * Math.PI) / 180;
    const dx = (a.x - b.x) * b.z;
    const dy = (a.y - b.y) * b.z;
    const sx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const sy = dx * Math.sin(rad) + dy * Math.cos(rad);
    const spin = 600 * (Math.abs(((a.r - b.r) * Math.PI) / 180) + Math.abs(a.z - b.z) / a.z);
    // The content moves opposite to the camera.
    return { vx: -sx, vy: -sy, spin };
  };
  const blurAt = (t) => blurFor(velocity(t), blur);

  return {
    view,
    world,
    // Build components in world space: everything fn() creates lands on the table.
    add(fn) {
      const saved = stage.dom;
      stage.dom = world;
      try {
        const made = [fn()].flat();
        parts.push(...made);
        return made;
      } finally {
        stage.dom = saved;
      }
    },
    // A station: a place on the table, turned by `rot` degrees, where a beat happens. Things
    // added through it use its local coordinates (0,0 = the station's corner); point the camera
    // at station.view(...) and the station reads upright, so travelling between stations at
    // different angles makes the camera turn (90°, 180°, 40°…).
    station({ x, y, rot = 0 }) {
      const g = document.createElement("div");
      Object.assign(g.style, { position: "absolute", left: `${x}px`, top: `${y}px`, width: "0", height: "0", transformOrigin: "0 0", transform: `rotate(${rot}deg)` });
      world.append(g);
      const rad = (rot * Math.PI) / 180;
      const toWorld = (lx, ly) => ({ x: x + lx * Math.cos(rad) - ly * Math.sin(rad), y: y + lx * Math.sin(rad) + ly * Math.cos(rad) });
      return {
        el: g,
        add(fn) {
          const saved = stage.dom;
          stage.dom = g;
          try {
            const made = [fn()].flat();
            parts.push(...made);
            return made;
          } finally {
            stage.dom = saved;
          }
        },
        surface(o) {
          const el = this.add(() => {
            const d = document.createElement("div");
            Object.assign(d.style, {
              position: "absolute", left: `${o.x}px`, top: `${o.y}px`, width: `${o.w}px`, height: `${o.h}px`,
              background: o.src ? `${o.color ?? C().ground} url(${o.src}) center/cover` : o.color ?? C().ground,
              transform: `rotate(${o.rot ?? 0}deg)`, filter: o.filter ?? "", boxShadow: "0 12px 34px -10px rgba(20,12,4,.5)",
            });
            g.append(d);
            return [];
          });
          return el;
        },
        // A camera key looking at local (lx, ly) of this station, upright.
        view(lx, ly, { z = 1, roll = 0, ease } = {}) {
          const w = toWorld(lx, ly);
          return { x: w.x, y: w.y, z, r: rot + roll, ...(ease ? { ease } : {}) };
        },
        toWorld,
      };
    },
    // A surface region lying on the table (wood, paper, a photograph, a painting).
    surface({
      x,
      y,
      w,
      h,
      src,
      color = C().ground,
      rot = 0,
      filter = "",
      shadow = true,
    }) {
      const el = document.createElement("div");
      Object.assign(el.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
        background: src ? `${color} url(${src}) center/cover` : color,
        transform: `rotate(${rot}deg)`,
        filter,
        boxShadow: shadow ? "0 10px 30px -10px rgba(20,12,4,.45)" : "none",
      });
      world.append(el);
      return el;
    },
    // Camera keys: [[t, { x, y, z, r }], ...] — the world point at the frame's centre, the zoom,
    // the roll in degrees. Missing fields keep the first key's value.
    camera(k) {
      keys = k;
    },
    // Where the camera is at t (for screen-space overlays that must track the table).
    at,
    // Screen-space velocity of the world over the frame before t (px per 60 fps frame): vx, vy
    // = how the content under the frame's centre moved; spin = roll and zoom, as px at 600 px.
    velocity,
    // The smear applied at t ({ sx, sy, angle }, zero when slow).
    blurAt,
    // One whoosh per real camera travel (SFX auto cues), none for a small move. It sounds when the
    // travel is half done (the spring's 50% point, where the picture moves fastest), not when the
    // key starts it; keys that follow one another inside WHOOSH_TRAVEL are one travel and keep the
    // longest. A travel over SWISH_MIN is a whip: the faster swish recordings.
    cues() {
      const moves = [];
      for (let i = 1; i < keys.length; i++) {
        const [t, v] = keys[i];
        const p = keys[i - 1][1];
        const e = EASE[v.ease ?? "move"] ?? EASE.move;
        const d =
          Math.hypot((v.x ?? p.x) - p.x, (v.y ?? p.y) - p.y) +
          900 * Math.abs((v.z ?? p.z ?? 1) - (p.z ?? 1)) +
          14 * Math.abs((v.r ?? p.r ?? 0) - (p.r ?? 0));
        if (d > WHOOSH_MIN)
          moves.push({
            t: t + springReach(e.k, e.d, 0.5),
            type: d > SWISH_MIN ? "swish" : "whoosh",
            gain: Math.min(0.9, 0.45 + d / 4000),
            d,
          });
      }
      const out = [];
      for (const m of moves) {
        const last = out[out.length - 1];
        if (last && m.t - last.t < WHOOSH_TRAVEL) {
          if (m.d > last.d) out[out.length - 1] = m;
        } else out.push(m);
      }
      return [...out.map(({ d, ...c }) => c), ...parts.flatMap((p) => p.cues?.() ?? [])];
    },
    draw(t) {
      const c = at(t);
      world.style.transform = `translate(${W / 2}px, ${H / 2}px) rotate(${-c.r}deg) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`;
      const b = blurAt(t);
      if (b.sx > 0.05 || b.sy > 0.05) {
        gauss.setAttribute("stdDeviation", `${b.sx.toFixed(2)} ${b.sy.toFixed(2)}`);
        smear.style.transform = `rotate(${b.angle}deg)`;
        upright.style.transform = `rotate(${-b.angle}deg)`;
        smear.style.filter = `url(#${fid})`;
      } else {
        smear.style.transform = upright.style.transform = smear.style.filter = "";
      }
      for (const p of parts) p.draw?.(t);
    },
  };
}

// A sheet torn in two along a ragged line, the halves pulled apart to show what lies beneath
// (a tear revealing another colour underneath). Build it inside table.add() over the
// region to reveal. The edge is a fixed seeded path (never random per frame).
export function tear(
  stage,
  {
    x,
    y,
    w,
    h,
    src,
    color = C().ground,
    tIn,
    seed = 5,
    dir = "h",
    spread = 0.6,
  },
) {
  const r = rng(seed);
  const n = 26;
  const edge = Array.from({ length: n + 1 }, (_, i) => [
    i / n,
    0.5 + (r() - 0.5) * 0.06 + (i % 2 ? 0.012 : -0.012),
  ]);
  const poly = (side) => {
    const line = edge.map(([a, b]) =>
      dir === "h" ? `${a * 100}% ${b * 100}%` : `${b * 100}% ${a * 100}%`,
    );
    const close =
      side === 0
        ? dir === "h"
          ? ["100% 0%", "0% 0%"]
          : ["0% 100%", "0% 0%"]
        : dir === "h"
          ? ["100% 100%", "0% 100%"]
          : ["100% 100%", "100% 0%"];
    return `polygon(${[...line, ...close].join(",")})`;
  };
  const halves = [0, 1].map((side) => {
    const el = document.createElement("div");
    Object.assign(el.style, {
      position: "absolute",
      left: `${x}px`,
      top: `${y}px`,
      width: `${w}px`,
      height: `${h}px`,
      background: src ? `${color} url(${src}) center/cover` : color,
      clipPath: poly(side),
      filter: "drop-shadow(0 6px 10px rgba(20,12,4,.4))",
    });
    stage.dom.append(el);
    return el;
  });
  return {
    cues: () => [{ t: tIn, type: "tear", gain: 1 }],
    draw(t) {
      const e = spring(t - tIn, 90, 16);
      const d = (dir === "h" ? h : w) * spread * e;
      halves.forEach((el, i) => {
        const s = i ? 1 : -1;
        el.style.transform =
          dir === "h"
            ? `translateY(${s * d}px) rotate(${s * 4 * e}deg)`
            : `translateX(${s * d}px) rotate(${-s * 4 * e}deg)`;
        el.style.visibility =
          e > 0.995 && clamp(progress(t, tIn + 1.5, tIn + 1.6)) === 1
            ? "hidden"
            : "visible";
      });
    },
  };
}
