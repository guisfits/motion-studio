import { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, Sequence, cancelRender, continueRender, delayRender, interpolate, useCurrentFrame } from "remotion";
import { CircleMark, Counter, FONT_MONO, FONT_SCRIPT, Handwrite, Typewriter, loadFace } from "../../src/type";
import monoUrl from "../../assets/fonts/JetBrainsMono-VF.ttf";
import scriptUrl from "../../assets/fonts/HomemadeApple-Regular.ttf";
import genesis from "../../assets/img/gutenberg-genesis.jpg";
import virgin from "../../assets/img/durer-virgin-st-john.jpg";

// Four type devices on two engraved pages: a counter clicking up to 1.455 (pt-BR thousands) and a
// typewritten line under it; then a sentence with a circle drawn round "luz" and a handwritten
// margin note. Events at 0.3, 2.5, 3.0, 6.0, 8.5 and 10.5 s; the pages slide, nothing pops in.
export const T15_DURATION = 420;

const INK = "#1d1a16";
const PAPER = "#ece4d4";
const JOIN = 14;
const SCENE_B = 180;
const OFF = JOIN / 30; // scene B mounts as the slide starts, so its landings shift by the join

const slide = Easing.inOut(Easing.cubic);

// The engraving drifts slowly under the plate so the page is never still between events.
const Page: React.FC<{ src: string; position: string; children: React.ReactNode }> = ({ src, position, children }) => {
  const frame = useCurrentFrame();
  const drift = 1 + frame * 0.0006;
  return (
  <AbsoluteFill>
    <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: position, filter: "sepia(0.35) brightness(0.62) contrast(1.05)", transform: `scale(${drift})` }} />
    {children}
  </AbsoluteFill>
  );
};

const Plate: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: PAPER, color: INK, boxShadow: "0 18px 40px rgba(20, 12, 6, 0.55)", padding: "56px 84px", ...style }}>{children}</div>
);

const SceneA: React.FC = () => (
  <Page src={genesis} position="50% 30%">
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Plate style={{ textAlign: "center", width: 1760 }}>
        <Counter to={1455} at={2.5} dur={66} style={{ fontSize: 260, fontWeight: 700, lineHeight: 1.1 }} />
        <div style={{ height: 3, background: INK, opacity: 0.35, margin: "16px 0 30px" }} />
        <Typewriter text="a primeira Bíblia impressa" at={3} cps={14} stepFps={12} style={{ fontSize: 100, fontWeight: 500 }} />
      </Plate>
    </AbsoluteFill>
  </Page>
);

const SceneB: React.FC = () => (
  <Page src={virgin} position="50% 20%">
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Plate style={{ width: 1760, minHeight: 800, padding: "80px 100px" }}>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 600, fontSize: 140, lineHeight: 1.3 }}>
          Onde havia trevas, <br />
          fez-se{" "}
          <CircleMark at={2.5 + OFF} dur={22} seed="luz" pad={0.22} strokeWidth="0.05em">
            luz
          </CircleMark>
          .
        </div>
        <Handwrite lines={["ver Gênesis 1:3", "a primeira palavra de Deus"]} at={4.5 + OFF} dur={3.2} style={{ fontSize: 84, marginTop: 56, marginLeft: 380 }} />
      </Plate>
    </AbsoluteFill>
  </Page>
);

export const T15TypeDevices: React.FC = () => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("T15 fonts"));
  useEffect(() => {
    Promise.all([loadFace(FONT_MONO, monoUrl, "100 800"), loadFace(FONT_SCRIPT, scriptUrl, "400")])
      .then(() => continueRender(handle))
      .catch((e) => cancelRender(e));
  }, [handle]);

  const t = interpolate(frame, [SCENE_B - JOIN, SCENE_B], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: slide });
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${-t * 1920}px)` }}>
        <SceneA />
      </AbsoluteFill>
      <Sequence from={SCENE_B - JOIN} layout="none">
        <AbsoluteFill style={{ transform: `translateX(${(1 - t) * 1920}px)` }}>
          <SceneB />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
