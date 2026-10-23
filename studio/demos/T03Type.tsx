import type { Caption } from "@remotion/captions";
import { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { fromWords } from "../../src/captions";
import { stepFrame } from "../../src/paper";
import {
  FONT_FRAKTUR,
  FONT_MONO,
  Highlight,
  Ransom,
  RevealWords,
  Strike,
  Underline,
  fitText,
  loadFace,
} from "../../src/type";
import monoUrl from "../../assets/fonts/JetBrainsMono-VF.ttf";
import frakturUrl from "../../assets/fonts/UnifrakturCook-Bold.ttf";
import vo1 from "../../assets/audio/vo-01.wav";
import vo2 from "../../assets/audio/vo-02.wav";
import vo3 from "../../assets/audio/vo-03.wav";
import words1 from "../../assets/audio/vo-01.words.json";
import words2 from "../../assets/audio/vo-02.words.json";
import words3 from "../../assets/audio/vo-03.words.json";

// Kinetic type timed to the narration: each word travels in and lands on its spoken onset, one
// annotation at a time lands on its own VO word. Scenes slide in and out (no bare cut).
export const T03_DURATION = 510;

const INK = "#1d1a16";
const GROUND = "#ece4d4";
const LEAD = 18; // frames of silence before a scene's voice starts
const JOIN = 12; // frames a scene takes to slide in or out

const caps = {
  one: fromWords(words1),
  two: fromWords(words2),
  three: fromWords(words3),
};

const slide = Easing.inOut(Easing.cubic);

const Scene: React.FC<{ durationInFrames: number; last?: boolean; children: React.ReactNode }> = ({ durationInFrames, last, children }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, JOIN], [1, 0], { extrapolateRight: "clamp", easing: slide });
  const exit = last ? 0 : interpolate(frame, [durationInFrames - JOIN, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    easing: slide,
  });
  return (
    <AbsoluteFill style={{ transform: `translateX(${enter * 1920 - exit * 1920}px)`, justifyContent: "center", padding: "0 200px" }}>
      {children}
    </AbsoluteFill>
  );
};

const Voice: React.FC<{ src: string; children: React.ReactNode }> = ({ src, children }) => (
  <Sequence from={LEAD} layout="none">
    <Html5Audio src={src} />
    {children}
  </Sequence>
);

// Title-card scale: cap height 0.73 em = 76 px = 7 % of the frame, at most 3 lines in a 1520 px box.
const SIZE = 104;
const line: React.CSSProperties = { fontFamily: FONT_MONO, fontWeight: 600, color: INK, fontSize: SIZE, lineHeight: 1.2 };

// Typed gloss at 12 fps: floor((stepped - tIn) / dur * len) + 1 characters, a caret on the pose.
const Typed: React.FC<{ text: string; tIn: number; dur: number; size: number }> = ({ text, tIn, dur, size }) => {
  const frame = useCurrentFrame();
  const stepped = stepFrame(frame, 30, 12);
  const n = stepped < tIn ? 0 : Math.min(text.length, Math.floor(((stepped - tIn) / dur) * text.length) + 1);
  return (
    <div style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: size, color: INK, marginTop: 40, whiteSpace: "pre", minHeight: size * 1.3 }}>
      {text.slice(0, n)}
      {n > 0 && n < text.length ? "\u258c" : ""}
    </div>
  );
};

const SceneBeginning: React.FC = () => (
  <Voice src={vo1}>
    <div style={line}>
      <RevealWords
        captions={caps.one}
        size={SIZE}
        renderWord={(c: Caption) => {
          const t = c.text.trim();
          if (t === "beginning") return <Highlight captions={caps.one} word="beginning">{t}</Highlight>;
          if (t === "written") return <Underline captions={caps.one} word="written">{t}</Underline>;
          return undefined;
        }}
      />
    </div>
  </Voice>
);

const SceneArgument: React.FC = () => (
  <Voice src={vo2}>
    <div style={line}>
      {/* "matters" itself is the ransom word below, so the plain line stops before it. */}
      <RevealWords
        captions={caps.two.filter((c) => c.text.trim() !== "matters.")}
        size={SIZE}
        renderWord={(c: Caption) => {
          const t = c.text.trim();
          if (t === "argument") return <Strike captions={caps.two} word="argument">{t}</Strike>;
          return undefined;
        }}
      />
      <div style={{ marginTop: 48, lineHeight: 1.1 }}>
        <Ransom text="MATTERS" size={230} captions={caps.two} word="matters" seed="matters" />
      </div>
    </div>
  </Voice>
);

// "MISERICÓRDIAS" auto-shrunk to 90% of the frame width; the highlighter wraps the whole word.
const CARD_WORD = "MISERICÓRDIAS";
const Card: React.FC<{ fontReady: boolean }> = ({ fontReady }) => {
  const size = useMemo(() => (fontReady ? fitText(CARD_WORD, FONT_FRAKTUR, 1920 * 0.9 - 80, 320) : 0), [fontReady]);
  return (
    <div style={{ fontFamily: FONT_FRAKTUR, fontSize: size, lineHeight: 1.3, color: INK, whiteSpace: "nowrap" }}>
      <Highlight at={0.5} dur={14}>{CARD_WORD}</Highlight>
    </div>
  );
};

const SceneLight: React.FC<{ fontReady: boolean }> = ({ fontReady }) => (
  <>
    <Voice src={vo3}>
      <div style={line}>
        <RevealWords
          captions={caps.three}
          size={SIZE}
          renderWord={(c: Caption) => {
            const t = c.text.trim();
            if (t === "light.") return <Highlight captions={caps.three} word="light">{t}</Highlight>;
            return undefined;
          }}
        />
        <Typed text="engraved c. 1500, in wood" tIn={92} dur={30} size={56} />
      </div>
    </Voice>
    <Sequence from={LEAD + 126} layout="none">
      <Slot>
        <Card fontReady={fontReady} />
      </Slot>
    </Sequence>
  </>
);

// The card replaces the sentence by sliding up over it.
const Slot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 10], [1080, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: GROUND, alignItems: "center", justifyContent: "center", transform: `translateY(${y}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

export const T03Type: React.FC = () => {
  const [handle] = useState(() => delayRender("T03 fonts"));
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    Promise.all([loadFace(FONT_MONO, monoUrl, "100 800"), loadFace(FONT_FRAKTUR, frakturUrl, "700")])
      .then(() => setFontReady(true))
      .catch((e) => console.error(e))
      .finally(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: GROUND }}>
      <Sequence from={0} durationInFrames={170}>
        <Scene durationInFrames={170}><SceneBeginning /></Scene>
      </Sequence>
      <Sequence from={158} durationInFrames={142}>
        <Scene durationInFrames={142}><SceneArgument /></Scene>
      </Sequence>
      <Sequence from={288} durationInFrames={T03_DURATION - 288}>
        <Scene durationInFrames={T03_DURATION - 288} last><SceneLight fontReady={fontReady} /></Scene>
      </Sequence>
    </AbsoluteFill>
  );
};
