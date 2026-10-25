// Shared kit for the clone-birds loop: the 12 fps step clock, the print look (navy/cream duotone
// halftone and its red twin), cut-out layers placed in reference pixels, vignette and grain.
// Numbers come from crew/reference-breakdown.md (sections 1, 6 and 10); reference pixels are at
// 720x1280 and are scaled to the 1080x1920 frame here, so shots can be written straight from it.
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { AbsoluteFill, Img, cancelRender, continueRender, delayRender, useCurrentFrame } from "remotion";
import { loadFace } from "../../../../src/type";
import antonUrl from "../assets/fonts/Anton-Regular.ttf";
import barlowUrl from "../assets/fonts/BarlowCondensed-Bold.ttf";
import markerUrl from "../assets/fonts/PermanentMarker-Regular.ttf";
import { LOOP } from "../scene";

/** Reference px (720 wide) → our px (1080 wide). */
export const K = 1.5;

export const NAVY = "#00001B";
export const CREAM = "#EEEED4";
export const RED = "#BC1020";
export const CROWD_RED = "#C3292E";
export const SIGN_INK = "#1F2A6B";

// Type (breakdown 7): condensed bold caps for the signs, a heavy condensed for the banner, brush
// caps for "FEATHERS ARE FAKE". OFL / Apache faces from Google Fonts (assets/fonts/).
export const SIGN_FONT = "Barlow Condensed";
export const BANNER_FONT = "Anton";
export const BRUSH_FONT = "Permanent Marker";

export const useFonts = () => {
  const [handle] = useState(() => delayRender("clone-birds fonts"));
  useEffect(() => {
    Promise.all([loadFace(SIGN_FONT, barlowUrl, "700"), loadFace(BANNER_FONT, antonUrl, "400"), loadFace(BRUSH_FONT, markerUrl, "400")])
      .then(() => continueRender(handle))
      .catch(cancelRender);
  }, [handle]);
};

/**
 * The reference steps at exactly 12 fps on a 3,2,3,2 hold pattern (new image at f = 5n and
 * 5n+3, measured with zero exceptions): every layer, the screen and the grain read this clock.
 */
export const q = (f: number) => 5 * Math.floor(f / 5) + (f % 5 >= 3 ? 3 : 0);

/** The loop frame (0-149) on the step clock: shots animate from this, never from raw frames. */
export const useLoopFrame = () => q(useCurrentFrame() % LOOP);

/**
 * The print look (breakdown 6) as SVG gradient maps on luminance: photos go navy → mid blue →
 * cream (a tritone, the reference keeps full photo tone with blue mids, it is not a binary
 * halftone); red pieces go navy → crowd red → pale pink. The dot screen is a separate overlay
 * (`Screen`), so its pitch stays fixed while layers scale.
 */
export const Filters: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="tri" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0 0.2 0.56 0.93" />
          <feFuncG type="table" tableValues="0 0.25 0.69 0.93" />
          <feFuncB type="table" tableValues="0.106 0.4 0.83 0.83" />
        </feComponentTransfer>
      </filter>
      <filter id="red" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.05 0.765 0.95" />
          <feFuncG type="table" tableValues="0 0.16 0.85" />
          <feFuncB type="table" tableValues="0.1 0.18 0.8" />
        </feComponentTransfer>
      </filter>
    </defs>
  </svg>
);

/**
 * Dot screen over the whole frame: navy specks at ~8 px pitch (5.4 px at 720), rotated 36 deg,
 * multiplied. It shifts by a sub-pitch offset on every step so it "boils" at 12 fps like the
 * reference's re-seeded screen.
 */
export const Screen: React.FC<{ opacity?: number }> = ({ opacity = 0.55 }) => {
  const f = useCurrentFrame();
  const o = ((f * 37) % 8) / 2;
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none", mixBlendMode: "multiply", opacity }}>
      <div
        style={{
          position: "absolute",
          inset: "-30%",
          transform: `rotate(36deg) translate(${o}px, ${o / 2}px)`,
          backgroundImage: "radial-gradient(circle, rgba(0,0,27,0.9) 1.1px, rgba(0,0,27,0) 2.4px)",
          backgroundSize: "8px 8px",
        }}
      />
    </AbsoluteFill>
  );
};

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
  /** CSS filters applied before the print map (e.g. "brightness(1.4)" to push a plate to cream). */
  pre?: string;
  style?: CSSProperties;
}> = ({ src, x, y, w, rot = 0, look = "print", blur = 0, pre = "", style }) => (
  <Img
    src={src}
    style={{
      position: "absolute",
      left: x * K,
      top: y * K,
      width: w * K,
      transform: `translate(-50%, -50%) rotate(${rot}deg)`,
      filter: [pre, look === "print" ? "url(#tri)" : look === "red" ? "url(#red)" : "", blur ? `blur(${blur * K}px)` : ""].join(" ").trim() || undefined,
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

/**
 * A hand-held protest placard: white board with optional navy frame, type set in code (never
 * generated lettering), a wooden stick below. Centre/size in reference px; `children` is the type.
 */
export const Sign: React.FC<{ x: number; y: number; w: number; h: number; rot: number; frame?: boolean; children: ReactNode }> = ({
  x,
  y,
  w,
  h,
  rot,
  frame = false,
  children,
}) => (
  <div style={{ position: "absolute", left: x * K, top: y * K, transform: `translate(-50%, -50%) rotate(${rot}deg)` }}>
    <div style={{ position: "absolute", left: (w / 2 - 7) * K, top: h * 0.5 * K, width: 14 * K, height: h * 1.1 * K, background: "#8a7a5c" }} />
    <div
      style={{
        position: "relative",
        width: w * K,
        height: h * K,
        background: "#E4E6D6",
        boxShadow: frame ? `inset 0 0 0 ${14 * K}px ${SIGN_INK}` : undefined,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: SIGN_INK,
        fontFamily: SIGN_FONT,
        fontWeight: 700,
        textTransform: "uppercase",
        lineHeight: 0.92,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </div>
  </div>
);

/**
 * Our own surveillance-bird mark (an original drawing, not any movement's logo): a perched bird
 * whose head is a box camera with a lens. Fill colour is the accent red.
 */
export const CamBird: React.FC<{ size: number; color?: string }> = ({ size, color = RED }) => (
  <svg width={size * K} height={size * K} viewBox="0 0 100 100">
    <g fill={color}>
      <path d="M20 62 C24 44 42 36 60 40 L74 46 L70 60 C62 72 44 76 30 72 L8 80 Z" />
      <rect x="58" y="22" width="26" height="18" rx="2" transform="rotate(-12 71 31)" />
      <rect x="82" y="22" width="10" height="10" transform="rotate(-12 71 31)" />
      <rect x="40" y="72" width="4" height="16" />
      <rect x="52" y="70" width="4" height="18" />
      <rect x="34" y="86" width="28" height="4" />
    </g>
  </svg>
);
