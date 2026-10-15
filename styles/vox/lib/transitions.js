// Paper transitions between two shots, and the tape that holds a piece down. Re-exported by
// kit.js. Same contract as the kit: build once, draw(t) paints any t, cues() lists the sounds.
//
//   tearReveal   the shot on top is ripped away along a torn edge, the next one lies beneath
//   pageTurn     the shot on top turns over like a page (8 fps), the next one lies beneath
//   zoomThrough  the camera dives into a point of the shot (a hole, a word, an eye) and hands
//                the same eased scale move over to the next shot, cut at peak velocity
//   tapeOn       a strip of tape is laid across a piece's edge and pressed down
//
// A shot is any full-frame element at the stage's origin: a table's `view` (one makeTable per
// shot), a station's frame, a still. `from` is the outgoing shot and must lie ABOVE the incoming
// one in the DOM (build the incoming first); zoomThrough also moves `to`. Ink flooding the frame
// into the next shot is `inkBlot({ cover: true, reveal })` in kit.js.

import { stepped, clamp, rng, cutAtPeak } from "../../../core/lib/motion.js";
import { tornLine } from "../../../core/lib/torn.js";
import { theme } from "../../../core/lib/theme.js";
const C = () => theme().colors;

const SVG_NS = "http://www.w3.org/2000/svg";
const RIM = "#f4efe4"; // the paper's white core, where the printed face tore away (paper.js)
const show = (el, on) => (el.style.visibility = on ? "visible" : "hidden");
// A whole shot on or off. Not `visibility`: a piece inside a shot sets its own `visible` and
// would outlive its hidden shot.
const showShot = (el, on) => (el.style.display = on ? "" : "none");
const svgLayer = (stage, after) => {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", stage.W);
  svg.setAttribute("height", stage.H);
  Object.assign(svg.style, { position: "absolute", left: "0", top: "0", pointerEvents: "none" });
  after.after(svg);
  return svg;
};
let uid = 0;

// A hand's uneven pull, on a stop-motion clock: 0 before tIn, 1 from tIn + n/fps on, and in
// between the share of `n` seeded steps taken, each a different size (the rip jerks).
function jerky(t, tIn, dur, fps, seed) {
  const n = Math.max(2, Math.round(dur * fps));
  const r = rng(seed);
  const acc = [0];
  for (let i = 0; i < n; i++) acc.push(acc[i] + 0.35 + r() * 1.3);
  const k = clamp(Math.floor((t - tIn) * fps + 1e-6), 0, n);
  return { p: acc[k] / acc[n], end: tIn + n / fps };
}

// ── tearReveal ──────────────────────────────────────────────────────────────────────────────

// The outgoing shot `from` is ripped away: a torn edge crosses the frame from `side` (bottom |
// top | left | right) to the opposite side in uneven 12 fps jerks, uncovering what lies beneath.
// The edge is physical: the white fibre core of the paper (`rim` px, ragged, fuzzy) stands proud
// of the printed face, and the sheet casts a short shadow lip on the shot beneath. bite: how far
// the tear wanders (px); tilt: how much the front leans (share of the frame). Heard as one rip
// at the first visible step (`contact`); `done` = the frame is the next shot.
export function tearReveal(stage, { from, tIn, dur = 0.6, side = "bottom", seed = 3, bite = 60, tilt = 0.12, rim = 16, fps = 12 }) {
  if (!from) throw new Error("tearReveal: `from` (the outgoing shot's element) is required");
  const { W, H } = stage;
  const id = `tearReveal${++uid}`;
  const vertical = side === "left" || side === "right";
  const along = vertical ? H : W;
  const span = vertical ? W : H;
  const line = tornLine(seed);
  const wid = tornLine(seed + 7, { jag: 0.6 });
  const lip = 46;
  const margin = bite + tilt * along * 0.5 + rim * 2 + lip + 20;
  // (u along the edge, a across from the start side) → frame px.
  const xy = (u, a) => {
    const s = u * along;
    if (side === "bottom") return [s, H - a];
    if (side === "top") return [s, a];
    if (side === "left") return [a, s];
    return [W - a, s];
  };
  const N = 72;
  const front = (p) => {
    const A = -margin + p * (span + 2 * margin);
    return Array.from({ length: N + 1 }, (_, i) => {
      const u = i / N;
      return { u, a: A + tilt * along * (u - 0.5) + bite * line(u, p) };
    });
  };
  const poly = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const svg = svgLayer(stage, from);
  svg.innerHTML = `<defs>
      <filter id="${id}f" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="2" seed="${seed}" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="1" seed="${seed + 3}" result="g"/>
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.40  0 0 0 0.35 0" result="fibre"/>
        <feComposite in="fibre" in2="d" operator="in" result="fd"/>
        <feMerge><feMergeNode in="d"/><feMergeNode in="fd"/></feMerge>
      </filter>
      <filter id="${id}b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="9"/></filter>
      <clipPath id="${id}c"><polygon class="under"/></clipPath>
    </defs>
    <g clip-path="url(#${id}c)"><polygon class="lip" fill="rgba(20,12,4,0.55)" filter="url(#${id}b)"/></g>
    <polygon class="rim" fill="${RIM}" filter="url(#${id}f)"/>`;
  const [under, lipEl, rimEl] = ["under", "lip", "rim"].map((c) => svg.querySelector(`.${c}`));
  const contact = tIn + 1 / fps;
  const { end } = jerky(tIn, tIn, dur, fps, seed);
  return {
    contact,
    done: end,
    // The progress of the rip at t (0..1), for tests and for timing what follows.
    progress: (t) => jerky(t, tIn, dur, fps, seed).p,
    cues: () => [{ t: contact, type: "tear", gain: 1 }],
    draw(t) {
      const { p } = jerky(t, tIn, dur, fps, seed);
      const live = t >= tIn && t < end;
      show(svg, live && p > 0);
      showShot(from, t < end);
      if (!live || p === 0) {
        from.style.clipPath = "";
        return;
      }
      const f = front(p);
      const edge = f.map(({ u, a }) => xy(u, a));
      const far = [xy(1, span + margin * 2), xy(0, span + margin * 2)];
      const near = [xy(1, -margin * 2), xy(0, -margin * 2)];
      // The printed face survives beyond the front; the white core reaches `rim` px past it.
      from.style.clipPath = `polygon(${[...edge, ...far].map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;
      const rimEdge = f.map(({ u, a }) => xy(u, a - rim * (0.45 + 0.9 * Math.abs(wid(u, p)))));
      rimEl.setAttribute("points", poly([...f.map(({ u, a }) => xy(u, a + 2)), ...rimEdge.reverse()]));
      lipEl.setAttribute("points", poly([...edge, ...f.map(({ u, a }) => xy(u, a - rim - lip)).reverse()]));
      under.setAttribute("points", poly([...edge, ...near]));
    },
  };
}

// ── pageTurn ────────────────────────────────────────────────────────────────────────────────

// The outgoing shot `from` turns over like a page on its `spine` (left | right), stepped at 8 fps
// (a printed page, not a slide): it lifts slowly, falls over quickly, darkens as it turns from the
// light, shows a paper back past 90° and casts a moving shadow on the shot beneath. shade: an
// optional real crumple or paper scan (image url) multiplied into the turning page, so its relief
// catches the light as it bends; back: the reverse's picture (default: the theme's paper).
// Heard as one page turn as it lifts (tIn); `done` = the frame is the next shot.
export function pageTurn(stage, { from, tIn, dur = 0.9, spine = "left", fps = 8, shade, back, perspective = 2600 }) {
  if (!from) throw new Error("pageTurn: `from` (the outgoing shot's element) is required");
  const { W, H } = stage;
  const sgn = spine === "left" ? -1 : 1;
  const origin = spine === "left" ? "0% 50%" : "100% 50%";
  const sheet = (style) => {
    const e = document.createElement("div");
    Object.assign(e.style, { position: "absolute", left: "0", top: "0", width: `${W}px`, height: `${H}px`, pointerEvents: "none", transformOrigin: origin, ...style });
    return e;
  };
  const cast = sheet({});
  from.before(cast);
  const paper = back ? `url("${back}") center/cover` : `${C().ground} url("${theme().textures.paper}") center/cover`;
  const reverse = sheet({ background: paper });
  const frontShade = sheet({ backfaceVisibility: "hidden" });
  const relief = shade ? sheet({ background: `url("${shade}") center/cover`, mixBlendMode: "multiply", backfaceVisibility: "hidden" }) : null;
  from.after(...[relief, frontShade, reverse].filter(Boolean));
  const turned = (t) => {
    const u = clamp(stepped(t - tIn, fps) / dur);
    // Lifts slowly, then falls over: an ease-in that lands at 180° exactly on dur.
    return 180 * (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u));
  };
  const end = tIn + dur;
  return {
    done: end,
    // The page's turn at t in degrees (0 flat .. 180 over), on the 8 fps clock.
    angle: turned,
    cues: () => [{ t: tIn, type: "page", gain: 0.9 }],
    draw(t) {
      const th = turned(t);
      const live = t >= tIn && t < end;
      for (const e of [cast, frontShade, relief].filter(Boolean)) show(e, live && th > 0);
      // Past 90° the viewer sees the page's back: plain paper, so mirroring it does not matter.
      show(reverse, live && th > 90);
      showShot(from, t < end);
      if (!live || th === 0) {
        from.style.transform = "";
        from.style.transformOrigin = "";
        from.style.backfaceVisibility = "";
        return;
      }
      const rad = (th * Math.PI) / 180;
      const tf = `perspective(${perspective}px) rotateY(${sgn * th}deg)`;
      Object.assign(from.style, { transform: tf, transformOrigin: origin, backfaceVisibility: "hidden" });
      frontShade.style.transform = tf;
      if (relief) {
        relief.style.transform = tf;
        relief.style.opacity = String(0.25 + 0.6 * Math.sin(rad));
      }
      reverse.style.transform = tf;
      // The face darkens toward the lifted edge as it turns away from the light.
      const toFree = spine === "left" ? "to right" : "to left";
      const dark = 0.55 * Math.sin(rad);
      frontShade.style.background = `linear-gradient(${toFree}, rgba(20,12,4,${(dark * 0.25).toFixed(3)}), rgba(20,12,4,${dark.toFixed(3)}))`;
      reverse.style.boxShadow = `inset 0 0 ${(160 * Math.sin(rad)).toFixed(0)}px rgba(20,12,4,${(0.5 * Math.sin(rad)).toFixed(3)})`;
      // The lifted page's shadow on the shot beneath, just past its projected free edge.
      const e = Math.max(0, W * Math.cos(rad));
      const spread = 40 + 220 * Math.sin(rad);
      const a = (0.5 * Math.sin(rad)).toFixed(3);
      const g = `rgba(20,12,4,${a}) 0px, rgba(20,12,4,${a}) ${e.toFixed(0)}px, rgba(20,12,4,0) ${(e + spread).toFixed(0)}px`;
      cast.style.background = `linear-gradient(${toFree}, ${g})`;
    },
  };
}

// ── zoomThrough ─────────────────────────────────────────────────────────────────────────────

// The camera dives into the point (x, y) of the outgoing shot `from` (frame px: a hole, a word,
// an eye) until it is z times bigger, the point gliding to the frame's centre; the incoming shot
// `to` rides the same move (parented to the point at 1/z), and the picture cuts from one to the
// other where the move is fastest (`cut`, by cutAtPeak), so the motion and its direction carry
// across the cut. `to` is best a table's view: its world fills the frame around it while it is
// still small; a bare still would show its borders. One eased scale move over `dur`, symmetric ease-in-out (`ease` = its power;
// After Effects' Easy Ease is ≈ 2.4). `to` ends exactly upright at scale 1. Heard as one whoosh
// peaking on the cut.
export function zoomThrough(stage, { from, to, x, y, z = 12, tIn, dur = 1.1, ease = 2.4 }) {
  if (!from || !to) throw new Error("zoomThrough: `from` and `to` (the two shots' elements) are required");
  const { W, H } = stage;
  const e = (t) => {
    const u = clamp((t - tIn) / dur);
    return u ** ease / (u ** ease + (1 - u) ** ease || 1);
  };
  // The move's perceived size is the scale ratio: cut where log(scale) changes fastest.
  const cut = cutAtPeak((t) => e(t) * Math.log(z), tIn, tIn + dur);
  const end = tIn + dur;
  // While it rides the move small, the incoming shot shows what lies around its frame: a table's
  // view lets its world spill past its window, so there is never an empty border.
  const overflow = to.style.overflow;
  return {
    cut,
    done: end,
    // The move's progress at t (0..1) and the outgoing shot's scale.
    progress: e,
    scale: (t) => z ** e(t),
    cues: () => [{ t: cut, type: "whoosh", gain: 0.7 }],
    draw(t) {
      const p = e(t);
      const s = z ** p;
      const px = x + (W / 2 - x) * p;
      const py = y + (H / 2 - y) * p;
      const moving = t >= tIn && t < end;
      from.style.transformOrigin = to.style.transformOrigin = "0 0";
      from.style.transform = moving ? `translate(${px}px, ${py}px) scale(${s}) translate(${-x}px, ${-y}px)` : "";
      to.style.transform = moving ? `translate(${px}px, ${py}px) scale(${s / z}) translate(${-W / 2}px, ${-H / 2}px)` : "";
      to.style.overflow = moving ? "visible" : overflow;
      showShot(from, t < cut);
      showShot(to, t >= cut);
    },
  };
}

// ── tapeOn ──────────────────────────────────────────────────────────────────────────────────

// A strip of tape laid across a piece's edge by hand, then pressed: it unrolls from its `from`
// end (left | right) over `lay` s on the 12 fps clock, hovering with a soft shadow, and at the
// press (`pressed`) it settles flat with a tight contact shadow and holds. src: a PHOTOGRAPHED
// tape cut-out (a PNG with its own translucency and torn ends); tape is never drawn in code.
// (x, y) = the strip's centre, w × h its size, rot its turn. Build it after the piece it holds,
// in the same space (a station, the table). Heard as one tape sound at the press.
export function tapeOn(stage, { src, x, y, w, h, rot = 0, tIn, lay = 0.33, from = "left", fps = 12, opacity = 1 }) {
  if (!src) throw new Error("tapeOn: `src` (a photographed tape cut-out) is required");
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "absolute",
    left: `${x - w / 2}px`,
    top: `${y - h / 2}px`,
    width: `${w}px`,
    height: `${h}px`,
    background: `url("${src}") center/100% 100% no-repeat`,
    opacity: String(opacity),
    transformOrigin: "50% 50%",
  });
  stage.dom.append(el);
  const pressed = tIn + Math.ceil(lay * fps - 1e-6) / fps;
  return {
    el,
    pressed,
    // How much of the strip is down at t (0..1).
    laid: (t) => clamp(stepped(t - tIn, fps) / lay),
    cues: () => [{ t: pressed, type: "tape", gain: 0.9 }],
    draw(t) {
      const p = clamp(stepped(t - tIn, fps) / lay);
      const down = t >= pressed;
      const k = 1 - (1 - p) ** 2;
      const hidden = `${((1 - k) * 100).toFixed(2)}%`;
      el.style.clipPath = from === "left" ? `inset(0 ${hidden} 0 0)` : `inset(0 0 0 ${hidden})`;
      // Hovering above the paper until the thumb presses it flat.
      const lift = down ? 0 : 1;
      el.style.transform = `rotate(${rot}deg) scale(${1 + 0.035 * lift})`;
      el.style.filter = down
        ? "drop-shadow(0 1px 1.2px rgba(20,12,4,.35))"
        : "drop-shadow(0 9px 8px rgba(20,12,4,.32))";
      show(el, t >= tIn && p > 0);
    },
  };
}
