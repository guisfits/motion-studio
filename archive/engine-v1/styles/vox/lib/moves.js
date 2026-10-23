// Editorial moves (the Vox grammar: hero words, counters, document zooms, routes, splits), built
// on the vox components and re-exported by kit.js, so a film needs one `import * as K from ".../kit.js"`.
// Same contract as the kit: build once, draw(t) paints any t, cues() lists the sounds.
//
//   heroWord  a huge display-face word cropped by the frame edge, behind the subject
//   counter   typewriter or odometer numbers (years, counts)
//   docZoom   push the camera to a quote on a scan, a highlighter sweeping the word
//   route     an accent rubric line drawn point to point with an arrowhead (timelines, maps)
//   split     two artefacts compared on one torn seam

import { spring, springReach, SPRINGS, progress, rng, clamp, stepped } from "../../../core/lib/motion.js";
import { theme } from "../../../core/lib/theme.js";
import { piece, highlight } from "./kit.js";
const C = () => theme().colors;
const F = () => theme().families;

const S = SPRINGS;
const SVG_NS = "http://www.w3.org/2000/svg";
const css = (s) => s.replaceAll('"', "'");
const show = (el, on) => (el.style.visibility = on ? "visible" : "hidden");
const div = (parent, style = {}, html = "") => {
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
};
const leave = (t, tOut, sp = S.default) =>
  tOut == null ? 0 : spring(t - tOut, sp.k, sp.d);

// ── heroWord ────────────────────────────────────────────────────────────────────────────────

// The "subject in front of a huge word" move: a display-face word at 380–520 px
// that bleeds off one edge of the frame (bleed: the share of the word left outside), slammed on
// like a stamp or slid in from that edge, set BEHIND a subject cut-out. behind: the piece (or an
// element) the word must sit under; the word is inserted just before it in the DOM, so build the
// subject first. y = top of the word; frame: the width the word is cropped by (default stage.W,
// for a screen-space beat; pass the station's frame width when it lives on the table).
export function heroWord(
  stage,
  {
    text,
    size = 440,
    y,
    x,
    rot = -4,
    tIn,
    tOut,
    behind,
    edge = "right",
    bleed = 0.22,
    enter = "stamp",
    color,
    night = false,
    frame = stage.W,
  },
) {
  if (size < 380) throw new Error(`heroWord: ${size}px is not a hero (≥ 380)`);
  const el = div(
    stage.dom,
    {
      font: `400 ${size}px/0.9 ${css(F().display)}`,
      whiteSpace: "nowrap",
      color: color ?? (night ? C().nightInk : C().ink),
      transformOrigin: "50% 60%",
    },
    text,
  );
  const target = behind?.el ?? behind;
  if (target?.parentNode) target.before(el);
  const w = el.offsetWidth || size * text.length * 0.55;
  const h = el.offsetHeight || size * 0.9;
  // Cropped on purpose: `bleed` of the word lies past the chosen edge.
  const x0 = x ?? (edge === "right" ? frame - w * (1 - bleed) : -w * bleed);
  const dir = edge === "right" ? 1 : -1;
  return {
    el,
    w,
    h,
    x: x0,
    y,
    // Stamped: the word falls for 0.12 s and the paper takes it then (that is the contact). Slid:
    // the whoosh peaks halfway along the spring and the word lands where it reaches 95%.
    cues: () =>
      enter === "stamp"
        ? [{ t: tIn + 0.12, type: "stamp" }]
        : [
            { t: tIn + springReach(110, 19, 0.5), type: "whoosh", gain: 0.6 },
            { t: tIn + springReach(110, 19), type: "paper-place", gain: 0.6 },
          ],
    draw(t) {
      const l = leave(t, tOut, S.heavy);
      let tf;
      if (enter === "stamp") {
        // Slammed down: from 1.35× and lifted, onto the paper with a short squash and recoil.
        const s = t - tIn;
        const fall = clamp(s / 0.12);
        const knock =
          s > 0.12 ? Math.exp(-14 * (s - 0.12)) * Math.sin(38 * (s - 0.12)) : 0;
        const sc = 1 + 0.35 * (1 - fall * fall) - 0.03 * knock;
        tf = `translate(${x0}px, ${y + 40 * l}px) rotate(${rot}deg) scale(${sc}, ${sc + 0.04 * knock})`;
        el.style.opacity = String(clamp(s / 0.06) * (1 - l));
      } else {
        // Slid in from its edge (it was already there, off frame), landing with a heavy spring.
        const e = spring(t - tIn, 110, 19);
        tf = `translate(${x0 + dir * (frame * 0.9) * (1 - e) + dir * frame * l}px, ${y}px) rotate(${rot}deg)`;
        el.style.opacity = "1";
      }
      el.style.transform = tf;
      show(el, t >= tIn && l < 0.999);
    },
  };
}

// ── counter ─────────────────────────────────────────────────────────────────────────────────

// A number counting from `from` to `to` over dur (an ease-out: fast, then each last step heard).
// face: "type" (typewriter: the value re-struck on a mono strip, a key per step, a bell at the
// end) | "odometer" (rolling digit drums in the house roman, a soft tick per step).
// x, y = top-left; prefix/suffix: text around it ("131 anos"); pad: minimum digits.
export function counter(
  stage,
  {
    from,
    to,
    tIn,
    dur = 1.2,
    face = "type",
    x,
    y,
    size = 160,
    prefix = "",
    suffix = "",
    pad = 0,
    night = false,
    color,
    tOut,
    maxCps = 18,
  },
) {
  const fg = color ?? (night ? C().nightInk : C().ink);
  const font =
    face === "type" ? (F().typewriter ?? F().mono) : F().serif;
  const digits = Math.max(
    pad,
    String(Math.max(Math.abs(from), Math.abs(to))).length,
  );
  const ease = (p) => 1 - (1 - p) ** 3;
  const value = (t) => from + (to - from) * ease(progress(t, tIn, tIn + dur));
  // The time the count reaches k (inverse of the ease), for one cue per step.
  const timeOf = (k) =>
    tIn + dur * (1 - (1 - (k - from) / (to - from)) ** (1 / 3));
  const steps = [];
  const sgn = Math.sign(to - from) || 1;
  for (let k = from + sgn; sgn > 0 ? k <= to : k >= to; k += sgn)
    steps.push(timeOf(k));
  // Never a machine-gun: at most maxCps cues per second (the last step always sounds).
  const heard = [];
  for (const t of steps)
    if (!heard.length || t - heard[heard.length - 1] >= 1 / maxCps)
      heard.push(t);
  if (steps.length && heard[heard.length - 1] !== steps[steps.length - 1])
    heard.push(steps[steps.length - 1]);
  const box = div(stage.dom, {
    font: `400 ${size}px/1 ${css(font)}`,
    color: fg,
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "flex-start",
    fontVariantNumeric: "lining-nums tabular-nums",
  });
  if (prefix) div(box, { position: "static" }, prefix);
  let drums = [];
  let text = null;
  if (face === "odometer") {
    // One drum per digit: 0..9 then 0 again, in a one-digit window.
    drums = Array.from({ length: digits }, () => {
      const win = div(box, {
        position: "relative",
        overflow: "hidden",
        height: `${size}px`,
        width: "0.62em",
        // The drum's curvature: digits roll out of shadow at the top and bottom of the window.
        WebkitMaskImage: "linear-gradient(transparent, #000 16%, #000 84%, transparent)",
        maskImage: "linear-gradient(transparent, #000 16%, #000 84%, transparent)",
      });
      const strip = div(
        win,
        { width: "100%", textAlign: "center" },
        Array.from(
          { length: 11 },
          (_, i) => `<div style="height:${size}px;line-height:${size}px">${i % 10}</div>`,
        ).join(""),
      );
      return strip;
    });
  } else {
    text = div(box, { position: "static" }, "");
  }
  if (suffix) div(box, { position: "static", marginLeft: "0.25em" }, suffix);
  return {
    el: box,
    value,
    cues: () => [
      ...heard.map((t) => ({
        t,
        type: "key",
        gain: face === "type" ? 0.6 : 0.35,
      })),
      {
        t: tIn + dur + 0.04,
        type: face === "type" ? "ding" : "thud-soft",
        gain: 0.6,
      },
    ],
    draw(t) {
      const l = leave(t, tOut);
      const v = value(t);
      if (face === "odometer") {
        // Digit i turns continuously only while every lower digit rolls over (a real drum).
        const a = Math.abs(v);
        drums.forEach((strip, j) => {
          const i = digits - 1 - j;
          const unit = 10 ** i;
          const d = Math.floor(a / unit) % 10;
          const lower = a % unit;
          const carry = i === 0 ? a % 1 : clamp(lower - (unit - 1));
          strip.style.transform = `translateY(${-(d + carry) * size}px)`;
        });
      } else {
        // The typewriter re-strikes whole values: the shown number moves on a stepped clock.
        const shown = Math.round(value(stepped(t, maxCps)));
        text.textContent = String(Math.abs(shown))
          .padStart(digits, "0")
          .replace(/^0+(?=\d)/, (z) => (pad ? z : ""));
        if (shown < 0) text.textContent = `−${text.textContent}`;
      }
      box.style.transform = `translate(${x}px, ${y + 30 * l}px)`;
      box.style.opacity = String(1 - l);
      show(box, t >= tIn - 0.01 && l < 0.999);
    },
  };
}

// ── docZoom ─────────────────────────────────────────────────────────────────────────────────

// Vox moves #5 + #6 in one call: a scan (a page, a title page, a letter) laid on the table, the
// camera pushing in to one quote on it, the highlighter sweeping the spoken word.
//   at     the table or a station (its add/view place the page; rot follows the station)
//   img    the scan (a loaded image); x, y = its centre in at's coordinates; w = its width
//   rect   the quote, as fractions of the page { x, y, w, h }: the camera frames it
//   word   the word to sweep, fractions of the page { x, y, w, h } (default: rect)
//   tIn    when the push starts; the page lands at pageIn (default tIn − 0.7)
//   fill   how much of the frame width the quote fills (0.82)
// The film splices dz.keys into its camera keys (the wide look, then the push); dz.keys is
// [[t, key], …] in the shape table.camera takes.
export function docZoom(
  stage,
  {
    at,
    img,
    x,
    y,
    w,
    rot = 0,
    rect,
    word,
    tIn,
    pageIn,
    fill = 0.82,
    from = "below",
    hold = 1.2,
    ease = "move",
    edge = "border",
    color = C().accentWash,
  },
) {
  const h = (img.naturalHeight / img.naturalWidth) * w;
  const tPage = pageIn ?? tIn - 0.7;
  const station = at.view ? at : null;
  const [page] = at.add(() => [
    piece(stage, { img, w, x, y, rot, tIn: tPage, from, edge, height: 0.1 }),
  ]);
  // Page fractions → at's coordinates (the page is centred at x, y and turned by rot).
  const rad = (rot * Math.PI) / 180;
  const local = (fx, fy) => {
    const dx = (fx - 0.5) * w;
    const dy = (fy - 0.5) * h;
    return {
      x: x + dx * Math.cos(rad) - dy * Math.sin(rad),
      y: y + dx * Math.sin(rad) + dy * Math.cos(rad),
    };
  };
  const wd = word ?? rect;
  // The highlighter is placed straight in at's coordinates, turned like the page (a transformed
  // wrapper would isolate it and its multiply would blend with nothing).
  const hh = wd.h * h;
  const mid = local(wd.x, wd.y + wd.h / 2);
  const [hl] = at.add(() => [
    highlight(stage, { x: mid.x, y: mid.y - hh / 2, w: wd.w * w, h: hh, tIn: tIn + 0.55, color, rot: rot - 0.6 }),
  ]);
  const c = local(rect.x + rect.w / 2, rect.y + rect.h / 2);
  const z = (fill * stage.W) / (rect.w * w);
  const wide = local(0.5, 0.5);
  const key = (p, zz, e) =>
    station
      ? station.view(p.x, p.y, { z: zz, roll: rot, ease: e })
      : { x: p.x, y: p.y, z: zz, r: rot, ease: e };
  const fit = Math.min((stage.W * 0.9) / w, (stage.H * 0.8) / h);
  return {
    page,
    highlight: hl,
    // When the sweep is complete (the film can cut away after this).
    done: tIn + 1.0 + hold,
    keys: [
      [tPage, key(wide, fit, "move")],
      [tIn, key(c, z, ease)],
    ],
    cues: () => [...page.cues(), ...hl.cues()],
    draw(t) {
      page.draw(t);
      hl.draw(t);
    },
  };
}

// ── route ───────────────────────────────────────────────────────────────────────────────────

// An accent rubric line drawn point to point (timelines, journeys, maps): each leg drawn in
// turn, a dot left at every stop, an arrowhead riding the tip. points: [[x, y], …] in the
// coordinates of where it is built (screen, table or station); dur: the whole drawing.
// tip(t) gives { x, y, angle } so the camera can follow; follow(view) turns it into camera keys
// (one per stop, with view = station.view or a plain (x, y, opts) => key).
export function route(
  stage,
  {
    points,
    tIn,
    dur,
    width = 10,
    color = C().accent,
    dots = true,
    head = true,
    seed = 4,
    tOut,
  },
) {
  if (points.length < 2) throw new Error("route: needs at least two points");
  const legs = points.length - 1;
  const D = dur ?? 0.55 * legs;
  const r = rng(seed);
  // A hand-drawn leg: a gentle cubic bow, never a ruler line.
  const legPath = ([ax, ay], [bx, by]) => {
    const dx = bx - ax;
    const dy = by - ay;
    const bow = (r() - 0.5) * 0.25;
    const nx = -dy * bow;
    const ny = dx * bow;
    return `M ${ax} ${ay} C ${ax + dx * 0.33 + nx} ${ay + dy * 0.33 + ny}, ${ax + dx * 0.66 + nx} ${ay + dy * 0.66 + ny}, ${bx} ${by}`;
  };
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", "1");
  svg.setAttribute("height", "1");
  Object.assign(svg.style, {
    position: "absolute",
    left: "0",
    top: "0",
    overflow: "visible",
  });
  stage.dom.append(svg);
  const paths = points.slice(1).map((p, i) => {
    const el = document.createElementNS(SVG_NS, "path");
    el.setAttribute("d", legPath(points[i], p));
    Object.assign(el.style, {
      fill: "none",
      stroke: color,
      strokeWidth: String(width),
      strokeLinecap: "round",
    });
    svg.append(el);
    const len = el.getTotalLength();
    el.style.strokeDasharray = String(len);
    return { el, len };
  });
  const stops = points.map(([cx, cy]) => {
    const c = document.createElementNS(SVG_NS, "circle");
    c.setAttribute("cx", String(cx));
    c.setAttribute("cy", String(cy));
    c.setAttribute("fill", color);
    svg.append(c);
    return c;
  });
  const arrow = document.createElementNS(SVG_NS, "path");
  const a = width * 3.2;
  arrow.setAttribute("d", `M ${-a} ${-a * 0.62} L 0 0 L ${-a} ${a * 0.62}`);
  Object.assign(arrow.style, {
    fill: "none",
    stroke: color,
    strokeWidth: String(width),
    strokeLinecap: "round",
    strokeLinejoin: "round",
  });
  svg.append(arrow);
  const legT = D / legs;
  // When leg i starts and its progress at t (each leg eases in and lands).
  const legStart = (i) => tIn + i * legT;
  const legP = (t, i) => {
    const u = progress(t, legStart(i), legStart(i) + legT);
    return u * u * (3 - 2 * u);
  };
  const tip = (t) => {
    let i = 0;
    while (i < legs - 1 && t >= legStart(i + 1)) i++;
    const p = legP(t, i);
    const { el, len } = paths[i];
    const pt = el.getPointAtLength(len * p);
    const pb = el.getPointAtLength(Math.max(0, len * p - 2));
    const pa = el.getPointAtLength(Math.min(len, len * p + 0.01));
    const ang = Math.atan2(
      pt.y - pb.y || pa.y - pt.y,
      pt.x - pb.x || pa.x - pt.x,
    );
    return { x: pt.x, y: pt.y, angle: (ang * 180) / Math.PI, leg: i, p };
  };
  return {
    el: svg,
    tip,
    end: tIn + D,
    // Camera keys landing on each stop as the tip reaches it: view(x, y) → a table.camera key.
    follow(view, { lead = 0.12 } = {}) {
      return points.map(([px, py], i) => [
        Math.max(0, legStart(i) - (i ? legT * 0.5 : 0) - lead),
        view(px, py),
      ]);
    },
    // A pen sound per leg, for as long as the leg takes to draw.
    cues: () =>
      paths.map((_, i) => ({ t: legStart(i), type: "pen", gain: 0.7, len: Math.min(legT, 0.8) })),
    draw(t) {
      const l = leave(t, tOut);
      paths.forEach(({ el, len }, i) => {
        el.style.strokeDashoffset = String(len * (1 - legP(t, i)));
      });
      stops.forEach((c, i) => {
        const k =
          i === 0
            ? spring(t - tIn, 300, 26)
            : spring(t - legStart(i - 1) - legT, 300, 26);
        c.setAttribute("r", dots ? String(Math.max(0, width * 1.3 * k)) : "0");
      });
      const tp = tip(t);
      arrow.setAttribute(
        "transform",
        `translate(${tp.x} ${tp.y}) rotate(${tp.angle})`,
      );
      arrow.style.visibility = head && t >= tIn ? "visible" : "hidden";
      svg.style.opacity = String(1 - l);
      show(svg, t >= tIn && l < 0.999);
    },
  };
}

// ── split ───────────────────────────────────────────────────────────────────────────────────

// Two artefacts compared on one seam (1611 vs the app; a manuscript vs its print): a placed on
// the left (or top) half, b slid in from its side to meet it, the seam between them torn paper
// (seam: "tear", with the white fibre of the rip showing) or a straight cut ("cut").
// a, b: loaded images (or src strings), cropped to cover their half. x, y = top-left; w × h the
// whole panel; dir: "v" (side by side, the seam vertical) | "h" (stacked). at: optional split
// point (0..1).
export function split(
  stage,
  {
    a,
    b,
    x,
    y,
    w,
    h,
    tIn,
    seam = "tear",
    dir = "v",
    at = 0.5,
    seed = 9,
    tOut,
    gap = 0,
  },
) {
  const src = (im) => (typeof im === "string" ? im : im.src);
  const rr = rng(seed);
  const n = 30;
  const edge = Array.from({ length: n + 1 }, (_, i) => [
    i / n,
    at +
      (seam === "tear" ? (rr() - 0.5) * 0.035 + (i % 2 ? 0.006 : -0.006) : 0),
  ]);
  // The polygon of one side of the seam, in % of the panel; off pushes the seam (the fibre band).
  const poly = (side, off = 0) => {
    const line = edge.map(([u, v]) =>
      dir === "v"
        ? `${(v + off) * 100}% ${u * 100}%`
        : `${u * 100}% ${(v + off) * 100}%`,
    );
    const close =
      dir === "v"
        ? side === 0
          ? ["0% 100%", "0% 0%"]
          : ["100% 100%", "100% 0%"]
        : side === 0
          ? ["100% 0%", "0% 0%"]
          : ["100% 100%", "0% 100%"];
    // Walk the seam, then close around this side's far corners.
    return `polygon(${[...line, ...close].join(",")})`;
  };
  const wrap = div(stage.dom, {
    width: `${w}px`,
    height: `${h}px`,
    transform: `translate(${x}px, ${y}px)`,
  });
  const half = (im, side) => {
    const holder = div(wrap, { width: `${w}px`, height: `${h}px`, filter: "drop-shadow(0 8px 14px rgba(20,12,4,.38))" });
    // The rip's white fibre: a paper-coloured band a hair wider than the image on its seam.
    if (seam === "tear")
      div(holder, { width: `${w}px`, height: `${h}px`, background: "#f6f1e4", clipPath: poly(side, side ? -0.006 : 0.006) });
    const face = div(holder, { width: `${w}px`, height: `${h}px`, clipPath: poly(side) });
    // The image covers its own half (plus a margin under the ragged seam).
    const m = 0.04;
    const [lo, hi] = side ? [at - m, 1] : [0, at + m];
    const pic = document.createElement("img");
    pic.src = src(im);
    Object.assign(pic.style, {
      position: "absolute", objectFit: "cover",
      ...(dir === "v"
        ? { left: `${lo * w}px`, top: "0", width: `${(hi - lo) * w}px`, height: `${h}px` }
        : { left: "0", top: `${lo * h}px`, width: `${w}px`, height: `${(hi - lo) * h}px` }),
    });
    face.append(pic);
    stage.pending.push(pic.decode().catch(() => {}));
    return holder;
  };
  const A = half(a, 0);
  const B = half(b, 1);
  const off = dir === "v" ? [w, 0] : [0, h];
  return {
    el: wrap,
    // a lands where its spring reaches 95%; b slides in from tIn + 0.3 and meets it where its own
    // spring lands: that is the contact (a torn seam is heard as a tear, a cut one as a placement).
    cues: () => [
      { t: tIn + springReach(120, 18), type: "paper-place", gain: 0.7 },
      { t: tIn + 0.3, type: "paper-slide", gain: 0.8 },
      { t: tIn + 0.3 + springReach(90, 16), type: seam === "tear" ? "tear" : "paper-place", gain: seam === "tear" ? 0.7 : 0.6 },
    ],
    draw(t) {
      const l = leave(t, tOut, S.snappy);
      const ea = spring(t - tIn, 120, 18);
      const eb = spring(t - tIn - 0.3, 90, 16);
      A.style.transform = `translate(${-off[0] * 0.15 * (1 - ea) - gap}px, ${-off[1] * 0.15 * (1 - ea)}px) rotate(${-2 * (1 - ea)}deg)`;
      A.style.opacity = String(clamp(ea * 3));
      B.style.transform = `translate(${off[0] * 1.1 * (1 - eb) + gap}px, ${off[1] * 1.1 * (1 - eb)}px) rotate(${4 * (1 - eb)}deg)`;
      show(B, t >= tIn + 0.3);
      wrap.style.transform = `translate(${x}px, ${y + stage.H * l}px)`;
      show(wrap, t >= tIn && l < 0.999);
    },
  };
}
