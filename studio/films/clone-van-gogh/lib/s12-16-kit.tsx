import { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, Easing } from "remotion";
import { loadFace } from "../../../../src/type";
import lilitaUrl from "../assets/fonts/LilitaOne-Regular.ttf";
import orbitronUrl from "../assets/fonts/Orbitron-VF.ttf";
import cinzelUrl from "../assets/fonts/Cinzel-VF.ttf";

export const W = 1080;
export const H = 1920;
export const LILITA = "Lilita One";
export const ORBITRON = "Orbitron";
export const CINZEL = "Cinzel";

/** Loads the shot fonts once; render blocks until they are in. */
export function useShotFonts() {
  const [handle] = useState(() => delayRender("S12-16 fonts"));
  useEffect(() => {
    Promise.all([
      loadFace(LILITA, lilitaUrl),
      loadFace(ORBITRON, orbitronUrl, "400 900"),
      loadFace(CINZEL, cinzelUrl, "400 900"),
    ])
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
}

export type CamKey = { f: number; s: number; x: number; y: number };

/** Linear-in-time (constant velocity) or eased camera between keys; x/y = world centre in fractions of the frame. */
export function camAt(keys: CamKey[], frame: number, ease: (t: number) => number = (t) => t) {
  const fs = keys.map((k) => k.f);
  const e = (v: number[]) => {
    if (frame <= fs[0]) return v[0];
    if (frame >= fs[fs.length - 1]) return v[v.length - 1];
    let i = 0;
    while (frame > fs[i + 1]) i++;
    const t = ease((frame - fs[i]) / (fs[i + 1] - fs[i]));
    return v[i] + (v[i + 1] - v[i]) * t;
  };
  return { s: e(keys.map((k) => k.s)), x: e(keys.map((k) => k.x)), y: e(keys.map((k) => k.y)) };
}

export const easeOut = Easing.out(Easing.cubic);

/** Portrait camera: world = the 1080x1920 frame at scale 1; (x, y) are the fractions of it at screen centre. */
export const Cam: React.FC<{ cam: { s: number; x: number; y: number }; children: React.ReactNode }> = ({ cam, children }) => (
  <AbsoluteFill
    style={{
      transformOrigin: "0 0",
      transform: `translate(${W / 2}px, ${H / 2}px) scale(${cam.s}) translate(${-cam.x * W}px, ${-cam.y * H}px)`,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Chunky reference caption: pale fill, soft shadow, in Lilita One. */
export const bigType = (size: number, color = "#E4ECF4", shadow = "0 4px 0 rgba(68,86,111,0.55)"): React.CSSProperties => ({
  fontFamily: LILITA,
  fontSize: size,
  lineHeight: 1,
  color,
  textShadow: shadow,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
});

/** Letters of `text` visible at `frame`, one every `per` frames from `start`. */
export function typedChars(text: string, frame: number, start: number, per = 1) {
  return Math.max(0, Math.min(text.length, Math.floor((frame - start) / per) + 1));
}

/** Pops each typed letter 1.2 -> 1.0 in a frame, like the reference. */
export const PopText: React.FC<{ text: string; frame: number; start: number; per?: number; style?: React.CSSProperties }> = ({
  text, frame, start, per = 1, style,
}) => {
  const n = typedChars(text, frame, start, per);
  return (
    <span style={{ ...style, display: "inline-block", whiteSpace: "pre" }}>
      {text.split("").map((c, i) => {
        if (i >= n) return <span key={i} style={{ opacity: 0 }}>{c}</span>;
        const age = frame - (start + i * per);
        const sc = interpolate(age, [0, 1.5], [1.25, 1], { extrapolateRight: "clamp" });
        const dy = interpolate(age, [0, 1.5], [10, 0], { extrapolateRight: "clamp" });
        return (
          <span key={i} style={{ display: "inline-block", transform: `translateY(${dy}px) scale(${sc})` }}>{c}</span>
        );
      })}
    </span>
  );
};
