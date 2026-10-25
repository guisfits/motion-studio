import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Phone3D, type PhoneBody, type PhoneFinish, type PhoneScreenDraw } from "../../src/three";
import virgin from "../../assets/img/durer-virgin-st-john.jpg";
import ground from "../../assets/img/piranesi-campo-vaccino.jpg";

// Technique 17: two phone bodies from data. `Phone3D` takes a `body` (millimetres) and a `finish`;
// the engine holds no phone model, so these two are generic: one with a full-width camera plateau,
// one with a camera bar and a punch-hole selfie camera. Both turn from the front to the back.
export const T17_DURATION = 90;

// Lens layout of the plateau, in plateau space (+x = right seen from the front).
const PLATEAU_BODY: PhoneBody = {
  width: 71.9,
  height: 150,
  depth: 8.75,
  cornerRadius: 12.6,
  edgeBevel: 1.6,
  glassInset: 0.9,
  screen: { width: 66.6, height: 144.2, radius: 10.3 },
  rear: {
    kind: "plateau",
    height: 46,
    rise: 1.3,
    bevel: 0.9,
    bottomRadius: 7,
    lenses: [
      { x: 22.8, y: 9.4, ringRadius: 7.7, glassRadius: 6.3, coreRadius: 2.8 },
      { x: 22.8, y: -9.4, ringRadius: 7.7, glassRadius: 6.3, coreRadius: 2.8 },
      { x: 6.6, y: 0, ringRadius: 7.7, glassRadius: 6.3, coreRadius: 2.8 },
    ],
    flash: { x: -24, y: 9, radius: 2.4 },
    sensors: [
      { x: -24, y: -9, radius: 2.4, tone: "glass" },
      { x: -14.5, y: 9, radius: 0.6, tone: "dark" },
    ],
    pane: { inset: 3.4, top: 48.6, bottom: 3.4, radius: 3, bottomRadius: 9.2 },
  },
  buttons: [
    { side: -1, top: 30, length: 7 },
    { side: -1, top: 44, length: 11.5 },
    { side: -1, top: 58, length: 11.5 },
    { side: 1, top: 49, length: 17 },
    { side: 1, top: 102, length: 18, glass: true },
  ],
  curveSegments: 48,
  bevelSegments: 8,
};

const BAR_BODY: PhoneBody = {
  width: 72,
  height: 152.8,
  depth: 8.5,
  cornerRadius: 11.4,
  edgeBevel: 0.8,
  glassInset: 0.6,
  screen: { width: 66.4, height: 148.1, radius: 8.6 },
  punch: { radius: 1.55, top: 4.6 },
  rear: {
    kind: "bar",
    height: 25,
    rise: 1.4,
    offsetTop: 15.5,
    bevel: 0.6,
    lenses: [
      { x: 22, y: 0, ringRadius: 5.6, glassRadius: 4.6, coreRadius: 2 },
      { x: 7.5, y: 0, ringRadius: 5.6, glassRadius: 4.6, coreRadius: 2 },
      { x: -7, y: 0, ringRadius: 5.6, glassRadius: 4.6, coreRadius: 2 },
    ],
    flash: { x: -21.5, y: 0, radius: 1.9 },
    sensors: [{ x: -28.5, y: 0, radius: 0.7, tone: "dark" }],
    pane: { inset: 1, radius: 10.4 },
  },
  buttons: [
    { side: 1, top: 36, length: 14 },
    { side: 1, top: 58, length: 9 },
  ],
  curveSegments: 48,
  bevelSegments: 8,
};

const ENV = { src: ground, blur: 12, gain: 1.5 };
const GRAPHITE: PhoneFinish = { frame: "#1d1d20", pane: "#18181b", roughness: 0.34, metalness: 1, clearcoat: 0.25, env: ENV, glare: 0.35 };
const SAGE: PhoneFinish = { frame: "#8b9484", pane: "#a1a998", roughness: 0.26, paneRoughness: 0.62, metalness: 1, clearcoat: 0.25, env: ENV, glare: 0.35 };

// A flat UI mock for the second phone's screen (a draw function, so no picture is needed).
const drawHome: PhoneScreenDraw = (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#f3ead8");
  g.addColorStop(1, "#d9c9a8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#2a2118";
  ctx.font = `600 ${w * 0.16}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("9:41", w / 2, h * 0.3);
  ctx.fillStyle = "rgba(42,33,24,.18)";
  for (let i = 0; i < 3; i++) ctx.fillRect(w * 0.1, h * (0.42 + i * 0.14), w * 0.8, h * 0.1);
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const turn = interpolate(frame, [0, T17_DURATION - 1], [0, 1], { easing: Easing.bezier(0.45, 0, 0.2, 1) });
  const ry = -0.5 + turn * 3.9;
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fff4dd", "#b9a98a", 0.4]} />
      <directionalLight position={[-3, 4.5, 10]} intensity={2.4} />
      <directionalLight position={[5, 2, -4]} intensity={1.6} color="#e8eeff" />
      <Phone3D screen={virgin} body={PLATEAU_BODY} finish={GRAPHITE} size={[2.2, 4.5]} position={[-2.1, 0, 0]} rotateY={ry} rotateX={0.08} />
      <Phone3D screen={drawHome} body={BAR_BODY} finish={SAGE} size={[2.2, 4.5]} position={[2.1, 0, 0]} rotateY={ry} rotateX={0.08} />
    </>
  );
};

export const T17PhoneBodies: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#cdbfa6" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 32, position: [0, 0, 10.4], near: 0.1, far: 60 }}>
        <Scene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
