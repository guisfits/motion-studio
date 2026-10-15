// The vox style's components: editorial-collage grammar (paper pieces placed by hand, type
// rising out of masks, one accent pen mark per frame) over the engine's stage. Colours and
// families come from the theme (core/lib/theme.js), so a project restyles them without forking.
// Same contract for all:
//
//   const p = piece(stage, { img: stage.img.photo, x, y, w, tIn: 1.2, tOut: 4.0 });   // build once
//   stage.run((t) => { p.draw(t); ... });                                   // paint any t
//
// tIn: when it enters (film seconds); tOut: when it leaves (omit to stay). Pieces enter by
// being placed (lift → land, stepped like paper moved by hand) and leave by being lifted
// away; type rises out of a mask and sinks back. Nothing fades in from nothing.

import { spring, springReach, revealProgress, SPRINGS, stepped, progress, rng, clamp, fbm } from "../../../core/lib/motion.js";
import { theme } from "../../../core/lib/theme.js";
import { tornClip } from "../../../core/lib/torn.js";
const C = () => theme().colors;
const F = () => theme().families;

const S = SPRINGS;
const css = (s) => s.replaceAll('"', "'");
const enter = (t, tIn, sp = S.snappy, hand = true) =>
  spring(hand ? stepped(t - tIn, 12) : t - tIn, sp.k, sp.d);
const leave = (t, tOut, sp = S.default) =>
  tOut == null ? 0 : spring(t - tOut, sp.k, sp.d);
const show = (el, on) => (el.style.visibility = on ? "visible" : "hidden");
// When a thing entering by spring `sp` at tIn visibly lands (95% of its way): where its landing
// sound goes, not tIn, which is only when the hand starts to move. A hand-stepped entrance
// (`enter` on a 12 fps clock) lands on the first step at or after that.
export const landsAt = (tIn, sp = S.snappy, stepFps = 0) => {
  const r = springReach(sp.k, sp.d);
  return tIn + (stepFps ? Math.ceil(r * stepFps - 1e-9) / stepFps : r);
};

function div(stage, style = {}, html = "", parent = stage.dom) {
  const e = document.createElement("div");
  Object.assign(e.style, {
    position: "absolute",
    left: "0",
    top: "0",
    ...style,
  });
  e.innerHTML = html;
  parent.append(e);
  return e;
}

// ── Grounds ───────────────────────────────────────────────────────────────────────────────

// The page under everything: the ground colour (with the theme's paper texture) or the night.
// tone(t) → "day" | "night" lets a film switch; pair the switch with inkFlood.
export function ground(
  stage,
  { tone = () => "day", texture = theme().textures.paper, scan = {} } = {},
) {
  const full = { width: `${stage.W}px`, height: `${stage.H}px` };
  const day = div(stage, { ...full, background: `${C().ground} url(${texture}) center/cover` });
  const night = div(stage, {
    ...full,
    background: `radial-gradient(120% 80% at 50% 40%, ${C().night2}, ${C().night} 70%)`,
  });
  // The editorial trick: never a flat ground. A real scan (an old Bible page,
  // a nave) graded into it: blacks lifted to dark grey, a warm tint, low contrast.
  if (scan.night)
    div(stage, {
      ...full, background: `url(${scan.night}) center/cover`, opacity: "0.38",
      filter: "grayscale(.4) sepia(.45) brightness(.3) contrast(.9)",
    }, "", night);
  if (scan.day)
    div(stage, {
      ...full, background: `url(${scan.day}) center/cover`, opacity: "0.14", mixBlendMode: "multiply",
      filter: "grayscale(.5) sepia(.3) contrast(.9)",
    }, "", day);
  return {
    draw(t) {
      const n = tone(t) === "night";
      show(day, !n);
      show(night, n);
    },
  };
}

// Accent-coloured liquid ink rising from the foot of the frame, then the new ground following it:
// the bridge between light and dark (to: "night") or back (to: "day"). The edge lives
// (feTurbulence, fixed seed). After it, call ground with tone switching at tIn + 0.6.
export function inkFlood(stage, { tIn, to = "night", seed = 7, texture = theme().textures.paper }) {
  const { W, H } = stage;
  const id = `ink${tIn.toString().replace(".", "_")}`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);
  Object.assign(svg.style, { position: "absolute", left: "0", top: "0" });
  // The new ground is painted exactly as ground() paints it, so the hand-over never pops.
  const next = to === "night" ? `url(#${id}n)` : `url(#${id}d)`;
  svg.innerHTML = `
    <defs>
      <radialGradient id="${id}n" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="${C().night2}"/><stop offset="0.7" stop-color="${C().night}"/></radialGradient>
      <pattern id="${id}d" patternUnits="userSpaceOnUse" width="${W}" height="${H}" y="0"><rect width="${W}" height="${H}" fill="${C().ground}"/><image href="${texture}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/></pattern>
    </defs>
    <filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.018" numOctaves="3" seed="${seed}"/>
      <feDisplacementMap in="SourceGraphic" scale="180" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <g filter="url(#${id})">
      <rect class="a" x="-200" width="${W + 400}" height="${H * 2}" fill="${C().accent}"/>
      <rect class="b" x="-200" width="${W + 400}" height="${H * 2}" fill="${next}"/>
    </g>`;
  stage.dom.append(svg);
  const [a, b] = svg.querySelectorAll("rect");
  return {
    // The ink is in the frame within a frame or two of tIn and covers it by `done`: a pour as long as that.
    cues: () => [{ t: tIn + 0.05, type: "pour", gain: 0.8, len: 0.9 }],
    // The moment the new ground fully covers the frame: switch the ground's tone there.
    done: tIn + 0.9,
    draw(t) {
      const ra = spring(t - tIn, 60, 16);
      const rb = spring(t - tIn - 0.35, 60, 16);
      a.setAttribute("y", String(H + 200 - (H + 600) * ra));
      b.setAttribute("y", String(H + 200 - (H + 600) * rb));
      show(svg, t >= tIn && t < tIn + 1.4);
    },
  };
}

// ── Type ──────────────────────────────────────────────────────────────────────────────────

// Face name -> theme family, read when a component builds (so setTheme before building wins).
// black / roman / fell are older names for display / serif / serif.
const FACE_FAMILY = { display: "display", serif: "serif", body: "body", mono: "mono", black: "display", roman: "serif", fell: "serif" };
const faceFamily = (face) => F()[FACE_FAMILY[face] ?? face] ?? F().body;
const isDisplay = (face) => FACE_FAMILY[face] === "display";

// A word or line in a theme face, rising out of its mask and sinking back.
// face: display (lead) | serif (quoted documents) | body | mono. x, y = top-left.
export function word(
  stage,
  {
    text,
    face = "display",
    size = 200,
    x,
    y,
    color,
    night = false,
    tIn,
    tOut,
    maxW,
  },
) {
  const lh = isDisplay(face) ? 1.0 : 1.12;
  const mask = div(stage, {
    overflow: "hidden",
    width: `${maxW ?? stage.W}px`,
    height: `${size * lh * 1.18}px`,
    transform: `translate(${x}px, ${y}px)`,
  });
  const el = div(
    stage,
    {
      font: `400 ${size}px/${lh} ${css(faceFamily(face))}`,
      whiteSpace: "nowrap",
      color: color ?? (night ? C().nightInk : C().ink),
    },
    text,
    mask,
  );
  const h = size * lh * 1.18;
  return {
    el,
    draw(t) {
      const e = spring(t - tIn, S.heavy.k, S.heavy.d);
      const l = leave(t, tOut, S.heavy);
      el.style.transform = `translateY(${h * (1 - e) + h * l}px)`;
      show(mask, t >= tIn && (tOut == null || l < 0.999));
    },
  };
}

// An illuminated drop cap at film size: the display face, filled from the foot with the accent.
// rest: the words that follow the capital, set beside it.
export function dropCap(
  stage,
  { letter, rest = "", size = 620, x, y, tIn, tOut, night = false },
) {
  const cap = div(
    stage,
    {
      font: `400 ${size}px/0.8 ${css(F().display)}`,
      color: "transparent",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
    },
    letter,
  );
  const tail = word(stage, {
    text: rest,
    face: "display",
    size: size * 0.17,
    x: x + size * 0.56,
    y: y + size * 0.42,
    night,
    tIn: tIn + 0.7,
    tOut,
  });
  const idle = night
    ? (C().nightRule ?? "rgba(255,255,255,.18)")
    : C().ruleSoft;
  return {
    // The cap settles on its spring (tIn only starts it rising).
    cues: () => [{ t: landsAt(tIn, S.heavy), type: "thud-soft", gain: 0.6 }],
    draw(t) {
      const e = spring(t - tIn, S.heavy.k, S.heavy.d);
      const l = leave(t, tOut);
      const f = progress(t, tIn + 0.4, tIn + 1.5) ** 0.8 * 100;
      Object.assign(cap.style, {
        transform: `translate(${x}px, ${y + 60 * (1 - e) + 300 * l}px)`,
        opacity: String(clamp(e * 1.4) * (1 - l)),
        backgroundImage: `linear-gradient(to top, ${C().accent} ${f}%, ${idle} ${f}%)`,
      });
      show(cap, t >= tIn);
      tail.draw(t);
    },
  };
}

// A mono caption: who, where, when (LUTHER · WITTENBERG · 1522).
export function tag(
  stage,
  { text, x, y, night = false, size = 30, tIn, tOut },
) {
  const el = div(
    stage,
    {
      font: `400 ${size}px/1.35 ${css(F().mono)}`,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: night ? C().nightInk : C().ink2,
    },
    text,
  );
  return {
    draw(t) {
      const e = spring(t - tIn, S.default.k, S.default.d);
      const l = leave(t, tOut);
      el.style.transform = `translate(${x}px, ${y + 20 * (1 - e)}px)`;
      el.style.opacity = String(
        progress(t, tIn, tIn + 0.2) * (1 - l) * (night ? 0.85 : 1),
      );
    },
  };
}

// The rubric: one accent pen mark (underline or circle) drawn on, the frame's one accent.
export function rubric(
  stage,
  { kind = "underline", x, y, w, h = 0, tIn, tOut, width = 12 },
) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  Object.assign(svg.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${stage.W}px`,
    height: `${stage.H}px`,
    overflow: "visible",
  });
  const p = document.createElementNS(svg.namespaceURI, "path");
  const r = rng(Math.round(x + y));
  const j = () => (r() - 0.5) * 14;
  const d =
    kind === "arrow"
      ? `M ${x} ${y} C ${x + w * 0.3} ${y + h * 0.1 + j()}, ${x + w * 0.7} ${y + h * 0.5}, ${x + w} ${y + h}
         M ${x + w - 46} ${y + h - 14} L ${x + w} ${y + h} L ${x + w - 8} ${y + h - 52}`
      : kind === "circle"
      ? `M ${x + w * 0.1} ${y + j()} C ${x + w * 0.9} ${y - h * 0.15 + j()}, ${x + w + 30} ${y + h * 0.9}, ${x + w * 0.5} ${y + h + 10}
         C ${x - 30} ${y + h + j()}, ${x - 20} ${y + h * 0.1}, ${x + w * 0.25} ${y - 6}`
      : `M ${x} ${y + j()} C ${x + w * 0.3} ${y - 10 + j()}, ${x + w * 0.66} ${y + 10 + j()}, ${x + w} ${y + j()}`;
  p.setAttribute("d", d);
  Object.assign(p.style, {
    fill: "none",
    stroke: C().accent,
    strokeWidth: String(width),
    strokeLinecap: "round",
  });
  svg.append(p);
  stage.dom.append(svg);
  const len = p.getTotalLength();
  p.style.strokeDasharray = String(len);
  return {
    // The stroke is drawn by `default` in ~0.4 s: the sound lasts that long, from its start.
    cues: () => [{ t: tIn, type: kind === "underline" ? "marker" : "pen", gain: 0.7, len: 0.45 }],
    draw(t) {
      const e = spring(t - tIn, S.default.k, S.default.d);
      p.style.strokeDashoffset = String(len * (1 - e));
      svg.style.opacity = String(1 - leave(t, tOut));
      show(svg, t >= tIn);
    },
  };
}

// ── Paper ─────────────────────────────────────────────────────────────────────────────────

// A torn paper edge on all four sides lives in the engine (core/lib/torn.js); kept importable from here.
export { tornClip };

const SVG_NS = "http://www.w3.org/2000/svg";
// One hidden <svg> per stage holding the shared filters (referenced by url(#id) from CSS).
export function svgDefs(stage) {
  if (!stage.__defs) {
    const svg = document.createElementNS(SVG_NS, "svg");
    Object.assign(svg.style, { position: "absolute", width: "0", height: "0", overflow: "hidden" });
    (stage.root ?? stage.dom).append(svg);
    stage.__defs = svg;
  }
  return stage.__defs;
}
const defFilter = (stage, id, body, region = 'x="-10%" y="-10%" width="120%" height="120%"') => {
  const defs = svgDefs(stage);
  if (!defs.querySelector(`#${id}`))
    defs.insertAdjacentHTML("beforeend", `<filter id="${id}" ${region} color-interpolation-filters="sRGB">${body}</filter>`);
  return `url(#${id})`;
};

// The edge of a cut piece (one white cut on every piece reads as a sticker sheet):
//   border  the PNG as cut (cutout.swift's paper border, when it has one)
//   deckle  a soft, fibrous hand-made-paper edge: the alpha roughened by seeded noise
//   torn    a seeded ragged clip-path, as if ripped out of a page
//   none    the paper border eaten back by `cut` px of the PNG (the bare subject)
function edgeFilter(stage, edge, { seed, cut, scale }) {
  if (edge === "deckle")
    return defFilter(stage, `deckle${seed}`, `
      <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="${seed}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feComponentTransfer in="d"><feFuncA type="linear" slope="1.25" intercept="-0.1"/></feComponentTransfer>`);
  if (edge === "none") {
    const r = Math.max(0.5, cut * scale);
    return defFilter(stage, `bare${Math.round(r * 10)}`, `
      <feMorphology in="SourceAlpha" operator="erode" radius="${r.toFixed(1)}" result="m"/>
      <feComposite in="SourceGraphic" in2="m" operator="in"/>`);
  }
  return "";
}
const EDGES = ["border", "deckle", "torn", "none"];

// A cut piece (a PNG cut out by kit.mjs / cutout.swift) placed on the table by hand, lifted away at tOut.
// x, y = centre; from: where it comes from ("below" | "left" | "right" | "above", or a corner
// "tl" | "tr" | "bl" | "br" for a pull from a corner).
// Paper variety, all optional:
//   edge     "border" (default, the PNG as cut) | "deckle" | "torn" | "none" (see edgeFilter)
//   cut      for edge "none": the border to eat, in PNG px (cutout.swift --border, default 14)
//   height   how far it stands off the table, 0..1: resting shadow depth (0 = flat, the old
//            look); default: seeded per piece in 0.05..0.5 so a collage never has one shadow
//   stepped  true (12 fps) or an fps: a corner slide moves on a hand-animated stop-motion clock
//            (default: smooth, which reads best for corner pulls)
//   seed     for the torn/deckle edge and the default height
export function piece(
  stage,
  {
    img, w, x, y, rot = 0, tIn, tOut, from = "below", filter = "",
    edge = "border", cut = 14, height, stepped: stepFps = false, seed,
  },
) {
  if (!EDGES.includes(edge)) throw new Error(`piece: edge "${edge}" is not one of ${EDGES.join(", ")}`);
  const h = (img.naturalHeight / img.naturalWidth) * w;
  const el = img.cloneNode();
  Object.assign(el.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${w}px`,
    height: `${h}px`,
  });
  const sd0 = seed ?? Math.round(Math.abs(x * 7 + y * 13 + w));
  if (edge === "torn") el.style.clipPath = tornClip(sd0, 18, 4.5);
  const edgeF = edgeFilter(stage, edge, { seed: sd0 % 997, cut, scale: w / (img.naturalWidth || w) });
  const lift0 = height ?? 0.05 + 0.45 * rng(sd0)();
  stage.dom.append(el);
  stage.pending.push(el.decode().catch(() => {}));
  // Where the hand pulls it from: a side, or a corner.
  const far = {
    below: [0, stage.H], above: [0, -stage.H], left: [-stage.W, 0], right: [stage.W, 0],
    tl: [-stage.W, -stage.H * 0.6], tr: [stage.W, -stage.H * 0.6],
    bl: [-stage.W, stage.H * 0.6], br: [stage.W, stage.H * 0.6],
  }[from];
  const slide = from.length === 2;
  const fps = stepFps === true ? 12 : stepFps || 0;
  return {
    // A placed piece is heard where it lands, a corner pull from its start (the slide) and again
    // where it settles; a piece lifted away slides from tOut.
    cues: () =>
      slide
        ? [
            { t: tIn, type: "paper-slide" },
            { t: landsAt(tIn, { k: 70, d: 15 }, fps), type: "paper-place", gain: 0.6 },
            ...(tOut != null ? [{ t: tOut, type: "paper-slide" }] : []),
          ]
        : [{ t: landsAt(tIn, S.snappy, 12), type: "paper-place" }, ...(tOut != null ? [{ t: tOut, type: "paper-slide" }] : [])],
    el,
    w,
    h,
    draw(t, { dx = 0, dy = 0 } = {}) {
      // A corner slide is one continuous pull that decelerates and lands (smooth unless stepped).
      const e = slide ? spring(fps ? stepped(t - tIn, fps) : t - tIn, 70, 15) : enter(t, tIn);
      const l = leave(t, tOut, S.snappy);
      const lift = Math.max(1 - e, l);
      const k = 1 - e + l;
      const turn = slide ? (far[0] > 0 ? 9 : -9) * (far[1] > 0 ? 1 : -1) : 4;
      el.style.transform =
        `translate(${x - w / 2 + far[0] * k + dx}px, ${y - h / 2 + far[1] * k + dy}px) ` +
        `rotate(${rot + turn * (1 - e) - 4 * l}deg) scale(${1 + 0.03 * lift})`;
      // Resting shadow grows with the piece's height off the table; lifting adds to it.
      const hgt = Math.min(1, lift + lift0 * (1 - lift));
      const sd = 2 + 22 * hgt;
      el.style.filter = `${edgeF} drop-shadow(0 ${1 + hgt * 2}px ${1 + hgt}px rgba(30,20,10,.35)) drop-shadow(0 ${sd}px ${sd * 1.4}px rgba(30,20,10,${0.18 + 0.12 * hgt})) ${filter}`.trim();
      show(el, t >= tIn - 0.01 && l < 0.999);
    },
  };
}

// A halftone dot screen (the Vox print texture) for an engraving or a ground,
// NEVER on text (dots break letterforms). Either wraps an existing element (el: its filter gets
// the screen) or places an image (src or img) at x, y (top-left), w × h.
// dot: the cell in px (the screen runs at 45°, so dots sit dot/√2 apart); color: the ink;
// paper: what shows between dots ("none" keeps it transparent, for layering with multiply).
// The dot grows with the darkness of the source, like a print screen. A piece that repaints its
// own filter each frame takes the screen through its filter option instead:
//   K.piece(stage, { img, ..., filter: K.halftoneFilter(stage, { dot: 10 }) })
export function halftoneFilter(stage, { dot = 12, color = C().ink, paper = "none" } = {}) {
  const id = `ht${Math.round(dot * 10)}${color.replace(/[^a-z0-9]/gi, "")}${paper.replace(/[^a-z0-9]/gi, "")}`;
  const d = dot;
  // One tile: a cone (0 at a dot centre, 1 at its rim) around the centre and the four corners.
  const g = `<radialGradient id='g'><stop offset='0' stop-color='black'/><stop offset='1' stop-color='white'/></radialGradient>`;
  const c = (cx, cy) => `<circle cx='${cx}' cy='${cy}' r='${d / 2}' fill='url(%23g)' style='mix-blend-mode:darken'/>`;
  const tile = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${d}' height='${d}'><defs>${g}</defs><rect width='${d}' height='${d}' fill='white'/>${[[0, 0], [d, 0], [0, d], [d, d], [d / 2, d / 2]].map(([a, b]) => c(a, b)).join("")}</svg>`;
  return defFilter(stage, id, `
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.3 -0.59 -0.11 0 1" result="dark"/>
      <feImage href="${tile}" x="0" y="0" width="${d}" height="${d}" preserveAspectRatio="none" result="cell"/>
      <feTile in="cell" result="tiled"/>
      <feColorMatrix in="tiled" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1 0 0 0 1" result="near"/>
      <feComposite in="dark" in2="near" operator="arithmetic" k2="1" k3="1" k4="-1" result="diff"/>
      <feComponentTransfer in="diff" result="dots"><feFuncA type="linear" slope="24" intercept="0"/></feComponentTransfer>
      <feComposite in="dots" in2="SourceAlpha" operator="in" result="cut"/>
      <feFlood flood-color="${color}" result="ink"/>
      <feComposite in="ink" in2="cut" operator="in" result="printed"/>
      ${paper === "none" ? "" : `<feFlood flood-color="${paper}" result="pp"/><feComposite in="pp" in2="SourceAlpha" operator="in" result="ground"/><feMerge><feMergeNode in="ground"/><feMergeNode in="printed"/></feMerge>`}`,
    'x="0" y="0" width="100%" height="100%" primitiveUnits="userSpaceOnUse"');
}

export function halftone(stage, { el, src, img, x = 0, y = 0, w, h, dot = 12, color = C().ink, paper = "none", tIn = 0, tOut, blend = "multiply" } = {}) {
  const url = halftoneFilter(stage, { dot, color, paper });
  let target = el;
  if (!target) {
    const source = img ?? null;
    target = source ? source.cloneNode() : document.createElement("img");
    if (!source) target.src = src;
    const ratio = source ? source.naturalHeight / source.naturalWidth : null;
    Object.assign(target.style, {
      position: "absolute", left: "0", top: "0", width: `${w}px`,
      height: `${h ?? (ratio ? ratio * w : w)}px`, objectFit: "cover",
      transform: `translate(${x}px, ${y}px)`, mixBlendMode: blend,
    });
    stage.dom.append(target);
    stage.pending.push(target.decode().catch(() => {}));
  }
  target.style.filter = `${url} ${el ? target.style.filter ?? "" : ""}`.trim();
  return {
    el: target,
    filter: url,
    draw(t) {
      if (el) return;
      show(target, t >= tIn && (tOut == null || t < tOut));
    },
  };
}

// ── Light and water (photo animation) ─────────────────────────────────────────────────────

// Candlelight breathing on the table: a warm glow with a seeded flicker.
export function candle(
  stage,
  { x = 0.55, y = 0.6, tIn = 0, tOut, strength = 0.22 },
) {
  const el = div(stage, {
    width: `${stage.W}px`,
    height: `${stage.H}px`,
    mixBlendMode: "screen",
  });
  return {
    draw(t) {
      const r = rng(Math.floor(t * 18) + 3);
      const f =
        (0.86 + 0.14 * r()) *
        progress(t, tIn, tIn + 0.6) *
        (1 - leave(t, tOut));
      el.style.background = `radial-gradient(60% 42% at ${x * 100}% ${y * 100}%, rgba(255,190,110,${strength * f}), transparent 70%)`;
    },
  };
}

// A band of light sweeping across the frame (a window's light moving over a page).
export function lightSweep(
  stage,
  { tIn, dur = 2.4, angle = 112, strength = 0.35 },
) {
  const el = div(stage, {
    width: `${stage.W}px`,
    height: `${stage.H}px`,
    mixBlendMode: "soft-light",
  });
  return {
    draw(t) {
      const p = progress(t, tIn, tIn + dur);
      const c = -30 + 160 * p;
      el.style.background = `linear-gradient(${angle}deg, transparent ${c - 22}%, rgba(255,236,200,${strength}) ${c}%, transparent ${c + 22}%)`;
      show(el, p > 0 && p < 1);
    },
  };
}

// Water: a living ripple over any element (a photo of a river, a reflection, a baptism).
// The displacement drifts with t, so a still photo moves like a cinemagraph.
export function ripple(
  stage,
  el,
  { strength = 14, freq = "0.012 0.04", seed = 3 } = {},
) {
  const id = `rip${seed}${Math.round(strength)}`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  Object.assign(svg.style, { position: "absolute", width: "0", height: "0" });
  svg.innerHTML = `<filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}"/>
    <feOffset dx="0" dy="0"/><feDisplacementMap in="SourceGraphic" scale="${strength}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  stage.dom.append(svg);
  const off = svg.querySelector("feOffset");
  el.style.filter = `url(#${id}) ${el.style.filter ?? ""}`;
  return {
    draw(t) {
      off.setAttribute("dx", String(t * 40));
      off.setAttribute("dy", String(Math.sin(t * 1.3) * 12));
    },
  };
}

// Film grain over the whole frame (seeded per frame, never Math.random). After finish() it
// lands in the finish overlay, above the softened composite (grain is the last step), unless
// stage.dom has been swapped for a layer of its own (the house outro does, for its own grain):
// then it stays on that layer. `parent` overrides where it goes.
export function grain(stage, { strength = 0.08, parent } = {}) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", stage.W);
  svg.setAttribute("height", stage.H);
  Object.assign(svg.style, {
    position: "absolute",
    left: "0",
    top: "0",
    mixBlendMode: "multiply",
    opacity: String(strength),
  });
  svg.innerHTML = `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="1"/>
    <feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#grain)"/>`;
  (parent ?? (stage.overlay && stage.dom === stage.overlayDom ? stage.overlay : stage.dom)).append(svg);
  const turb = svg.querySelector("feTurbulence");
  return {
    draw(t) {
      turb.setAttribute("seed", String(Math.floor(t * 24)));
    },
  };
}

// ── Finishing pass ────────────────────────────────────────────────────────────────────────

// A step's amount: `false`, 0 or null switch it off; anything else must be a positive number.
function amount(name, v) {
  if (v === false || v == null || v === 0) return 0;
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0)
    throw new Error(`finish: ${name} must be a positive number or false, got ${v}`);
  return v;
}

// The frame's random draw: flicker gain (x2 per stop) and gate-weave offset in px. Pure in the
// frame index floor(t * fps), so any t inside a frame repaints it identically and a seek or a
// re-render lands on the same numbers. A step that is off returns the neutral value but still
// consumes its draw, so switching one step never reshuffles the others.
export function finishFrame(t, { fps = 24, seed = 1, flicker = 0.03, weave = 1 } = {}) {
  const stops = amount("flicker", flicker);
  const px = amount("weave", weave);
  const frame = Math.floor(t * fps + 1e-6);
  const r = rng(Math.imul(frame + 1, 0x9e3779b1) ^ Math.imul(seed | 0, 0x85ebca6b));
  r();
  const [g, x, y] = [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1];
  return { gain: stops ? 2 ** (g * stops) : 1, dx: px ? x * px : 0, dy: px ? y * px : 0 };
}

let finishes = 0;

// One finishing chain over the whole frame (Chris Moran: "a stack of small imperfections applied
// the same way to everything"; values in references/craft-chrismoran.md §1). Call it ONCE, last,
// after the table, pieces and captions are built: everything already on the stage is moved under
// one wrapper, so the camera and the pieces are never touched, only the finished composite.
//
//   const fin = K.finish(stage, { grain: 0.07 });
//   stage.run((t) => { table.draw(t); ...; fin.draw(t); });
//
// Per frame (`fps`, default 24, independent of the render rate; a frame holds its values):
//   flicker   exposure gain 2^(+-flicker) stops, new each frame            default 0.03  (false = off)
//   weave     stepped translate of +-weave px                              default 1
//   scale     zoom of the wrapper so the weave and the filters never show the edge, default 1.02;
//             applied while weave, fringe or scan is on
// Constant:
//   fringe    red -fringe px, blue +fringe px, global                      default 1.5
//   scan      Gaussian blur of `scan` px, then an unsharp mask (`radius` 5 px, `sharpen` 0.6) so
//             vector edges lose their digital tell                         default 2
//   vignette  multiply, darkening the frame's edges by this fraction       default 0.35
//   grain     strength of K.grain, placed last above everything            default false (a film
//             that already calls K.grain keeps it; after finish() it lands above the softening too)
// Everything on stage.dom lands under the wrapper, and so does whatever is built on stage.dom
// afterwards: a layer that must stay clean (an end card) goes on a div of its own appended to
// stage.root after finish(), with stage.dom swapped to it while it is built.
// Every step is off with `false` (or 0); with all off nothing is touched. Returns
// { draw(t), wrap, overlay }: `wrap` holds the composite, `overlay` the vignette and grain.
export function finish(
  stage,
  {
    fps = 24,
    seed = 1,
    flicker = 0.03,
    weave = 1,
    scale = 1.02,
    fringe = 1.5,
    scan = 2,
    sharpen = 0.6,
    radius = 5,
    vignette = 0.35,
    grain: grainStrength = false,
  } = {},
) {
  const o = {
    fps,
    seed,
    flicker: amount("flicker", flicker),
    weave: amount("weave", weave),
    fringe: amount("fringe", fringe),
    scan: amount("scan", scan),
    vignette: amount("vignette", vignette),
    grain: amount("grain", grainStrength),
  };
  if (o.vignette >= 1) throw new Error(`finish: vignette must be below 1, got ${vignette}`);
  if (!(scale >= 1)) throw new Error(`finish: scale must be at least 1, got ${scale}`);
  if (![o.flicker, o.weave, o.fringe, o.scan, o.vignette, o.grain].some(Boolean)) return { draw() {}, wrap: null, overlay: null };

  const n = ++finishes;
  const { root } = stage;
  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${stage.W}px`,
    height: `${stage.H}px`,
    transformOrigin: "50% 50%",
    background: root.style.background,
  });
  wrap.append(...root.childNodes);
  const overlay = document.createElement("div");
  Object.assign(overlay.style, { position: "absolute", left: "0", top: "0", width: `${stage.W}px`, height: `${stage.H}px`, pointerEvents: "none" });
  root.append(wrap, overlay);
  stage.overlay = overlay;
  stage.overlayDom = stage.dom; // the layer the finish wrapped: only a grain built on it goes to the overlay

  // The filter: scan softening first, then the channel fringe on the softened picture.
  let prims = "";
  let last = "SourceGraphic";
  if (o.scan) {
    prims += `<feGaussianBlur in="${last}" stdDeviation="${o.scan}" result="soft"/>`;
    last = "soft";
    if (sharpen) {
      const k = amount("sharpen", sharpen);
      prims += `<feGaussianBlur in="soft" stdDeviation="${amount("radius", radius)}" result="veil"/>
        <feComposite in="soft" in2="veil" operator="arithmetic" k1="0" k2="${1 + k}" k3="${-k}" k4="0" result="scanned"/>`;
      last = "scanned";
    }
  }
  if (o.fringe) {
    // Each channel on its own, red pulled left and blue pushed right, then screened back together.
    const only = (m, result) => `<feColorMatrix in="${last}" type="matrix" values="${m}" result="${result}"/>`;
    prims += `${only("1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0", "r0")}
      ${only("0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0", "g0")}
      ${only("0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0", "b0")}
      <feOffset in="r0" dx="${-o.fringe}" dy="0" result="r1"/>
      <feOffset in="b0" dx="${o.fringe}" dy="0" result="b1"/>
      <feBlend in="r1" in2="g0" mode="screen" result="rg"/>
      <feBlend in="rg" in2="b1" mode="screen"/>`;
  }
  const fid = `finish${n}`;
  if (prims) {
    const svg = document.createElementNS(SVG_NS, "svg");
    Object.assign(svg.style, { position: "absolute", width: "0", height: "0" });
    svg.innerHTML = `<filter id="${fid}" color-interpolation-filters="sRGB">${prims}</filter>`;
    overlay.append(svg);
  }
  const zoom = o.weave || o.fringe || o.scan ? scale : 1;

  if (o.vignette) {
    // Multiply by grey: 1 - strength where the frame's edges meet its axes (71% of the way to the
    // corner), a little more in the corners; clear inside the middle third. The 100% mark is the corner.
    const g = (k) => Math.round(255 * (1 - o.vignette * k));
    const stop = (k, at) => `rgb(${g(k)} ${g(k)} ${g(k)}) ${at}%`;
    const v = document.createElement("div");
    Object.assign(v.style, {
      position: "absolute",
      inset: "0",
      mixBlendMode: "multiply",
      background: `radial-gradient(ellipse farthest-corner at 50% 50%, #fff 30%, ${stop(0.2, 52)}, ${stop(1, 71)}, ${stop(1.6, 100)})`,
    });
    overlay.append(v);
  }
  const film = o.grain ? grain(stage, { strength: o.grain, parent: overlay }) : null;

  return {
    wrap,
    overlay,
    draw(t) {
      const f = finishFrame(t, o);
      if (zoom !== 1 || o.weave) wrap.style.transform = `translate(${f.dx}px, ${f.dy}px) scale(${zoom})`;
      const fx = [prims && `url(#${fid})`, o.flicker && `brightness(${f.gain})`].filter(Boolean);
      if (fx.length) wrap.style.filter = fx.join(" ");
      film?.draw(t);
    },
  };
}

// A photograph (a place, a painting) under a slow camera drift: the illustration's ground.
export function photo(
  stage,
  {
    src,
    x = 0,
    y = 0,
    w = stage.W,
    h = stage.H,
    tIn = 0,
    tOut,
    drift = 0.06,
    from = 1.0,
  },
) {
  const box = div(stage, {
    overflow: "hidden",
    width: `${w}px`,
    height: `${h}px`,
    transform: `translate(${x}px, ${y}px)`,
  });
  const img = div(
    stage,
    {
      width: `${w}px`,
      height: `${h}px`,
      background: `url(${src}) center/cover`,
    },
    "",
    box,
  );
  return {
    box,
    img,
    draw(t) {
      const p = clamp((t - tIn) / 8);
      img.style.transform = `scale(${from + drift * p}) translateY(${-20 * p}px)`;
      const l = leave(t, tOut, S.heavy);
      box.style.transform = `translate(${x}px, ${y - stage.H * l}px)`;
      show(box, t >= tIn && l < 0.999);
    },
  };
}

// ── The end ───────────────────────────────────────────────────────────────────────────────

// A closing lockup: the mark in the display face, an optional slogan under it, an accent rule,
// and an optional mono note (where to find it). The project supplies every word.
export function lockup(stage, { tIn, night = false, mark, slogan, note }) {
  if (!mark) throw new Error("lockup: `mark` (the wordmark text) is required");
  const { box } = stage;
  const fg = night ? C().nightInk : C().ink;
  const y0 = stage.H * 0.4;
  const parts = [
    word(stage, { text: mark, face: "display", size: 150, x: box.x, y: y0, color: fg, tIn }),
  ];
  if (slogan)
    parts.push(word(stage, { text: slogan, face: "serif", size: 64, x: box.x + 6, y: y0 + 170, color: fg, tIn: tIn + 0.25 }));
  parts.push(rubric(stage, { x: box.x + 6, y: y0 + 262, w: 420, tIn: tIn + 0.5, width: 8 }));
  if (note) parts.push(tag(stage, { text: note, x: box.x + 6, y: y0 + 300, night, tIn: tIn + 0.7 }));
  return {
    // The wordmark rises on `heavy` and is set when that lands; the bell closes the lockup.
    cues: () => [{ t: landsAt(tIn, S.heavy), type: "stamp" }, { t: landsAt(tIn, S.heavy) + 0.5, type: "bell", gain: 0.6 }],
    draw(t) {
      for (const c of parts) c.draw(t);
    },
  };
}

// ── Captions, marks and writing ────────────────────────────────────────

// Lead word + key word: a small body-face lead-in, then the key word in the display face,
// in the accent when it is the point. x, y = top-left of the lead.
export function caption(stage, { lead = "", key, x, y, size = 150, accent = false, night = false, tIn, tOut }) {
  const fg = night ? C().nightInk : C().ink;
  const a = lead ? word(stage, { text: lead, face: "body", size: size * 0.32, x: x + 6, y, color: fg, tIn, tOut }) : null;
  const b = word(stage, {
    text: key, face: "display", size, x, y: y + (lead ? size * 0.36 : 0),
    color: accent ? C().accent : fg, tIn: tIn + (lead ? 0.12 : 0), tOut,
  });
  return {
    draw(t) {
      a?.draw(t);
      b.draw(t);
    },
  };
}

// Ink poured onto the table (poured, never stamped): a drop falls from `from`
// (default: above the frame), lands at (x, y) at tIn, flings droplets around and spreads into a
// blot with a living edge. Create it BEFORE the piece it sits behind. r = final radius.
//
// As a transition (frame px; build it on stage.dom, over the outgoing shot):
//   cover: true    the blot spreads until it fills the whole frame (r is worked out); `done` =
//                  the moment no corner is left
//   reveal: el     the ink carries the next shot: `el` (a full-frame shot built ABOVE the
//                  outgoing one) shows inside the spreading blot, a band of ink running ahead of
//                  it, its edge a seeded fbm outline that changes as it soaks out
//   matte: { clip, at }  real ink footage (a makeClip of black ink on white, e.g. a splatter
//                  landing) multiplied over the frame, its frame `at` s on the drop's contact;
//                  shown until the frame is covered (or tOut). The procedural blot stays under it.
//   out: el        the outgoing shot, hidden once the frame is covered (it lies under `reveal`)
export function inkBlot(stage, { x, y, r = 300, tIn, tOut, seed = 11, from, cover = false, reveal, out, matte, ring = 64 }) {
  const id = `blot${seed}${Math.round(x)}${Math.round(y)}`;
  const { W, H } = stage;
  const WOB = 0.22; // how far the fbm edge strays from the circle, as a share of the radius
  const far = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(([cx, cy]) => Math.hypot(cx - x, cy - y)));
  // Big enough that the edge's deepest bay still clears the farthest corner.
  const R = cover || reveal ? (far + ring) / (1 - WOB) + 8 : r;
  const src = from ?? { x: x + 60, y: y - 1400 };
  const fall = 0.32;
  const rr = rng(seed);
  const drops = Array.from({ length: 9 }, () => {
    const a = rr() * Math.PI * 2;
    return { a, d: Math.min(R, r) * (0.75 + rr() * 0.7), s: 7 + rr() * 20 };
  });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "1");
  svg.setAttribute("height", "1");
  Object.assign(svg.style, { position: "absolute", left: "0", top: "0", overflow: "visible" });
  svg.innerHTML = `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
      <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="3" seed="${seed}"/>
      <feDisplacementMap in="SourceGraphic" scale="64" xChannelSelector="R" yChannelSelector="G"/></filter>
    <g fill="${C().accent}">
      <ellipse class="drop" rx="16" ry="30"/>
      <g filter="url(#${id})">${reveal ? `<polygon class="blot"/>` : `<circle class="blot" cx="${x}" cy="${y}" r="0"/>`}
      ${drops.map(() => `<circle class="spl" r="0"/>`).join("")}</g>
    </g>`;
  if (reveal) reveal.before(svg);
  else stage.dom.append(svg);
  const drop = svg.querySelector(".drop");
  const blot = svg.querySelector(".blot");
  const spl = [...svg.querySelectorAll(".spl")];
  // The soaked outline: radius at angle a when the spread is at e (0..1), the edge wandering
  // as it goes (the same fbm field sampled further on, never re-rolled).
  const edge = fbm(seed, { octaves: 4, periodX: 8 });
  const N = 96;
  const outline = (rad, e, inset = 0) =>
    Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2;
      const k = Math.max(0, rad * e * (1 + WOB * edge((i / N) * 8, e * 1.5)) - inset);
      return [x + Math.cos(a) * k, y + Math.sin(a) * k];
    });
  const spread = (t) => spring(t - tIn, 70, 16);
  // The spread at which the edge's nearest point (minus the ink band) clears the farthest corner.
  const coverAt = (() => {
    if (!(cover || reveal)) return null;
    for (let u = 0.001; u < 8; u += 0.001) {
      const e = spread(tIn + u);
      if (outline(R, e, reveal ? ring : 0).every(([px, py]) => Math.hypot(px - x, py - y) >= far)) return tIn + u;
    }
    return null;
  })();
  const shownUntil = coverAt ?? tOut;
  if (matte) {
    Object.assign(matte.clip.el.style, { width: `${W}px`, height: `${H}px`, objectFit: "cover", mixBlendMode: "multiply", pointerEvents: "none" });
    (reveal ?? svg).after(matte.clip.el);
  }
  return {
    // The frame is all ink (cover) or all next shot (reveal) from here on.
    done: coverAt,
    cues: () => [{ t: tIn, type: "drip" }, { t: tIn + 0.02, type: "splash", gain: 0.5 }],
    draw(t) {
      const l = leave(t, tOut);
      // The fall: accelerating along its path.
      const f = progress(t, tIn - fall, tIn);
      drop.setAttribute("cx", String(src.x + (x - src.x) * f * f));
      drop.setAttribute("cy", String(src.y + (y - src.y) * f * f));
      drop.style.visibility = f > 0 && f < 1 ? "visible" : "hidden";
      // The impact: a fast spread that slows, like ink soaking into paper.
      const e = spread(t);
      if (reveal) {
        const pts = (inset) => outline(R, e, inset).map(([px, py]) => `${px.toFixed(1)}px ${py.toFixed(1)}px`);
        blot.setAttribute("points", outline(R, e).map((p) => p.join(",")).join(" "));
        const covered = coverAt != null && t >= coverAt;
        reveal.style.clipPath = covered ? "" : t < tIn ? "polygon(0 0, 0 0, 0 0)" : `polygon(${pts(ring).join(",")})`;
      } else blot.setAttribute("r", String(Math.max(0, R * e * (1 - l))));
      const p = spring(t - tIn, 140, 18);
      spl.forEach((c, i) => {
        const d = drops[i];
        c.setAttribute("cx", String(x + Math.cos(d.a) * d.d * p));
        c.setAttribute("cy", String(y + Math.sin(d.a) * d.d * p));
        c.setAttribute("r", String(t >= tIn ? d.s * Math.min(1, (t - tIn) * 8) * (1 - l) : 0));
      });
      const gone = coverAt != null && t >= coverAt;
      show(svg, t >= tIn - fall && !(reveal && gone));
      if (out) out.style.display = gone ? "none" : ""; // not visibility: its pieces set their own
      if (matte) {
        const on = t >= tIn && (shownUntil == null || t < shownUntil);
        show(matte.clip.el, on);
        if (on) matte.clip.at((matte.at ?? 0) + (t - tIn));
      }
    },
  };
}

// Highlighter: an accent-wash stroke sweeping behind a line of text, multiplied
// into the paper like real ink. Create it BEFORE the text it marks.
// rot: its tilt in degrees (default a hand's −0.6°; add the page's own turn when it lies on a
// turned scan). It must share a stacking context with what it marks: never wrap it in a
// transformed group of its own, or multiply has nothing to blend with.
export function highlight(stage, { x, y, w, h = 70, tIn, tOut, color = C().accentWash, rot = -0.6 }) {
  const el = div(stage, {
    height: `${h}px`, background: color, mixBlendMode: "multiply", transformOrigin: "0 50%",
    borderRadius: "2px 6px 4px 3px", transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scaleX(0)`,
  });
  el.style.width = `${w}px`;
  return {
    // The sweep takes 0.45 s: the marker sounds for that long.
    cues: () => [{ t: tIn, type: "marker", len: 0.45 }],
    draw(t) {
      const p = clamp(progress(t, tIn, tIn + 0.45) ** 0.85);
      el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scaleX(${p})`;
      el.style.opacity = String(1 - leave(t, tOut));
    },
  };
}

// A pen writing a line: the text revealed left to right behind a moving nib, ink bleeding a
// hair. The theme's script (cursive) family, else the serif in italic.
export function handwrite(stage, { text, x, y, size = 72, tIn, dur = 1.6, tOut, color = C().accentInk }) {
  const face = F().script ?? F().serif;
  const el = div(stage, {
    font: `${F().script ? "normal" : "italic"} 400 ${size}px/1.2 ${css(face)}`, color, whiteSpace: "nowrap",
    filter: "blur(0.3px)", transform: `translate(${x}px, ${y}px)`,
  }, text);
  return {
    cues: () => [{ t: tIn, type: "pen", len: Math.min(dur, 1.5) }],
    // The moment the nib reaches the end (for a pen SFX cue).
    end: tIn + dur,
    draw(t) {
      const p = progress(t, tIn, tIn + dur);
      el.style.clipPath = `inset(-20% ${100 - p * 100}% -20% 0)`;
      el.style.opacity = String(1 - leave(t, tOut));
      show(el, t >= tIn);
    },
  };
}

// A line written by hand: revealed left to right at the pen's pace (a spring, finished on time:
// revealProgress), the last glyph fully shown at tIn + dur. `parent` puts it on a piece
// (a clipping's .el) instead of the stage. dur defaults to when the spring has visibly arrived.
export function handText(
  stage,
  { text, x = 0, y = 0, size = 56, face = F().script ?? F().serif, color = C().ink, tIn, k = 40, d = 12.6, dur, gain = 0.55, parent = stage.dom },
) {
  const span = dur ?? springReach(k, d, 0.97) ?? 1;
  const el = div(stage, {
    font: `400 ${size}px/1.2 ${css(face)}`, color, whiteSpace: "nowrap", transform: `translate(${x}px, ${y}px)`,
  }, text, parent);
  return {
    el,
    end: tIn + span,
    cues: () => [{ t: tIn, type: "pen", gain, len: Math.min(span, 1.5) }],
    draw(t) {
      const p = revealProgress(t, tIn, { k, d, dur: span });
      // Once written there is no clip at all: it would crop the last glyph's overhang.
      el.style.clipPath = p >= 1 ? "none" : `inset(-30% ${100 - p * 100}% -30% -5%)`;
      show(el, t >= tIn);
    },
  };
}

// A typewriter line: characters strike one by one (cps per second) with a carriage-bell "tim"
// at the end. keys() gives the strike times for SFX cues (type) and end for the bell (ding).
export function typewriter(stage, { text, x, y, size = 46, tIn, cps = 14, tOut, night = false }) {
  const face = F().typewriter ?? F().mono;
  const el = div(stage, {
    font: `400 ${size}px/1.35 ${css(face)}`, color: night ? C().nightInk : C().ink, whiteSpace: "pre",
    transform: `translate(${x}px, ${y}px)`,
  });
  const n = [...text].length;
  return {
    // Character i is on screen from tIn + (i + 1) / cps (draw shows floor((t - tIn) * cps) of them),
    // so that is when its key is heard; the bell follows the last one.
    cues: () => [
      ...[...text].map((c, i) => (c === " " ? null : { t: tIn + (i + 1) / cps, type: "key", gain: 0.6 })).filter(Boolean),
      { t: tIn + n / cps + 0.05, type: "ding" },
    ],
    end: tIn + n / cps,
    keys: () => [...text].map((c, i) => (c === " " ? null : tIn + (i + 1) / cps)).filter((v) => v != null),
    draw(t) {
      const k = Math.max(0, Math.min(n, Math.floor((t - tIn) * cps + 1e-6)));
      el.textContent = [...text].slice(0, k).join("");
      // Never an empty strip (a padded box would show as a blank dash) and never a fading ghost:
      // hidden until the first key strikes, and gone once it has left.
      const lv = leave(t, tOut);
      el.style.opacity = String(1 - lv);
      show(el, k > 0 && lv < 0.98);
    },
  };
}

// An inkwell knocked over (the ink must have its cause on screen, or a red blot reads as
// blood). A real inkwell cut-out slides in from a corner, tips over around its base at tIn with a
// small bounce, and the ink pours from its mouth into a puddle that runs the way it fell.
// base: where the inkwell's base rests (table px); mouth / pivot: where its opening and its base
// centre are in the PNG (0..1 of its width/height); dir: 1 tips right, -1 left; r: puddle length.
// Create it BEFORE the pieces that should lie on top of the ink (the portrait, the quill).
export function inkSpill(stage, {
  img, w = 260, base, mouth = { x: 0.5, y: 0.08 }, pivot = { x: 0.5, y: 0.97 }, dir = 1,
  tIn, enterAt, from = "tl", r = 420, color = C().accentInk, seed = 21,
}) {
  const h = (img.naturalHeight / img.naturalWidth) * w;
  const id = `spill${seed}`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "1");
  svg.setAttribute("height", "1");
  Object.assign(svg.style, { position: "absolute", left: "0", top: "0", overflow: "visible" });
  // The mouth once fallen (rotate the mouth around the pivot by ~84°).
  const ang = (dir * 84 * Math.PI) / 180;
  const mx = (mouth.x - pivot.x) * w;
  const my = (mouth.y - pivot.y) * h;
  const out = { x: base.x + mx * Math.cos(ang) - my * Math.sin(ang), y: base.y + mx * Math.sin(ang) + my * Math.cos(ang) };
  const rr = rng(seed);
  const lobes = Array.from({ length: 5 }, (_, i) => ({
    d: (0.15 + i * 0.2) * r, off: (rr() - 0.5) * r * 0.35, s: r * (0.32 - i * 0.035), at: i * 0.12,
  }));
  svg.innerHTML = `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%">
      <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="3" seed="${seed}"/>
      <feDisplacementMap in="SourceGraphic" scale="48" xChannelSelector="R" yChannelSelector="G"/></filter>
    <g fill="${color}" filter="url(#${id})">${lobes.map(() => `<ellipse class="lobe"/>`).join("")}
      <path class="stream" fill="none" stroke="${color}" stroke-linecap="round"/></g>`;
  stage.dom.append(svg);
  const lobeEls = [...svg.querySelectorAll(".lobe")];
  const stream = svg.querySelector(".stream");
  const well = img.cloneNode();
  Object.assign(well.style, {
    position: "absolute", left: "0", top: "0", width: `${w}px`, height: `${h}px`,
    transformOrigin: `${pivot.x * 100}% ${pivot.y * 100}%`,
  });
  stage.dom.append(well);
  stage.pending.push(well.decode().catch(() => {}));
  const t0 = enterAt ?? tIn - 0.9;
  const far = { tl: [-stage.W, -stage.H * 0.5], tr: [stage.W, -stage.H * 0.5], bl: [-stage.W, stage.H * 0.5], br: [stage.W, stage.H * 0.5] }[from];
  const fx = Math.cos(ang - (dir * Math.PI) / 2);
  const fy = Math.sin(ang - (dir * Math.PI) / 2);
  return {
    // The well slides in from t0 and settles; it tips on `tip` (a spring that bounces: the first
    // time it reaches the table is the thud); the ink runs from tIn + 0.25 (stream) and its lobes
    // spread from tIn + 0.3 (splash).
    cues: () => [
      { t: t0, type: "paper-slide", gain: 0.7 },
      { t: landsAt(t0, { k: 70, d: 15 }), type: "thud-soft", gain: 0.5 },
      { t: tIn + springReach(120, 11, 0.99), type: "thud-soft", gain: 0.9 },
      { t: tIn + 0.27, type: "pour", len: 0.9 },
      { t: tIn + 0.32, type: "splash", gain: 0.5 },
    ],
    draw(t) {
      // Slide in from the corner, then tip over around the base with a little bounce.
      const e = spring(t - t0, 70, 15);
      const tip = spring(t - tIn, 120, 11);
      const sx = far[0] * (1 - e);
      const sy = far[1] * (1 - e);
      well.style.transform =
        `translate(${base.x - pivot.x * w + sx}px, ${base.y - pivot.y * h + sy}px) rotate(${dir * 84 * tip}deg)`;
      well.style.filter = `drop-shadow(0 ${3 + 10 * (1 - e)}px ${4 + 14 * (1 - e)}px rgba(20,12,4,.45))`;
      show(well, t >= t0 - 0.01);
      // The ink: a stream from the mouth while it empties, then lobes running the way it fell.
      const p = progress(t, tIn + 0.25, tIn + 0.7);
      const pour = t > tIn + 0.25;
      stream.setAttribute("d", `M ${out.x} ${out.y} L ${out.x + fx * r * 0.25 * p} ${out.y + fy * r * 0.25 * p}`);
      stream.setAttribute("stroke-width", String(pour ? 34 * (1 - progress(t, tIn + 0.7, tIn + 1.2)) : 0));
      lobeEls.forEach((el, i) => {
        const L = lobes[i];
        const g = spring(t - tIn - 0.3 - L.at, 60, 15);
        el.setAttribute("cx", String(out.x + fx * L.d * g - fy * L.off * g));
        el.setAttribute("cy", String(out.y + fy * L.d * g + fx * L.off * g));
        el.setAttribute("rx", String(Math.max(0, L.s * 1.25 * g)));
        el.setAttribute("ry", String(Math.max(0, L.s * 0.85 * g)));
      });
      show(svg, pour);
    },
  };
}

// Editorial moves built on these components (heroWord, counter, docZoom, route, split).
export * from "./moves.js";

export * from "./choreo.js";
export * from "./paper.js";
export * from "./outline.js";
// Paper transitions (tearReveal, pageTurn, zoomThrough) and tapeOn.
export * from "./transitions.js";
