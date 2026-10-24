import { useEffect, useState } from "react";
import { Easing, Img, continueRender, delayRender } from "remotion";
import { loadFace } from "../../../../src/type";
import cinzelUrl from "../assets/fonts/Cinzel-VF.ttf";
import archivoUrl from "../assets/fonts/ArchivoBlack-Regular.ttf";
import lilitaUrl from "../assets/fonts/LilitaOne-Regular.ttf";

export const W = 1080;
export const H = 1920;

export const F = { cinzel: "Cinzel", archivo: "Archivo Black", lilita: "Lilita One" } as const;

let fontsReady: Promise<unknown> | null = null;
/** Holds the render until the three fonts of shots 4-7 are loaded (loaded once per page). */
export function useFonts47(): void {
  const [h] = useState(() => delayRender("s04-07 fonts"));
  useEffect(() => {
    fontsReady ??= Promise.all([
      loadFace(F.cinzel, cinzelUrl, "400 900"),
      loadFace(F.archivo, archivoUrl),
      loadFace(F.lilita, lilitaUrl),
    ]).catch(() => undefined);
    fontsReady.finally(() => continueRender(h));
  }, [h]);
}

export type Key = [frame: number, value: number, ease?: (t: number) => number];

export const EASE_OUT = Easing.bezier(0.15, 0.8, 0.25, 1);
export const EASE_IN = Easing.bezier(0.5, 0, 0.9, 0.5);
export const EASE_IO = Easing.bezier(0.45, 0, 0.25, 1);

/** Piecewise value between keys; the ease on a key shapes the leg that starts there. Clamped at both ends. */
export function kf(f: number, keys: Key[]): number {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0, e] = keys[i];
    const [f1, v1] = keys[i + 1];
    if (f <= f1) {
      if (f1 === f0) return v1;
      const t = (f - f0) / (f1 - f0);
      return v0 + (v1 - v0) * (e ? e(t) : t);
    }
  }
  return keys[keys.length - 1][1];
}

/** Deterministic 0..1 noise from an integer. */
export const rnd = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** An image placed by its centre, width and rotation, in world pixels. */
export const Sprite: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  rot?: number;
  opacity?: number;
  flip?: boolean;
  style?: React.CSSProperties;
}> = ({ src, x, y, w, rot = 0, opacity = 1, flip = false, style }) => (
  <Img
    src={src}
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y,
      width: w,
      height: "auto",
      transform: `translateY(-50%) rotate(${rot}deg)${flip ? " scaleX(-1)" : ""}`,
      opacity,
      ...style,
    }}
  />
);

/**
 * Radial zoom blur: `children` drawn `samples` times at scales 1..(1+amount), averaged exactly
 * (layer i at opacity 1/(i+1)). Children must be pure in the frame.
 */
export const RadialBlur: React.FC<{
  amount: number;
  samples?: number;
  origin?: string;
  children: React.ReactNode;
}> = ({ amount, samples = 14, origin = "50% 50%", children }) => {
  if (amount <= 0.001) return <>{children}</>;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: samples }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 1 / (i + 1),
            transform: `scale(${1 + (amount * i) / (samples - 1)})`,
            transformOrigin: origin,
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
};

/** Vertical white-to-grey grotesk fill with a soft drop shadow (shot 6 type). */
export const GradText: React.FC<{
  text: string;
  size: number;
  top: string;
  bottom: string;
  style?: React.CSSProperties;
}> = ({ text, size, top, bottom, style }) => (
  <div
    style={{
      fontFamily: `"${F.archivo}"`,
      fontSize: size,
      lineHeight: 1,
      whiteSpace: "pre",
      textAlign: "center",
      backgroundImage: `linear-gradient(180deg, ${top}, ${bottom})`,
      WebkitBackgroundClip: "text",
      color: "transparent",
      filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.55))",
      ...style,
    }}
  >
    {text}
  </div>
);

/** Characters of `text` visible at keyed counts (linear between keys, floored). */
export const typed = (text: string, f: number, keys: [number, number][]): string =>
  text.slice(0, Math.max(0, Math.floor(kf(f, keys.map(([a, b]) => [a, b] as Key)))));
