// Shared helpers of shots S08-S11: font loading, a per-layer camera (parallax by zoom exponent),
// projection of a world point to the screen, and small easing helpers. Everything is a pure
// function of the frame, at the film's 16 fps (no stepping on top: the reference moves every frame).
import { useEffect, useState } from "react";
import { continueRender, delayRender, interpolate, Easing } from "remotion";
import { cameraAt, type CamKey } from "../../../../src/camera";
import { loadFace } from "../../../../src/type";
import lilitaUrl from "../assets/fonts/LilitaOne-Regular.ttf";
import poppinsUrl from "../assets/fonts/Poppins-ExtraBold.ttf";
import montserratUrl from "../assets/fonts/Montserrat-VF.ttf";
import loraUrl from "../assets/fonts/Lora-VF.ttf";
import { FPS, HEIGHT, WIDTH } from "../scene";

export const F_LILITA = "Lilita One";
export const F_POPPINS = "Poppins";
export const F_MONTSERRAT = "Montserrat";
export const F_LORA = "Lora";

/** Loads this group's faces once; the first frame waits for them (delayRender). */
export function useS0811Fonts(): void {
  const [handle] = useState(() => delayRender("S08-11 fonts"));
  useEffect(() => {
    Promise.all([
      loadFace(F_LILITA, lilitaUrl, "400"),
      loadFace(F_POPPINS, poppinsUrl, "800"),
      loadFace(F_MONTSERRAT, montserratUrl, "100 900"),
      loadFace(F_LORA, loraUrl, "400 700"),
    ])
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
}

export type Cam = { x: number; y: number; zoom: number; rotate: number };

export const camAt = (keys: CamKey[], frame: number): Cam => {
  const c = cameraAt(keys, frame, FPS);
  return { x: c.x, y: c.y, zoom: c.zoom, rotate: c.rotate };
};

/**
 * CSS for a full-frame plane at depth `d` (1 = the focal plane, <1 farther: it zooms less than
 * the camera, so it parallaxes; >1 nearer). World coordinates are screen px at zoom 1.
 */
export const planeTransform = (c: Cam, d = 1): string =>
  `translate(${WIDTH / 2}px, ${HEIGHT / 2}px) rotate(${c.rotate}deg) scale(${c.zoom ** d}) translate(${-c.x}px, ${-c.y}px)`;

/** Screen position of the world point (wx, wy) on plane `d` (rotation ignored: it is 2 deg at most). */
export const project = (c: Cam, wx: number, wy: number, d = 1): { x: number; y: number; scale: number } => {
  const s = c.zoom ** d;
  return { x: WIDTH / 2 + (wx - c.x) * s, y: HEIGHT / 2 + (wy - c.y) * s, scale: s };
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ease = (v: number, f = Easing.inOut(Easing.cubic)) => f(clamp01(v));
/** 0..1 progress of `frame` over [a, b], eased. */
export const prog = (frame: number, a: number, b: number, f = Easing.inOut(Easing.cubic)) =>
  f(clamp01((frame - a) / (b - a)));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export { interpolate, Easing };

/** Full-frame absolutely positioned plane that the per-layer camera transform drives. */
export const planeStyle = (c: Cam, d = 1): React.CSSProperties => ({
  position: "absolute",
  left: 0,
  top: 0,
  width: WIDTH,
  height: HEIGHT,
  transformOrigin: "0 0",
  transform: planeTransform(c, d),
});
