import type React from "react";
import { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, Img, Solid, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { lightLeak } from "@remotion/effects/light-leak";
import { vignette } from "@remotion/effects/vignette";
import { halftone } from "@remotion/effects/halftone";
import { duotone } from "@remotion/effects/duotone";
import { paper } from "@remotion/effects/paper";
import { Grain } from "../../src/texture";
import { FONT_MONO, loadFace } from "../../src/type/fonts";
import monoUrl from "../../assets/fonts/JetBrainsMono-VF.ttf";
// Assets live in <studio>/assets (not in public/): the bundler imports them, no staticFile and no move.
import picture from "../../assets/img/piranesi-campo-vaccino.jpg";
import cutRider from "../../assets/cut/cut-figure-cavalier.png";
import cutWalker from "../../assets/cut/cut-figure-walker.png";

// Seven looks on one public-domain etching with calm areas (Piranesi, Campo Vaccino). Looks 1-6
// are split screens: raw on the left, the effect on the right, a thin divider that wipes in from
// the right edge, holds, and wipes back out. Look 7 (motion blur) is its own scene on a plain
// ground. 30 fps.
const LEAD = 12;
const TAIL = 24;
const LENGTHS = [72, 72, 72, 72, 72, 72, 132] as const;
const FADE = 14;
export const T07_FPS = 30;
export const T07_DURATION = LEAD + LENGTHS.reduce((a, b) => a + b, 0) + TAIL;

const LOOKS = [
  "Grain: noise() re-dealt at 24 fps (shown at 90%; film baseline is 6%)",
  "Halftone: 7 px pitch, ink dots on paper, 45 deg screen",
  "Duotone: ink to paper",
  "Paper: generated fibre and folds",
  "Light leak: lightLeak(), screen blend at 40%",
  "Vignette: vignette() edge falloff",
  "Motion blur: CameraMotionBlur, 360 deg shutter (top) vs none (bottom)",
] as const;

const startOf = (i: number) => LEAD + LENGTHS.slice(0, i).reduce((a, b) => a + b, 0);
const SPLIT = 960;
const W = 1920;

/** The plate of the etching, cropped to the engraved area so the paper margin never shows. */
const Photo: React.FC<{ effects?: React.ComponentProps<typeof Img>["effects"] }> = ({ effects }) => (
  <Img src={picture} effects={effects} style={{ position: "absolute", left: -487, top: -330, width: 2866, height: 1998 }} />
);

/** Divider x for look `i`: wipes in from the right edge, holds at SPLIT, wipes out again. */
const useWipe = (i: number): number => {
  const frame = useCurrentFrame();
  const s = startOf(i);
  const e = s + LENGTHS[i];
  return interpolate(frame, [s - FADE, s + FADE, e - FADE, e + FADE], [W, SPLIT, SPLIT, W], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
};

/**
 * One split-screen look. `children` is the whole treated picture (photo plus any overlay); it is
 * clipped to the right of the divider, so blend modes inside it stay local to the treated half.
 */
const Split: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => {
  const x = useWipe(i);
  if (x >= W) return null;
  return (
    <>
      <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${x}px)`, isolation: "isolate" }}>{children}</AbsoluteFill>
      <div style={{ position: "absolute", left: x - 1.5, top: 0, width: 3, height: "100%", background: "#f4efe4", boxShadow: "0 0 8px rgba(0,0,0,0.6)" }} />
      <Tag x={x - 130} text="raw" />
      <Tag x={x + 20} text="effect" />
    </>
  );
};

const Tag: React.FC<{ x: number; text: string }> = ({ x, text }) => (
  <div style={{ position: "absolute", left: x, top: 28, padding: "4px 12px", borderRadius: 5, background: "rgba(21,19,15,0.72)", color: "#f4efe4", fontFamily: FONT_MONO, fontSize: 22 }}>{text}</div>
);

const Label: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 48, bottom: 40, height: 40, fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 0.4, color: "#f4efe4" }}>
      {LOOKS.map((text, i) => {
        const s = startOf(i);
        const o = interpolate(frame, [s - 8, s + 6, s + LENGTHS[i] - 6, s + LENGTHS[i] + 8], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return o > 0 ? (
          <div key={text} style={{ position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", padding: "6px 16px", borderRadius: 6, background: "rgba(21,19,15,0.72)", opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>
            {i + 1}/7  {text}
          </div>
        ) : null;
      })}
    </div>
  );
};

const LightLeakLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = startOf(4);
  const progress = interpolate(frame, [s, s + LENGTHS[4]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <Solid width={width} height={height} effects={[lightLeak({ seed: 3, progress })]} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.4 }} />;
};

/**
 * The moving figure. It reads the frame itself, inside the blur wrapper: CameraMotionBlur
 * re-renders its children at sub-frame times, so the position must be derived below it.
 */
const Figure: React.FC<{ src: string; y: number }> = ({ src, y }) => {
  const frame = useCurrentFrame();
  const s = startOf(6);
  const x = interpolate(frame, [s + 6, s + LENGTHS[6] - 6], [-420, 1920], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  return <Img src={src} style={{ position: "absolute", left: x, top: y, height: 460 }} />;
};

const Sweep: React.FC<{ src: string; y: number; blur: boolean }> = ({ src, y, blur }) =>
  blur ? (
    <CameraMotionBlur shutterAngle={360} samples={12}>
      <Figure src={src} y={y} />
    </CameraMotionBlur>
  ) : (
    <AbsoluteFill>
      <Figure src={src} y={y} />
    </AbsoluteFill>
  );

/** Plain paper ground that fades in under the motion-blur scene, so the figures read cleanly. */
const MotionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const s = startOf(6);
  const e = s + LENGTHS[6];
  const o = interpolate(frame, [s - FADE, s + 4, e - 4, e + FADE], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ backgroundColor: "#e6dcc6" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 538, height: 3, background: "rgba(28,26,23,0.35)" }} />
      <Sweep src={cutRider} y={50} blur />
      <Sweep src={cutWalker} y={575} blur={false} />
    </AbsoluteFill>
  );
};

/** Holds the render until the bundled mono (labels) is ready. */
function useMonoFace(): void {
  const [handle] = useState(() => delayRender("T07 fonts"));
  useEffect(() => {
    loadFace(FONT_MONO, monoUrl, "100 800")
      .catch((e) => console.error(e))
      .finally(() => continueRender(handle));
  }, [handle]);
}

export const T07Texture: React.FC = () => {
  useMonoFace();
  return (
  <AbsoluteFill style={{ backgroundColor: "#15130f" }}>
    <Photo />

    <Split i={0}>
      <Photo />
      <Grain opacity={0.9} seed={1} stepFps={24} />
    </Split>
    <Split i={1}>
      <AbsoluteFill style={{ backgroundColor: "#efe8d8" }} />
      <Photo effects={[halftone({ shape: "circle", dotSize: 7, dotSpacing: 7, rotation: 45, colorMode: "solid", dotColor: "#1c1a17" })]} />
    </Split>
    <Split i={2}>
      <Photo effects={[duotone({ darkColor: "#1c2a44", lightColor: "#f1dfb8" })]} />
    </Split>
    <Split i={3}>
      <Photo effects={[paper({ amount: 0.9, seed: 6, colorFront: "#b98a4a", colorBack: "#fff1cf", fiber: 0.6, crumples: 0.5, folds: 0.8 })]} />
    </Split>
    <Split i={4}>
      <Photo />
      <LightLeakLayer />
    </Split>
    <Split i={5}>
      <Photo effects={[vignette({ amount: 0.9, radius: 0.5, feather: 0.6 })]} />
    </Split>

    <MotionScene />
    <Label />
  </AbsoluteFill>
  );
};
