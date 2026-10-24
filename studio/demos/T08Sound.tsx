import React, { useEffect, useState } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { SetDown, Tape, Torn, stepFrame, tornSplitClips } from "../../src/paper";
import { FONT_MONO, loadFace } from "../../src/type";
import { tornWipe } from "../../src/transitions";
import monoUrl from "../../assets/fonts/JetBrainsMono-VF.ttf";
import campoVaccino from "../../assets/img/piranesi-campo-vaccino.jpg";
import cutMoses from "../../assets/cut/cut-moses.png";
import cutSibyl from "../../assets/cut/cut-sibyl.png";
import {
  JOIN_FRAMES,
  P1_FRAMES,
  P1_HAND,
  P1_HERO,
  P1_TAPE,
  P1_TEAR,
  P1_WORD,
  P2_ARGUMENT,
  P2_CLOSE,
  P2_FRAMES,
  P2_HERO,
  P2_MAP,
  P2_STAMP_DUR,
  P2_STAMP_HIT,
  P2_TAPE_A,
  P2_TAPE_B,
  T08_DURATION as DURATION,
  delayFor,
} from "./T08Sound.cues";

// Sound-design demo: the render stays silent. Two passages (one per voice line) joined by a
// tornWipe; every paper event (sheet set down, card landing on its spoken word, tape, tear,
// stamp, the join) is timed from T08Sound.cues.ts, which also derives the cue list the mix uses.
export const T08_DURATION = DURATION;

const FPS = 30;
const INK = "#1d1a16";
const CARD = "#f4efe3";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sec = (s: number) => s * FPS;

// A printed sheet with a paper margin.
const Sheet: React.FC<{ src: string; w: number; h: number; pad?: number }> = ({ src, w, h, pad = 14 }) => (
  <div style={{ width: w, height: h, padding: pad, boxSizing: "border-box", background: CARD }}>
    <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.4) contrast(1.05)" }} />
  </div>
);

// Cut-out with a white die-cut rim.
const Cut: React.FC<{ src: string; w: number; h: number }> = ({ src, w, h }) => {
  const rim = [`3px 0`, `-3px 0`, `0 3px`, `0 -3px`].map((o) => `drop-shadow(${o} 0 #fbf8f1)`).join(" ");
  return (
    <div style={{ filter: rim }}>
      <Img src={src} style={{ width: w, height: h, display: "block" }} />
    </div>
  );
};

// A paper card carrying the one spoken word in hero type; it is set down so it lands on the word.
const WordCard: React.FC<{ word: string; w: number; h: number; size: number; at: number; x: number; y: number; rot: number; from?: "bottom" | "right" | "top" | "left" }> = ({
  word,
  w,
  h,
  size,
  at,
  x,
  y,
  rot,
  from = "bottom",
}) => (
  <SetDown delay={delayFor(at)} from={from} rotate={rot} margin={200} style={{ left: x, top: y }}>
    <div
      style={{
        width: w,
        height: h,
        background: CARD,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_MONO,
        fontWeight: 800,
        fontSize: size,
        color: INK,
        letterSpacing: -2,
      }}
    >
      {word}
    </div>
  </SetDown>
);

// The hero sheet of passage 1: it tears in two on P1_TEAR; the halves kick apart, ring, and
// settle with a clear gap and a pale fibre rim along both edges.
const H = { x: 90, y: 150, w: 1100, h: 770 };
const SPLIT = tornSplitClips("t08-hero", 50, 2.8);
const TornSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (stepFrame(frame, fps, 12) - sec(P1_TEAR)) / fps;
  const torn = t >= 0;
  const ring = torn ? Math.exp(-8 * t) * Math.sin(24 * t) : 0;
  const open = torn ? 1 - Math.exp(-12 * t) : 0;
  const top = { dy: -(48 * open + 30 * ring), rot: -(3 * open + 6 * ring) };
  const bottom = { dy: 42 * open + 34 * ring, rot: 3.4 * open + 8 * ring };
  const half = (clip: string, d: { dy: number; rot: number }, origin: string) => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: origin,
        transform: `translateY(${d.dy}px) rotate(${d.rot}deg)`,
        filter: torn ? `drop-shadow(4px 7px 4px rgba(20,12,6,${0.4 * Math.min(1, open * 3)}))` : undefined,
      }}
    >
      <Torn seed="t08-hero" clip={clip} fibre={torn ? "#fbf8f1" : null} style={{ width: H.w, height: H.h }}>
        <Sheet src={campoVaccino} w={H.w} h={H.h} />
      </Torn>
    </div>
  );
  return (
    <div style={{ position: "relative", width: H.w, height: H.h }}>
      {half(SPLIT.top, top, "50% 100%")}
      {half(SPLIT.bottom, bottom, "50% 0%")}
    </div>
  );
};

// Ink stamp: drops from above the frame, accelerating, and hits on P2_STAMP_HIT; a short squash
// absorbs the impact. Off-frame and invisible until it moves.
const Stamp: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  const hit = Math.round(sec(P2_STAMP_HIT));
  const dur = Math.round(sec(P2_STAMP_DUR));
  const p = interpolate(frame, [hit - dur, hit], [0, 1], clamp);
  const drop = (1 - p * p) * (y + 400);
  const since = Math.max(0, frame - hit);
  const squash = frame >= hit ? Math.exp(-0.5 * since) * Math.cos(since * 1.2) * 0.07 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translateY(${-drop}px) rotate(-6deg) scale(${1 - squash}, ${1 - squash * 1.2})`,
        opacity: frame < hit - dur ? 0 : 0.92,
        border: "12px solid #9a2a1c",
        color: "#9a2a1c",
        padding: "8px 40px",
        fontFamily: FONT_MONO,
        fontWeight: 800,
        fontSize: 150,
        letterSpacing: 4,
        borderRadius: 12,
        mixBlendMode: "multiply",
      }}
    >
      MATTERS
    </div>
  );
};

// Slow camera drift under the stepped paper, local to a passage.
const Stage: React.FC<{ ground: string; frames: number; children: React.ReactNode }> = ({ ground, frames, children }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, frames], [1, 1.02], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: ground, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// Passage 1 ("the word, written by hand"): hero sheet that tears, two word cards, one tape.
const PassageOne: React.FC = () => (
  <Stage ground="#d8d0bf" frames={P1_FRAMES}>
    <SetDown delay={P1_HERO} from="left" rotate={-1} margin={300} style={{ left: H.x, top: H.y }}>
      <TornSheet />
    </SetDown>
    <WordCard word="word" w={600} h={330} size={190} at={P1_WORD} x={1260} y={110} rot={1.5} from="right" />
    <WordCard word="hand" w={600} h={330} size={190} at={P1_HAND} x={1260} y={520} rot={-1.5} from="bottom" />
    <Tape delay={P1_TAPE} rotate={32} width={230} top={500} style={{ left: 1680 }} />
  </Stage>
);

// Passage 2 ("every map is an argument"): sibyl hero, map and argument cards, the stamp, tapes,
// a closing cut-out.
const PassageTwo: React.FC = () => (
  <Stage ground="#cdbfa6" frames={P2_FRAMES}>
    <SetDown delay={P2_HERO} from="left" rotate={-2} margin={200} style={{ left: 70, top: 190 }}>
      <Cut src={cutSibyl} w={336} h={700} />
    </SetDown>
    <WordCard word="map" w={700} h={290} size={190} at={P2_MAP} x={470} y={100} rot={1} from="top" />
    <WordCard word="argument" w={1040} h={270} size={140} at={P2_ARGUMENT} x={470} y={440} rot={-1} from="bottom" />
    <Tape delay={P2_TAPE_A} rotate={-30} width={220} top={420} style={{ left: 1390 }} />
    <Tape delay={P2_TAPE_B} rotate={30} width={220} top={80} style={{ left: 1030 }} />
    <Stamp x={540} y={770} />
    <SetDown delay={P2_CLOSE} from="right" rotate={2} margin={200} style={{ left: 1500, top: 190 }}>
      <Cut src={cutMoses} w={352} h={700} />
    </SetDown>
  </Stage>
);

export const T08Sound: React.FC = () => {
  const [handle] = useState(() => delayRender("T08 fonts"));
  useEffect(() => {
    loadFace(FONT_MONO, monoUrl, "100 800")
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={P1_FRAMES}>
        <PassageOne />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={tornWipe({ direction: "left", seed: "t08-join" })}
        timing={linearTiming({ durationInFrames: JOIN_FRAMES })}
      />
      <TransitionSeries.Sequence durationInFrames={P2_FRAMES}>
        <PassageTwo />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
