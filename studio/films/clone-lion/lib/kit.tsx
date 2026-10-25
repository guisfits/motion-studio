// Shared kit for the clone-lion film: reference-pixel placement (720x1280 x K), smooth keyframe
// curves, the black-and-white grade as SVG maps, the three parallax planes and their blur.
// Numbers come from crew/reference-breakdown.md; shots are written straight from it.
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { AbsoluteFill, Img, cancelRender, continueRender, delayRender } from "remotion";
import { loadFace } from "../../../../src/type";
import kaushanUrl from "../assets/fonts/KaushanScript-Regular.ttf";

/** Reference px (720 wide) to our px (1080 wide). */
export const K = 1.5;

export const YELLOW = "#F5DA3E";
export const RED = "#B8484A";
export const VIOLET = "#5D4DAD";
export const PAPER = "#E5DCCD";
export const BRUSH = "Kaushan Script";

export const useFonts = () => {
  const [handle] = useState(() => delayRender("clone-lion fonts"));
  useEffect(() => {
    loadFace(BRUSH, kaushanUrl, "400").then(() => continueRender(handle)).catch(cancelRender);
  }, [handle]);
};

/**
 * Value at frame f along keyframes [[frame, value], ...]: a monotone cubic (Fritsch-Carlson), so
 * measured tables read as smooth motion with no velocity kinks and no overshoot.
 */
export const keys = (f: number, ks: [number, number][]): number => {
  const n = ks.length;
  if (f <= ks[0][0]) return ks[0][1];
  if (f >= ks[n - 1][0]) return ks[n - 1][1];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((ks[i + 1][1] - ks[i][1]) / (ks[i + 1][0] - ks[i][0]));
  const m: number[] = [d[0]];
  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const a = m[i] / d[i];
      const b = m[i + 1] / d[i];
      const h = Math.hypot(a, b);
      if (h > 3) {
        m[i] = (3 * a * d[i]) / h;
        m[i + 1] = (3 * b * d[i]) / h;
      }
    }
  }
  let i = 0;
  while (f > ks[i + 1][0]) i++;
  const h = ks[i + 1][0] - ks[i][0];
  const t = (f - ks[i][0]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * ks[i][1] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ks[i + 1][1] + (t3 - t2) * h * m[i + 1];
};

/** Straight linear interpolation along keyframes (for gates: fades and wipes). */
export const lin = (f: number, ks: [number, number][]): number => {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (f <= ks[i][0]) return ks[i - 1][1] + ((ks[i][1] - ks[i - 1][1]) * (f - ks[i - 1][0])) / (ks[i][0] - ks[i - 1][0]);
  }
  return ks[ks.length - 1][1];
};

/**
 * The grade (breakdown 6): neutral grey, no tint. `sheep` keeps full tone with the highlights
 * clipped near 253; `lion` is the same grey pushed hard down with a gamma so the tawny photo reads
 * near-black with a grey face; `ghost` lifts the far flock toward the ground.
 */
export const Filters: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="sheep" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0 0.18 0.72 1" />
          <feFuncG type="table" tableValues="0 0.18 0.72 1" />
          <feFuncB type="table" tableValues="0 0.18 0.72 1" />
        </feComponentTransfer>
      </filter>
      <filter id="flock" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.1 0.4 0.72 0.9" />
          <feFuncG type="table" tableValues="0.1 0.4 0.72 0.9" />
          <feFuncB type="table" tableValues="0.1 0.4 0.72 0.9" />
        </feComponentTransfer>
      </filter>
      <filter id="head" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.12 0.4 0.8 1" />
          <feFuncG type="table" tableValues="0.12 0.4 0.8 1" />
          <feFuncB type="table" tableValues="0.12 0.4 0.8 1" />
        </feComponentTransfer>
      </filter>
      <filter id="yel" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.1 0.5 0.98 0.98" />
          <feFuncG type="table" tableValues="0.08 0.42 0.87 0.9" />
          <feFuncB type="table" tableValues="0 0.03 0.28 0.38" />
        </feComponentTransfer>
      </filter>
      <filter id="lion" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="gamma" amplitude="1.05" exponent="2.0" offset="0" />
          <feFuncG type="gamma" amplitude="1.05" exponent="2.0" offset="0" />
          <feFuncB type="gamma" amplitude="1.05" exponent="2.0" offset="0" />
        </feComponentTransfer>
      </filter>
      <filter id="ghost" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.3 0.55 0.8 0.95" />
          <feFuncG type="table" tableValues="0.3 0.55 0.8 0.95" />
          <feFuncB type="table" tableValues="0.3 0.55 0.8 0.95" />
        </feComponentTransfer>
      </filter>
    </defs>
  </svg>
);

export type Look = "sheep" | "flock" | "head" | "lion" | "ghost" | "none";

/**
 * One cut-out placed by its centre (x, y) and width w in reference px; `h` stretches it when the
 * source aspect differs from the reference; `flip` mirrors it; `opacity` fades it.
 */
export const Piece: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  h?: number;
  flip?: boolean;
  rot?: number;
  look?: Look;
  pre?: string;
  opacity?: number;
  style?: CSSProperties;
}> = ({ src, x, y, w, h, flip = false, rot = 0, look = "sheep", pre = "", opacity = 1, style }) => (
  <Img
    src={src}
    style={{
      position: "absolute",
      left: x * K,
      top: y * K,
      width: w * K,
      height: h ? h * K : undefined,
      transform: `translate(-50%, -50%) rotate(${rot}deg)${flip ? " scaleX(-1)" : ""}`,
      filter: [pre, look === "none" ? "" : `url(#${look})`].join(" ").trim() || undefined,
      opacity,
      ...style,
    }}
  />
);

/**
 * A parallax plane: its anchor (ax, ay), in the plane's own reference-px layout, is put at screen
 * (px, py), scaled by s and rolled `rot` deg counter-clockwise around it. Children are laid out
 * in the plane's f200 composition and never know about the camera.
 */
export const Plane: React.FC<{ px: number; py: number; s: number; rot?: number; ax: number; ay: number; children: ReactNode }> = ({
  px,
  py,
  s,
  rot = 0,
  ax,
  ay,
  children,
}) => (
  <AbsoluteFill
    style={{ transformOrigin: "0 0", transform: `translate(${px * K}px, ${py * K}px) rotate(${-rot}deg) scale(${s}) translate(${-ax * K}px, ${-ay * K}px)` }}
  >
    {children}
  </AbsoluteFill>
);

/** Output-space Gaussian blur (sigma in reference px) on a whole group. */
export const Blur: React.FC<{ sigma: number; opacity?: number; children: ReactNode }> = ({ sigma, opacity = 1, children }) => (
  <AbsoluteFill style={{ filter: sigma > 0.05 ? `blur(${sigma * K}px)` : undefined, opacity }}>{children}</AbsoluteFill>
);

/** A solid yellow rectangle in the layout of whatever plane it sits in (reference px). */
export const Rect: React.FC<{ x0: number; y0: number; x1: number; y1: number; color?: string; opacity?: number }> = ({ x0, y0, x1, y1, color = YELLOW, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x0 * K, top: y0 * K, width: (x1 - x0) * K, height: (y1 - y0) * K, background: color, opacity }} />
);

/**
 * The yellow paint as a copy of a cut-out regraded to a yellow ramp on its own luminance (black
 * lion goes dark olive-yellow, white wool goes #F9DE55) and laid over it with its own alpha, so
 * it only ever lands on the picture and never on the white ground. `mask` is a CSS mask-image in
 * the picture's local px (bands, or the mane only).
 */
export const Yellow: React.FC<{ src: string; x: number; y: number; w: number; h: number; flip?: boolean; opacity?: number; mask?: string }> = ({ src, x, y, w, h, flip = false, opacity = 1, mask }) => (
  <Img
    src={src}
    style={{
      position: "absolute",
      left: x * K,
      top: y * K,
      width: w * K,
      height: h * K,
      transform: `translate(-50%, -50%)${flip ? " scaleX(-1)" : ""}`,
      filter: "url(#yel)",
      opacity,
      WebkitMaskImage: mask,
      maskImage: mask,
    }}
  />
);

/** Hi-vis vest bands as a mask: 26 px on, 22 px off (reference px). */
export const BANDS = `repeating-linear-gradient(to bottom, #000 0 ${26 * K}px, transparent ${26 * K}px ${48 * K}px)`;
