import type React from "react";
import { useEffect, useState } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, interpolate, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { SetDown } from "../../src/paper";
import { tornWipe } from "../../src/transitions";
import { Grain } from "../../src/texture";
import { FONT_FRAKTUR, loadFace } from "../../src/type/fonts";
import { InkSpread, Smoke, Water } from "../../src/fx";
import frakturUrl from "../../assets/fonts/UnifrakturCook-Bold.ttf";
import mapUrl from "../../assets/img/ortelius-1572-world-map.jpg";
import cutMoses from "../../assets/cut/cut-moses.png";

// Organic FX demo (technique 13): ink blooming under a title, water rippling over an engraved sea,
// smoke drifting in front of a cut-out. Every piece is carried in from outside the frame; 15 s, 30 fps.
export const T13_FPS = 30;
const SCENES = [160, 160, 174] as const;
const JOIN = 22;
export const T13_DURATION = SCENES.reduce((a, b) => a + b, 0) - 2 * JOIN;

const PAPER = "#e6dcc6";
const SHEET = "#f1e9d6";
const INK = "#15110c";
// Seconds to whole frames.
const s = (sec: number) => Math.round(sec * T13_FPS);

/** Passage 1: a paper sheet, an ink stain blooming across it (paper left showing round it), the title over it. */
const InkPassage: React.FC = () => (
  <>
    <SetDown delay={0} from="top" shadow={1} style={{ left: 180, top: 130 }}>
      <div style={{ position: "relative", width: 1560, height: 780, background: SHEET, overflow: "hidden" }}>
        <InkSpread width={1560} height={780} start={s(0.6)} duration={s(3.4)} seed={4} scale={240} style={{ left: 0, top: 0 }} />
      </div>
    </SetDown>
    <SetDown delay={1.9} from="bottom" shadow={1.2} rotate={-1.2} style={{ left: 180, top: 130, width: 1560, height: 780 }}>
      <div style={{ width: 1560, height: 780, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_FRAKTUR, fontSize: 150, lineHeight: 1, color: SHEET, whiteSpace: "nowrap" }}>
        In the Beginning
      </div>
    </SetDown>
    <Slip text="Ink" delay={3.5} from="right" rotate={-2} style={{ left: 1280, top: 800 }} />
  </>
);

// Sea outlines in 1000-px map coordinates (Atlantic, Pacific, Indian Ocean), mapped into the plate.
const SEAS: readonly (readonly [number, number][])[] = [
  [[360, 290], [420, 270], [500, 265], [515, 320], [510, 360], [540, 400], [560, 430], [520, 470], [440, 480], [400, 460], [430, 420], [470, 390], [470, 350], [430, 320], [400, 300]],
  [[30, 320], [150, 300], [190, 330], [240, 350], [290, 420], [330, 470], [300, 500], [150, 500], [40, 470]],
  [[690, 350], [760, 350], [800, 400], [790, 480], [700, 480], [690, 420]],
];
const MAP = { left: -162, top: -414, width: 2300, height: 1590 };
const seaPath = `path("${SEAS.map((poly) => "M" + poly.map(([x, y]) => `${Math.round((x * MAP.width) / 1000 + MAP.left)} ${Math.round((y * MAP.width) / 1000 + MAP.top)}`).join("L") + "Z").join("")}")`;

/** Passage 2: the engraved map fills the frame; only the sea ripples, the land stays still. */
const WaterPassage: React.FC = () => {
  const frame = useCurrentFrame();
  const surge = interpolate(frame, [s(2.0), s(2.9), s(3.8)], [1.2, 1.7, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <SetDown delay={0} from="left" rotate={-0.6} shadow={1.2} style={{ left: 110, top: 80 }}>
        <Water src={mapUrl} width={1700} height={920} image={MAP} clipPath={seaPath} start={s(0.7)} rise={s(1.2)} strength={surge} />
      </SetDown>
      <Slip text="Waters" delay={3.4} from="bottom" rotate={2} style={{ left: 760, top: 900 }} />
    </>
  );
};

/** Passage 3: the large cut-out on its dark ground, smoke wisps crossing in front of it. */
const SmokePassage: React.FC = () => {
  const wisps = "radial-gradient(ellipse 60% 55% at 28% 48%, #000 30%, transparent 100%)";
  return (
    <>
      <SetDown delay={0} from="right" rotate={0.6} shadow={1.2} style={{ left: 210, top: 90 }}>
        <div style={{ width: 1500, height: 900, background: "#1d1914" }} />
      </SetDown>
      <SetDown delay={0.9} from="bottom" shadow={1} style={{ left: 960 - 190, top: 140 }}>
        <Img src={cutMoses} style={{ display: "block", height: 800 }} />
      </SetDown>
      <div style={{ position: "absolute", left: 210, top: 90, width: 1500, height: 900, overflow: "hidden" }}>
        <Smoke width={1500} height={900} start={s(1.9)} rise={s(1.6)} density={0.45} seed={7} scale={210} />
        <Smoke width={1500} height={900} start={s(3.3)} rise={s(1.4)} density={0.5} seed={21} scale={190} style={{ WebkitMaskImage: wisps, maskImage: wisps }} />
      </div>
      <Slip text="Smoke" delay={4.0} from="left" rotate={2} style={{ left: 260, top: 860 }} />
    </>
  );
};

/** A caption slip carried in from the given side: the hero label of its passage. */
const Slip: React.FC<{ text: string; delay: number; from: "top" | "bottom" | "left" | "right"; rotate: number; style: React.CSSProperties }> = ({ text, delay, from, rotate, style }) => (
  <SetDown delay={delay} from={from} rotate={rotate} shadow={1} style={style}>
    <div style={{ padding: "6px 34px 14px", background: SHEET, border: "2px solid rgba(21,17,12,0.5)", fontFamily: FONT_FRAKTUR, fontSize: 84, color: INK, whiteSpace: "nowrap" }}>{text}</div>
  </SetDown>
);

/** Holds the render until the bundled Fraktur is ready. */
function useFraktur(): void {
  const [handle] = useState(() => delayRender("T13 fonts"));
  useEffect(() => {
    loadFace(FONT_FRAKTUR, frakturUrl, "700")
      .catch((e) => console.error(e))
      .finally(() => continueRender(handle));
  }, [handle]);
}

// Plain ground colour under a scene.
const Ground: React.FC<{ children: React.ReactNode }> = ({ children }) => <AbsoluteFill style={{ backgroundColor: PAPER }}>{children}</AbsoluteFill>;
const timing = linearTiming({ durationInFrames: JOIN });

// The demo: ink, water and smoke scenes joined by torn wipes.
export const T13Fx: React.FC = () => {
  useFraktur();
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES[0]}>
          <Ground><InkPassage /></Ground>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={tornWipe({ direction: "left", seed: "t13-a" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={SCENES[1]}>
          <Ground><WaterPassage /></Ground>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={tornWipe({ direction: "up", seed: "t13-b" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={SCENES[2]}>
          <Ground><SmokePassage /></Ground>
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Grain opacity={0.06} seed={2} />
    </AbsoluteFill>
  );
};
