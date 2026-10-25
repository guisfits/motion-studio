// Shared pieces of the Bethlem clone, measured in crew/reference-breakdown.md:
// accent #FAF755, EB Garamond, mono print grade, tint = gradient map black → olive → accent,
// caption = a fixed-width yellow bar that types its phrase, everything stepped on twos (Film.tsx).
import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { AbsoluteFill, Img, cancelRender, continueRender, delayRender, interpolate, Easing, useCurrentFrame } from "remotion";
import { loadFace } from "../../../../src/type";
import fontUrl from "../assets/fonts/EBGaramond-VF.ttf";
import refWords from "../crew/words.json";
import { FPS, ourToRef, refToOur } from "../scene";

export const W = 1080;
export const H = 1920;
export const ACCENT = "#FAF755";
export const OLIVE = "#6B6B10";
export const INK = "#1a1a14";
export const PAPER = "#DBDBD7";
export const PAPER_GREY = "#C9C9C6";
export const FONT = "EB Garamond";

export const useFont = () => {
  const [handle] = useState(() => delayRender("EB Garamond"));
  useEffect(() => {
    loadFace(FONT, fontUrl, "400 800").then(() => continueRender(handle)).catch(cancelRender);
  }, [handle]);
};

// ---- Time: shots are authored in reference frames -------------------------------------------

/** The running shot: its first frame in our timeline and in the reference. */
export const ShotCtx = createContext({ ourFrom: 0, refFrom: 0 });

/** Frame inside the shot, in reference frames (0 = the shot's first reference frame). */
export const useRefFrame = (): number => {
  const local = useCurrentFrame();
  const { ourFrom, refFrom } = useContext(ShotCtx);
  return ourToRef((ourFrom + local) / FPS) * FPS - refFrom;
};

/** Absolute reference frame of the whole film (for film-level layers outside any shot). */
export const useFilmRefFrame = (): number => ourToRef(useCurrentFrame() / FPS) * FPS;

/** Breakdown f-numbers are 1-based; this turns "f43" inside a shot starting at fShot into a local frame. */
export const at = (f: number, shotFrom: number) => f - 1 - shotFrom;

const EASE_OUT = Easing.bezier(0.2, 0.7, 0.3, 1);
/** Value from a to b between local frames f0..f1 (clamped); ease "linear" | "out". */
export const ramp = (t: number, f0: number, f1: number, a: number, b: number, ease: "linear" | "out" = "linear") =>
  interpolate(t, [f0, f1], [a, b], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease === "out" ? EASE_OUT : undefined });

// ---- Picture --------------------------------------------------------------------------------

/** One SVG filter set for the film: mono print grade and the accent gradient map. */
export const Filters: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      {/* Mono print (measured on the reference): luminance, mid-tones lifted (gamma 0.7), contrast
          compressed to blacks ~#3a and whites ~#EA — a pale wet-plate print, never a hard black. */}
      <filter id="mono" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="gamma" amplitude={0.69} exponent={0.7} offset={0.23} />
          <feFuncG type="gamma" amplitude={0.69} exponent={0.7} offset={0.235} />
          <feFuncB type="gamma" amplitude={0.69} exponent={0.7} offset={0.24} />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation={0.6} />
      </filter>
      {/* Accent: luminance → black, olive, accent; hatching survives as dark olive lines. */}
      <filter id="accent" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.24 0.72 0.98" />
          <feFuncG type="table" tableValues="0.24 0.71 0.97" />
          <feFuncB type="table" tableValues="0.04 0.12 0.33" />
        </feComponentTransfer>
      </filter>
    </defs>
  </svg>
);

export type Cam = { s?: [number, number]; x?: [number, number]; y?: [number, number]; r?: [number, number]; f?: [number, number]; ease?: "linear" | "out" };

/** Camera transform for a push/pull in % of frame (x, y), scale s, rotation r (deg), over local frames f. */
export const camStyle = (t: number, c: Cam): CSSProperties => {
  const [f0, f1] = c.f ?? [0, 1];
  const v = (p?: [number, number], d = 0) => (p ? ramp(t, f0, f1, p[0], p[1], c.ease) : d);
  return {
    transform: `translate(${v(c.x)}%, ${v(c.y)}%) scale(${v(c.s, 1)}) rotate(${v(c.r)}deg)`,
    transformOrigin: "50% 50%",
  };
};

/**
 * A picture layer. `crop` frames a region of the source (x, y, w, h in 0..1 of the source) to fill
 * the frame (cover); the camera moves over it. `tint` 0..1 cross-fades the accent gradient map in.
 */
export const Plate: React.FC<{
  src: string;
  cam?: Cam;
  crop?: [number, number, number, number];
  aspect?: number; // source width / height, needed with crop
  tint?: number;
  mono?: boolean;
  blur?: number;
  style?: CSSProperties;
}> = ({ src, cam, crop, aspect = 1, tint = 0, mono = true, blur = 0, style }) => {
  const t = useRefFrame();
  let img: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };
  if (crop) {
    // Scale the source so the crop covers the 9:16 frame, then shift it so the crop's centre sits mid-frame.
    const [cx, cy, cw, ch] = crop;
    const cropAspect = (cw * aspect) / ch;
    const scale = cropAspect > W / H ? H / (ch * (W / aspect)) : 1 / cw; // in units of frame width
    const iw = W * scale;
    const ih = iw / aspect;
    img = { position: "absolute", width: iw, height: ih, left: W / 2 - (cx + cw / 2) * iw, top: H / 2 - (cy + ch / 2) * ih };
  }
  const layer = (filter: string, opacity = 1) => (
    <Img src={src} style={{ ...img, filter: `${filter}${blur ? ` blur(${blur}px)` : ""}`, opacity }} />
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <AbsoluteFill style={cam ? camStyle(t, cam) : undefined}>
        {layer(mono ? "url(#mono)" : "none")}
        {tint > 0 ? layer("url(#accent)", tint) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A cut-out piece placed by its centre (x, y in % of frame) at a width in % of frame width. */
export const Piece: React.FC<{ src: string; x: number; y: number; w: number; tint?: number; rot?: number; style?: CSSProperties; mono?: boolean }> = ({
  src, x, y, w, tint = 0, rot = 0, style, mono = true,
}) => {
  const box: CSSProperties = { position: "absolute", left: `${x}%`, top: `${y}%`, width: `${w}%`, transform: `translate(-50%, -50%) rotate(${rot}deg)`, ...style };
  return (
    <div style={box}>
      <Img src={src} style={{ width: "100%", display: "block", filter: mono ? "url(#mono)" : "none" }} />
      {tint > 0 ? <Img src={src} style={{ position: "absolute", inset: 0, width: "100%", filter: "url(#accent)", opacity: tint }} /> : null}
    </div>
  );
};

/** Blank paper card with an optional ghosted engraving (≈12 % in the reference). */
export const Card: React.FC<{ paper: string; ghost?: string; ghostOpacity?: number; tone?: string; children?: ReactNode }> = ({
  paper, ghost, ghostOpacity = 0.12, tone = PAPER, children,
}) => (
  <AbsoluteFill style={{ backgroundColor: tone }}>
    <Img src={paper} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply", opacity: 0.55 }} />
    {ghost ? <Img src={ghost} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "url(#mono)", opacity: ghostOpacity }} /> : null}
    {children}
  </AbsoluteFill>
);

/**
 * Prism leak: a rainbow fringe at a lower corner (breakdown 4), screen-blended, drifting slowly.
 * `side` picks the corner; `k` 0..1 its strength (the reference shows it on ~40 % of frames).
 */
export const Prism: React.FC<{ side?: "left" | "right"; k?: number; drift?: number }> = ({ side = "right", k = 1, drift = 0 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: 0.5 * k }}>
    <div
      style={{
        position: "absolute", width: "70%", height: "40%", bottom: "-14%", [side]: `${-22 + drift}%`,
        background: "conic-gradient(from 200deg, rgba(255,0,0,0), rgba(255,40,40,0.9), rgba(255,220,0,0.8), rgba(40,255,90,0.8), rgba(40,120,255,0.9), rgba(170,40,255,0.8), rgba(255,0,0,0))",
        filter: "blur(28px)", borderRadius: "50%", transform: `rotate(${side === "right" ? -28 : 28}deg)`,
      }}
    />
  </AbsoluteFill>
);

/** Mild print vignette: corners ~10 % darker. */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.1 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,${strength * 2.2}) 100%)`, pointerEvents: "none" }} />
);

/** Plain caption text (cards, live lines): EB Garamond, centred. */
export const Words: React.FC<{ children: ReactNode; size: number; y?: number; color?: string; weight?: number; shadow?: boolean; style?: CSSProperties }> = ({
  children, size, y = 50, color = INK, weight = 500, shadow, style,
}) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: `${y}%`, transform: "translateY(-50%)", textAlign: "center", fontFamily: FONT, fontSize: size, fontWeight: weight, color, textShadow: shadow ? "0 2px 10px rgba(0,0,0,0.55)" : undefined, ...style }}>
    {children}
  </div>
);

// ---- Caption bar ----------------------------------------------------------------------------

type RefWord = { w: string; s: number; e: number };
const RW = (refWords as { words: RefWord[] }).words;

// A bar never ends on one of these: it moves to the next bar ("on weekends" | "to watch").
const FUNCTION_WORDS = new Set(["to", "and", "the", "a", "an", "for", "of", "in", "like", "who", "that", "when", "on", "was", "were", "had", "been", "at"]);

/**
 * Bar phrases: one per ~1 s of speech, at most 3 words, never across a comma or full stop, never
 * ending on a function word (measured on the reference: "In 1800s" / "London," / "on weekends" /
 * "Prostitutes" / "and Easter,").
 */
// Bars the reference keeps whole, by reference word index range, with the text it shows.
const WHOLE: { from: number; to: number; text: string }[] = [{ from: 25, to: 29, text: "A penny to get in." }];

export const PHRASES: { text: string; s: number; first: number }[] = (() => {
  const out: { text: string; s: number; first: number }[] = [];
  const flush = (ids: number[]) => {
    if (ids.length) out.push({ text: ids.map((i) => RW[i].w).join(" "), s: RW[ids[0]].s, first: ids[0] });
  };
  let cur: number[] = [];
  RW.forEach((x, i) => {
    if (cur.length && (cur.length >= 3 || x.e - RW[cur[0]].s > 1.0)) {
      const carry: number[] = [];
      while (cur.length > 1 && FUNCTION_WORDS.has(RW[cur[cur.length - 1]].w.toLowerCase())) carry.unshift(cur.pop()!);
      flush(cur);
      cur = carry;
    }
    cur.push(i);
    if (/[,.]$/.test(x.w)) { flush(cur); cur = []; }
  });
  flush(cur);
  return out.flatMap((p) => {
    const w = WHOLE.find((x) => p.first >= x.from && p.first <= x.to);
    if (!w) return [p];
    return p.first === w.from ? [{ ...p, text: w.text }] : [];
  });
})();

/** Reference frame windows where the film draws its own type instead of the bar (0-based, end exclusive). */
const NO_BAR: [number, number][] = [[88, 224], [552, 594], [1088, 1140]];
const BAR_LEAD = 1; // text starts ~1-3 frames after the phrase's first word
const CHARS_PER_FRAME = 1.5; // phrase complete ~1/3 into its voice (breakdown 2.1)
const FIRST_BAR = "In 1800s"; // the empty opening bar is as wide as the first phrase

/** The persistent yellow bar: fixed width per phrase, types its phrase, swaps on the next phrase. */
// Where the reference sets the bar smaller or lower (reference frames, end exclusive): the penny card.
const BAR_LOOKS: { from: number; to: number; y: number; height: number; size: number; pad: number }[] = [
  { from: 224, to: 256, y: 58.5, height: 77, size: 44, pad: 26 },
];
const inNoBar = (f: number) => NO_BAR.some(([a, b]) => f >= a && f < b);

export const CaptionBar: React.FC<{ endFrame: number }> = ({ endFrame }) => {
  const frame = useCurrentFrame();
  const fRef = useFilmRefFrame();
  if (inNoBar(fRef)) return null;
  if (fRef >= endFrame - 4) return null; // clears ~0.15 s before the end (f1205)
  const ourF = (t: number) => refToOur(t) * FPS;
  let idx = -1;
  for (let i = 0; i < PHRASES.length; i++) if (frame >= ourF(PHRASES[i].s) + BAR_LEAD) idx = i;
  // A phrase spoken while another type owned the screen never reaches the bar: after such a window
  // the bar waits empty, as wide as the next phrase (the reference's empty bar before "A penny").
  let ph = idx >= 0 ? PHRASES[idx] : null;
  let full = ph ? ph.text : FIRST_BAR;
  if (ph && inNoBar(ph.s * FPS)) {
    full = PHRASES[idx + 1]?.text ?? full;
    ph = null;
  }
  const typed = ph ? full.slice(0, Math.floor((frame - (ourF(ph.s) + BAR_LEAD)) * CHARS_PER_FRAME) + 1) : "";
  const look = BAR_LOOKS.find((l) => fRef >= l.from && fRef < l.to) ?? { y: 49.8, height: 118, size: 72, pad: 40 };
  const font: CSSProperties = { fontFamily: FONT, fontSize: look.size, fontWeight: 500, lineHeight: `${look.height}px`, whiteSpace: "pre" };
  return (
    <div style={{ position: "absolute", left: "50%", top: `${look.y}%`, transform: "translate(-50%, -50%)", height: look.height, padding: `0 ${look.pad}px`, backgroundColor: ACCENT, ...font }}>
      <span style={{ visibility: "hidden" }}>{full}</span>
      <span style={{ position: "absolute", left: look.pad, top: 0, color: INK }}>{typed}</span>
    </div>
  );
};
