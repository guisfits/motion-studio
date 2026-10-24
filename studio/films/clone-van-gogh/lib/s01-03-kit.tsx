import { useEffect, useState } from "react";
import { continueRender, delayRender, interpolate } from "remotion";
import { loadFace } from "../../../../src/type";
import lilitaUrl from "../assets/fonts/LilitaOne-Regular.ttf";

// Film-local helpers shared by S01-S03 (the engine has no 16 fps "pose list" helper, only Camera keys).

export const FONT = "Lilita One";
export const W = 1080;
export const H = 1920;

let fontPromise: Promise<void> | null = null;
/** Loads the heavy rounded display face once; the render waits for it. */
export function useFonts() {
  const [handle] = useState(() => delayRender("s01-03 fonts"));
  useEffect(() => {
    fontPromise ??= loadFace(FONT, lilitaUrl, "400").catch(() => undefined);
    fontPromise.finally(() => continueRender(handle));
  }, [handle]);
}

/** Piecewise-linear value over [frame, value] keys, clamped at both ends. */
export function keys(f: number, ks: [number, number][], ease?: (t: number) => number): number {
  return interpolate(f, ks.map((k) => k[0]), ks.map((k) => k[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
}

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const backOut = (t: number) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);

/** Small deterministic hash in [0,1), so a "random" jitter is the same on every render. */
export function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** An image centred on (cx, cy), w x h px, with rotation (deg) and mirror. */
export const Pic: React.FC<{
  src: string; cx: number; cy: number; w: number; h: number; rot?: number; flip?: boolean; opacity?: number; scale?: number; style?: React.CSSProperties;
}> = ({ src, cx, cy, w, h, rot = 0, flip, opacity = 1, scale = 1, style }) => (
  <img
    src={src}
    style={{
      position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h,
      transform: `rotate(${rot}deg) scale(${flip ? -scale : scale}, ${scale})`, opacity, ...style,
    }}
  />
);
