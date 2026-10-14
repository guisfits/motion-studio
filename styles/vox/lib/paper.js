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

const EDGES = ["torn", "baked", "straight"];
const SHADOW = "rgba(30,20,10,";
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
  const h = (img.naturalHeight / img.naturalWidth) * w;
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
  const face = img.cloneNode();
  const rear = back ? back.cloneNode() : null;
  for (const e of [face, rear].filter(Boolean))
    Object.assign(e.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
    });
  // The wrapper's x scale goes negative past the half turn and mirrors everything; the rear is
  // pre-mirrored so it reads right.
  if (rear) rear.style.transform = "scaleX(-1)";
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
  Object.assign(flapShape.style, { width: "100%", height: "100%", background: "#efe7d6" });
  flap.append(flapShape);
  wrap.append(face, ...(rear ? [rear] : []), flap);
  parent.append(wrap);
  stage.pending.push(face.decode().catch(() => {}));
  if (rear) stage.pending.push(rear.decode().catch(() => {}));
  const screen = halftone
    ? halftoneFilter(stage, halftone === true ? {} : halftone)
    : "";
  const edges = [0, 1, 2].map((i) => tornClip(sd + i * 101, 18, 4.5));
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
      wrap.style.visibility = p.visible ? "visible" : "hidden";
      if (!p.visible) return;
      const step = boil ? boilStep(t) : 0;
      if (edge === "torn") face.style.clipPath = edges[step];
      const [jx, jy] = edge === "baked" && boil ? jitter[step] : [0, 0];
      const lift = Math.max(0, p.lift);
      const squash = Math.min(0, p.lift); // overshoot: pressed into the table, a hair flatter
      const fold = p.fold,
        crum = p.crumple;
      const sx = (1 - 0.55 * crum) * Math.cos(Math.PI * p.flip);
      const sy = (1 - fold * 0.5) * (1 - 0.55 * crum) * (1 + squash * 0.3);
      wrap.style.zIndex = String(Math.round((z + p.dz) * 10));
      wrap.dataset.fold = fold.toFixed(3);
      wrap.style.transform =
        `translate(${x - w / 2 + p.dx + jx}px, ${y - h / 2 + p.dy + jy}px) rotate(${rot + p.rot}deg) ` +
        `scale(${p.scale * (1 + 0.04 * lift)}) scale(${sx}, ${sy})`;
      if (rear) {
        face.style.visibility = p.flip < 0.5 ? "visible" : "hidden";
        rear.style.visibility = p.flip >= 0.5 ? "visible" : "hidden";
      }
      // Folded half darkens (it faces away from the light); a crumpled ball is mottled grey.
      face.style.filter = `${screen} brightness(${1 - 0.25 * fold - 0.3 * crum}) contrast(${1 + 0.4 * crum})`;
      const c = p.curl * Math.min(w, h) * 0.45;
      Object.assign(flap.style, {
        width: `${c}px`,
        height: `${c}px`,
        left: curlCorner.endsWith("r") ? `${w - c}px` : "0",
        top: curlCorner.startsWith("t") ? "0" : `${h - c}px`,
      });
      const hgt = Math.min(1, lift + 0.08);
      const s = 2 + 22 * hgt;
      wrap.style.filter = `drop-shadow(0 ${1 + 2 * hgt}px ${1 + hgt}px ${SHADOW}.35)) drop-shadow(0 ${s}px ${s * 1.4}px ${SHADOW}${(0.18 + 0.12 * hgt).toFixed(3)}))`;
    },
  };
}
