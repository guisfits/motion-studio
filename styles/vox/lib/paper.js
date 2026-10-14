// A clipping on the table: a cut piece of paper (newsprint, magazine, papyrus, card, a cut print)
// driven by choreo.js. The pose gives where it is and what the hand is doing to it; here that
// becomes a transform, a stacking order, a two-layer shadow that grows with height, a corner curl,
// a fold, a turn-over and a crumple. Torn edges "boil": three hand-redrawn edges swap on the
// 12 fps clock, like paper animated on twos.
//
//   const c = clipping(stage, { img, w: 420, x, y, z: 3, moves: [{ kind: "slap", at: V.at("Lutero") }] });
//   stage.run((t) => c.draw(t));   window.CUES.push(...c.cues());

import { pose, contacts, boilStep } from "./choreo.js";
import { tornClip, halftoneFilter } from "./kit.js";
import { rng } from "../../../core/lib/motion.js";
import { theme } from "../../../core/lib/theme.js";

const EDGES = ["torn", "baked", "straight", "disc"];
const RIM = "#f4efe4"; // white fibre: the paper's core where a printed face was torn away
const SHADOW = "rgba(30,20,10,";
const PAPER = "#efe7d6"; // the paper's own tone: the curl flap, and a reverse nobody drew
// The folded-over triangle sits in the corner's box with its right angle at the box's inner corner.
const CURL_SHAPE = {
  tr: "polygon(0 0, 100% 100%, 0 100%)",
  tl: "polygon(100% 0, 0 100%, 100% 100%)",
  br: "polygon(0 0, 100% 0, 0 100%)",
  bl: "polygon(0 0, 100% 0, 100% 100%)",
};

export function clipping(
  stage,
  {
    img,
    back,
    w,
    h: hGiven,
    crop,
    color,
    rim = false,
    band,
    x,
    y,
    rot = 0,
    z = 0,
    moves = [],
    edge = "torn",
    boil = true,
    halftone = false,
    seed,
    parent = stage.dom,
  },
) {
  if (!EDGES.includes(edge))
    throw new Error(
      `clipping: edge "${edge}" is not one of ${EDGES.join(", ")}`,
    );
  if (!img && !color) throw new Error("clipping: give it an img or a color (flat paper)");
  // A crop [x0, y0, x1, y1] (fractions of the image) shows that part of a big scan: the piece's
  // height follows the crop's aspect unless h is given.
  const [cx0, cy0, cx1, cy1] = crop ?? [0, 0, 1, 1];
  const h =
    hGiven ??
    (img ? ((img.naturalHeight * (cy1 - cy0)) / (img.naturalWidth * (cx1 - cx0))) * w : w);
  const sd = seed ?? Math.round(Math.abs(x * 7 + y * 13 + w));
  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${w}px`,
    height: `${h}px`,
    transformOrigin: "50% 50%",
  });
  // The face: the image itself, a window on a crop of it, or flat coloured paper.
  let face;
  if (img && !crop) face = img.cloneNode();
  else {
    face = document.createElement("div");
    if (img) {
      const inner = img.cloneNode();
      const iw = w / (cx1 - cx0);
      const ih = (iw * img.naturalHeight) / img.naturalWidth;
      Object.assign(inner.style, { position: "absolute", width: `${iw}px`, height: `${ih}px`, left: `${-cx0 * iw}px`, top: `${-cy0 * ih}px`, maxWidth: "none" });
      face.style.overflow = "hidden";
      face.append(inner);
      stage.pending.push(inner.decode().catch(() => {}));
    } else face.style.background = color;
  }
  const rear = back ? back.cloneNode() : document.createElement("div");
  if (!back) rear.style.background = PAPER;
  for (const e of [face, rear])
    Object.assign(e.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
    });
  // The wrapper's x scale goes negative past the half turn and mirrors everything; the rear is
  // pre-mirrored so it reads right.
  rear.style.transform = "scaleX(-1)";
  // The curl: a lighter triangle of the paper's back, folded over the corner.
  // The shadow lives on the unclipped box, the clip on the shape inside it.
  const flap = document.createElement("div");
  const flapShape = document.createElement("div");
  Object.assign(flap.style, {
    position: "absolute",
    width: "0",
    height: "0",
    filter: `drop-shadow(-3px 3px 3px ${SHADOW}.35))`,
  });
  Object.assign(flapShape.style, { width: "100%", height: "100%", background: PAPER });
  flap.append(flapShape);
  wrap.append(face, rear, flap);
  // The rim: a band of white fibre where the paper was torn, under a face torn deeper. The wrapper's
  // filter makes it a stacking context, so z -1 stays inside the piece, under its face.
  const rimEl = rim ? document.createElement("div") : null;
  if (rimEl) {
    rimEl.dataset.part = "rim";
    Object.assign(rimEl.style, { position: "absolute", inset: "0", zIndex: "-1", background: rim === true ? RIM : rim.color ?? RIM });
    wrap.append(rimEl);
  }
  parent.append(wrap);
  if (face.decode) stage.pending.push(face.decode().catch(() => {}));
  if (back) stage.pending.push(rear.decode().catch(() => {}));
  const screen = halftone
    ? halftoneFilter(stage, halftone === true ? {} : halftone)
    : "";
  const edges = [0, 1, 2].map((i) =>
    band
      ? bandClip(band, sd, i)
      : edge === "disc"
        ? discClip(sd, i)
        : tornClip(sd + i * 101, 18, rim ? 6 : 4.5),
  );
  const rimEdges = [0, 1, 2].map((i) => tornClip(sd + i * 101 + 7, 18, 2));
  const jit = rng(sd);
  const jitter = [0, 1, 2].map(() => [
    (jit() - 0.5) * 1.2,
    (jit() - 0.5) * 1.2,
  ]);
  const curlCorner = moves.find((m) => m.kind === "peel")?.corner ?? "tr";
  if (!CURL_SHAPE[curlCorner])
    throw new Error(`clipping: peel corner "${curlCorner}" is not one of ${Object.keys(CURL_SHAPE).join(", ")}`);
  flapShape.style.clipPath = CURL_SHAPE[curlCorner];

  return {
    el: wrap,
    w,
    h,
    cues: () => contacts(moves),
    draw(t) {
      const p = pose(moves, t);
      // Gone (not yet slapped, or its exit move is over): the faces, the flap and whatever a film
      // added on the piece go with it. A child with its own `visibility: visible` shows through a
      // hidden parent, so the wrapper is taken out of the layout too.
      wrap.style.visibility = p.visible ? "visible" : "hidden";
      wrap.style.display = p.visible ? "" : "none";
      if (!p.visible) {
        for (const e of [face, rear, flap]) e.style.visibility = "hidden";
        return;
      }
      flap.style.visibility = "";
      const step = boil ? boilStep(t) : 0;
      if (edge === "torn" || edge === "disc" || band)
        for (const e of [face, rear]) e.style.clipPath = edges[step];
      if (rimEl) rimEl.style.clipPath = rimEdges[step];
      const [jx, jy] = edge === "baked" && boil ? jitter[step] : [0, 0];
      const lift = Math.max(0, p.lift);
      const squash = Math.min(0, p.lift); // overshoot: pressed into the table, a hair flatter
      const fold = p.fold,
        crum = p.crumple;
      const sx = (1 - 0.55 * crum) * Math.cos(Math.PI * p.flip);
      const sy = (1 - fold * 0.5) * (1 - 0.55 * crum) * (1 + squash * 0.3);
      // Half a level below the piece it slid under, so it never ties with it.
      const level = z + p.dz;
      wrap.style.zIndex = String(Math.round((p.under == null ? level : Math.min(level, p.under - 0.5)) * 10));
      wrap.dataset.fold = fold.toFixed(3);
      wrap.style.transform =
        `translate(${x - w / 2 + p.dx + jx}px, ${y - h / 2 + p.dy + jy}px) rotate(${rot + p.rot}deg) ` +
        `scale(${p.scale * (1 + 0.04 * lift)}) scale(${sx}, ${sy})`;
      face.style.visibility = p.flip < 0.5 ? "visible" : "hidden";
      rear.style.visibility = p.flip >= 0.5 ? "visible" : "hidden";
      // Folded half darkens (it faces away from the light); a crumpled ball is mottled grey.
      const shade = `brightness(${1 - 0.25 * fold - 0.3 * crum}) contrast(${1 + 0.4 * crum})`;
      face.style.filter = `${screen} ${shade}`;
      rear.style.filter = shade;
      const c = p.curl * Math.min(w, h) * 0.45;
      Object.assign(flap.style, {
        width: `${c}px`,
        height: `${c}px`,
        left: curlCorner.endsWith("r") ? `${w - c}px` : "0",
        top: curlCorner.startsWith("t") ? "0" : `${h - c}px`,
      });
      // The light is fixed on the table: the filter runs in the piece's own (turned, mirrored)
      // frame, so the offset is turned back to point straight down on screen.
      const hgt = Math.min(1, lift + 0.08);
      const a = ((rot + p.rot) * Math.PI) / 180;
      const down = (y) =>
        `${((sx < 0 ? -y : y) * Math.sin(a)).toFixed(2)}px ${(y * Math.cos(a)).toFixed(2)}px`;
      const s = 2 + 22 * hgt;
      wrap.style.filter = `drop-shadow(${down(1 + 2 * hgt)} ${1 + hgt}px ${SHADOW}.35)) drop-shadow(${down(s)} ${s * 1.4}px ${SHADOW}${(0.18 + 0.12 * hgt).toFixed(3)}))`;
    },
  };
}

// A horizontal band [a, b] (fractions of the height) with torn top and bottom. The line at a cut
// depends only on the cut, the seed and the boil step, so the band above and the band below share
// it exactly: the pieces fit until a move pushes one off line. 0 and 1 are the image's own edges.
function cutLine(f, seed, step) {
  const n = 28;
  if (f <= 0) return Array.from({ length: n + 1 }, (_, i) => [(i / n) * 100, -1]);
  if (f >= 1) return Array.from({ length: n + 1 }, (_, i) => [(i / n) * 100, 101]);
  const r = rng(Math.round(f * 1e4) * 31 + seed * 7 + step * 101);
  return Array.from({ length: n + 1 }, (_, i) => [(i / n) * 100, f * 100 + (r() - 0.5) * 1.6 + (i % 2 ? 0.25 : -0.25)]);
}
function bandClip([a, b], seed, step) {
  const pt = ([px, py]) => `${px.toFixed(2)}% ${py.toFixed(2)}%`;
  const top = cutLine(a, seed, step).map(pt);
  const bottom = cutLine(b, seed, step).reverse().map(pt);
  return `polygon(${[...top, ...bottom].join(", ")})`;
}
// A disc of cut card: a circle, a hair off round, redrawn on each boil step.
function discClip(seed, step) {
  const r = rng(seed + step * 101);
  return `ellipse(${(49 + r()).toFixed(2)}% ${(49 + r()).toFixed(2)}% at 50% 50%)`;
}

// A silhouette (a cutout with alpha) sliced into horizontal bands at `cuts` (fractions of its
// height). Each band is a full-size clipping on the same spot, so they assemble into the whole;
// moves(i) gives band i its own moves (a slide, a late slap); place(i) may move its rest spot
// ({ x, y, rot }), e.g. the eye band pushed off line.
//   K.sliced(stage, { img, w, x, y, cuts: [0.24, 0.34], moves: (i) => [{ kind: "slap", at: 1 + 0.2 * i }],
//                     place: (i) => (i === 1 ? { x: x + 60 } : {}) })
export function sliced(stage, { cuts, moves = () => [], place = () => ({}), seed = 1, z = 0, ...o }) {
  const edges = [0, ...cuts, 1];
  return edges.slice(0, -1).map((a, i) =>
    clipping(stage, { ...o, seed, z: z + i * 0.1, band: [a, edges[i + 1]], moves: moves(i), ...place(i) }),
  );
}

// A ransom label: a strip of black paper, light typewriter caps typed on it from tIn (one key
// cue per letter), slapped on the table at `moves` (default: a slap 0.25 s before tIn).
//   K.ransom(stage, { text: "Uma palavra", size: 56, x, y, rot: -2, tIn: V.at("palavra") })
export function ransom(stage, { text, size = 48, weight = 400, tIn, cps = 16, ink = "#f4efe4", paper = "#141210", face: font, moves, ...o }) {
  const caps = text.toUpperCase();
  const family = font ?? theme().families.typewriter;
  const meter = document.createElement("canvas").getContext("2d");
  meter.font = `${weight} ${size}px ${family}`;
  const padX = size * 0.38, padY = size * 0.26;
  const w = Math.ceil(meter.measureText(caps).width * 1.04 + size * 0.04 * caps.length + 2 * padX);
  const h = Math.ceil(size * 1.05 + 2 * padY);
  const c = clipping(stage, { color: paper, w, h, edge: "straight", boil: false, moves: moves ?? [{ kind: "slap", at: tIn - 0.25 }], ...o });
  const txt = document.createElement("div");
  txt.dataset.part = "text";
  Object.assign(txt.style, {
    position: "absolute", left: `${padX}px`, top: `${padY + size * 0.08}px`, font: `${weight} ${size}px/1 ${family}`,
    letterSpacing: "0.04em", color: ink, whiteSpace: "pre",
  });
  c.el.firstChild.append(txt);
  const chars = [...caps];
  const keys = chars.flatMap((ch, i) => (ch.trim() ? [{ t: tIn + (i + 1) / cps, type: "key", gain: 0.35 }] : []));
  return {
    ...c,
    end: tIn + chars.length / cps,
    cues: () => [...c.cues(), ...keys],
    draw(t) {
      c.draw(t);
      const k = Math.max(0, Math.min(chars.length, Math.floor((t - tIn) * cps + 1e-6)));
      txt.textContent = chars.slice(0, k).join("");
    },
  };
}
