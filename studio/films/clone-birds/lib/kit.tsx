// Shared kit for the clone-birds loop: the 12 fps step clock, the print look (navy/cream duotone
// halftone and its red twin), cut-out layers placed in reference pixels, vignette and grain.
// Numbers come from crew/reference-breakdown.md (sections 1, 6 and 10); reference pixels are at
// 720x1280 and are scaled to the 1080x1920 frame here, so shots can be written straight from it.
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { duotone } from "@remotion/effects/duotone";
import { halftone } from "@remotion/effects/halftone";
import { LOOP } from "../scene";

/** Reference px (720 wide) → our px (1080 wide). */
export const K = 1.5;

export const NAVY = "#00001B";
export const CREAM = "#EEEED4";
export const RED = "#BC1020";
export const CROWD_RED = "#C3292E";
export const SIGN_INK = "#1F2A6B";

/**
 * The reference steps at exactly 12 fps on a 3,2,3,2 hold pattern (new image at f = 5n and
 * 5n+3, measured with zero exceptions): every layer, the screen and the grain read this clock.
 */
export const q = (f: number) => 5 * Math.floor(f / 5) + (f % 5 >= 3 ? 3 : 0);

/** The loop frame (0-149) on the step clock: shots animate from this, never from raw frames. */
export const useLoopFrame = () => q(useCurrentFrame() % LOOP);

// Screen pitch 5.4 px at 720 → ~8 px here, rotated ~36 deg (breakdown 6).
const screen = halftone({ shape: "circle", dotSize: 8, dotSpacing: 8, rotation: 36, colorMode: "source", invert: true });
/** Photos: halftone, then navy-to-cream duotone. */
export const PRINT = [screen, duotone({ darkColor: NAVY, lightColor: CREAM })];
/** Red-accent pieces (crowd, van, plane, bird sign): halftone, then navy-to-red. */
export const PRINT_RED = [screen, duotone({ darkColor: "#3A0008", lightColor: CROWD_RED })];

/**
 * One cut-out layer (`src` = an imported asset URL, as in clone-bethlem). `x`/`y` are its centre and `w` its width, all in reference px (720x1280),
 * the units the breakdown measures in. `look` picks the print; `blur` is a defocus in ref px.
 */
export const Piece: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  rot?: number;
  look?: "print" | "red" | "none";
  blur?: number;
  style?: CSSProperties;
}> = ({ src, x, y, w, rot = 0, look = "print", blur = 0, style }) => (
  <Img
    src={src}
    effects={look === "print" ? PRINT : look === "red" ? PRINT_RED : undefined}
    style={{
      position: "absolute",
      left: x * K,
      top: y * K,
      width: w * K,
      transform: `translate(-50%, -50%) rotate(${rot}deg)`,
      filter: blur ? `blur(${blur * K}px)` : undefined,
      ...style,
    }}
  />
);

/**
 * The one scene group: everything inside scales and rolls around (ox, oy) (ref px). Foreground
 * layers take `scale ** 1.3` relative to the Capitol plate (measured parallax), via `Depth`.
 */
export const Group: React.FC<{ s: number; x?: number; y?: number; r?: number; ox?: number; oy?: number; children: ReactNode }> = ({
  s,
  x = 0,
  y = 0,
  r = 0,
  ox = 360,
  oy = 640,
  children,
}) => (
  <AbsoluteFill style={{ transformOrigin: `${ox * K}px ${oy * K}px`, transform: `translate(${x * K}px, ${y * K}px) rotate(${r}deg) scale(${s})` }}>
    {children}
  </AbsoluteFill>
);

/** A depth plane inside a Group: extra scale so its total scale is groupScale ** exponent. */
export const Depth: React.FC<{ groupScale: number; exponent?: number; ox?: number; oy?: number; children: ReactNode }> = ({
  groupScale,
  exponent = 1.3,
  ox = 360,
  oy = 640,
  children,
}) => (
  <AbsoluteFill style={{ transformOrigin: `${ox * K}px ${oy * K}px`, transform: `scale(${groupScale ** (exponent - 1)})` }}>
    {children}
  </AbsoluteFill>
);

/** Strong vignette: corners ~0.6-0.75 of the centre (breakdown 6). */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.38 }) => (
  <AbsoluteFill
    style={{ background: `radial-gradient(ellipse 75% 65% at 50% 50%, rgba(0,0,27,0) 55%, rgba(0,0,27,${strength}) 100%)`, pointerEvents: "none" }}
  />
);

/** Ease-out (entries, no overshoot) and ease-in-out (the pull-back), on 0..1. */
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/** Value at frame f along keyframes [[frame, value], ...], eased per segment. */
export const keys = (f: number, ks: [number, number][], ease: (t: number) => number = (t) => t) => {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [f0, v0] = ks[i - 1];
    const [f1, v1] = ks[i];
    if (f <= f1) return v0 + (v1 - v0) * ease((f - f0) / (f1 - f0));
  }
  return ks[ks.length - 1][1];
};
