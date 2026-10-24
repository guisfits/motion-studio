import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { ThreeCanvas } from "@remotion/three";
import { DocZoom, HeroWord } from "../../src/devices";
import { tornWipe } from "../../src/transitions";
import { Book3D } from "../../src/three";
import { FONT_FRAKTUR, loadFace } from "../../src/type";
// Public-domain fixtures (assets/README.md).
import genesis from "../../assets/img/gutenberg-genesis.jpg";
import moses from "../../assets/img/dore-moses-sinai.jpg";
import riders from "../../assets/img/durer-four-riders.jpg";
import virgin from "../../assets/img/durer-virgin-st-john.jpg";
import sibyl from "../../assets/img/schedel-tiburtine-sibyl.jpg";
import campo from "../../assets/img/piranesi-campo-vaccino.jpg";
import cutMoses from "../../assets/cut/cut-moses.png";
import cutCavalier from "../../assets/cut/cut-figure-cavalier.png";
import frakturUrl from "../../assets/fonts/UnifrakturCook-Bold.ttf";

const A = 150; // doc zoom
const TEAR = 24; // stepped tear (12 fps)
const B1 = 80; // hero word one
const CUT1 = 12;
const B2 = 80; // hero word two
const CUT2 = 18;
const C = 160; // book
export const T16_DURATION = A + B1 + B2 + C - TEAR - CUT1 - CUT2;

const VELLUM = "#e9dfc7";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);
const ease = Easing.bezier(0.45, 0, 0.2, 1);

/** The desk the page lies on, and the page easing in from it so nothing pops. */
const DocScene: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: out });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #4a3a2a 0%, #1f1810 80%)" }}>
      <AbsoluteFill style={{ opacity: settle, transform: `scale(${1.05 - 0.05 * settle})` }}>
        <DocZoom
          src={genesis}
          x={0}
          y={0}
          size={[760, 1067]}
          rect={{ x: 0.12, y: 0.16, w: 0.3, h: 0.075 }}
          word={{ x: 0.172, y: 0.1815, w: 0.068, h: 0.0185 }}
          fill={0.7}
          pushFrom={10}
          pushTo={96}
          drift={0.08}
          sweep={{ at: 2.6 }}
          sweepFrames={16}
          color="rgba(255, 196, 40, 0.65)"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Ground: React.FC<{ tone: string }> = ({ tone }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, ${VELLUM} 0%, ${tone} 100%)` }} />
);

const MosesScene: React.FC = () => (
  <HeroWord
    text="VERBUM"
    at={0.8}
    edge="left"
    bleed={-0.04}
    size={380}
    top={200}
    rotate={-3}
    color="#8a2b1c"
    cutout={cutMoses}
    cutoutStyle={{ left: 745, top: 150, height: 800, width: 402 }}
  >
    <Ground tone="#cdbd98" />
  </HeroWord>
);

const CavalierScene: React.FC = () => (
  <HeroWord
    text="LUX"
    at={0.1}
    enter="slide"
    edge="right"
    bleed={0}
    size={500}
    top={180}
    rotate={2}
    color="#3b2a1a"
    cutout={cutCavalier}
    cutoutStyle={{ left: 700, top: 130, height: 840, width: 402 }}
  >
    <Ground tone="#c9b88f" />
  </HeroWord>
);

const PAGES = [moses, riders, campo, virgin, sibyl, moses, riders, campo, virgin, sibyl, moses, riders];
const turnAt = (frame: number) => interpolate(frame, [66, 146], [0, 0.5], { ...clamp, easing: ease });

const BookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 30], [0, 1], { ...clamp, easing: out });
  const open = interpolate(frame, [26, 70], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ background: "#e6dcc6" }}>
      <ThreeCanvas width={1920} height={1080} shadows="soft" camera={{ fov: 32, position: [0, 0.25, 10.8], near: 0.1, far: 60 }}>
        <ambientLight intensity={0.85} />
        <hemisphereLight args={["#fff4dd", "#b9a98a", 0.5]} />
        <directionalLight position={[-3, 4.5, 10]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} />
        <mesh position={[0, 0, -0.7]} receiveShadow>
          <planeGeometry args={[60, 36]} />
          <meshStandardMaterial color="#e6dcc6" roughness={1} />
        </mesh>
        <Book3D
          cover={genesis}
          pages={PAGES}
          progress={open}
          turn={turnAt}
          stepFps={8}
          rotateX={0.28 - open * 0.1}
          rotateY={-0.45 + open * 0.4}
          enter={enter}
          size={[3.7, 4.8]}
          from={[0, 12, 0]}
          position={[0, 0.25, 0]}
        />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export const T16DocDevices: React.FC = () => {
  const [handle] = useState(() => delayRender("T16 fonts"));
  useEffect(() => {
    loadFace(FONT_FRAKTUR, frakturUrl, "700")
      .catch((e) => console.error(e))
      .finally(() => continueRender(handle));
  }, [handle]);
  const lin = (d: number) => linearTiming({ durationInFrames: d });
  return (
    <AbsoluteFill style={{ background: "#1f1810" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={A}>
          <DocScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={tornWipe({ direction: "left", seed: "t16", stepFps: 12 })} timing={lin(TEAR)} />
        <TransitionSeries.Sequence durationInFrames={B1}>
          <MosesScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={lin(CUT1)} />
        <TransitionSeries.Sequence durationInFrames={B2}>
          <CavalierScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={lin(CUT2)} />
        <TransitionSeries.Sequence durationInFrames={C}>
          <BookScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
