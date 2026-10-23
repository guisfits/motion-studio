import { createTikTokStyleCaptions } from "@remotion/captions";
import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fromWords, pageWindows, readingCheck, type PageWindow, type TimedWord } from "../../src/captions";
import { FONT_MONO, loadFace } from "../../src/type";
import monoUrl from "../../assets/fonts/JetBrainsMono-VF.ttf";
import bg from "../../assets/img/dore-moses-sinai.jpg";
import vo1 from "../../assets/audio/vo-01.wav";
import vo2 from "../../assets/audio/vo-02.wav";
import vo3 from "../../assets/audio/vo-03.wav";
import words1 from "../../assets/audio/vo-01.words.json";
import words2 from "../../assets/audio/vo-02.words.json";
import words3 from "../../assets/audio/vo-03.words.json";

// Word-timed caption pages in three modes over a busy engraving: long-form (<= 2 lines, <= 42
// chars), social chunks, and short chunks with the active word lit. The narration plays at
// RATE so the speech is slower than the reading limit; an overlay checks every page.
export const T09_DURATION = 480;

// Mirrors NORMS.caption in tools/checks/norms.mjs (that file has no type declarations).
const NORMS = { maxCps: 17, minLegibleS: 0.5, maxWords: 4, capHeight: [0.025, 0.045] as const };
const RATE = 0.8;
const H = 1080;
const W = 1920;
const FONT_SIZE = 56; // JetBrains Mono cap height 0.73 em -> 41 px = 3.8 % of the frame
const LEAD_F = 2; // the active word switches this many frames before its onset
const SAFE = { top: 0.1 * H, bottom: 0.9 * H };
const TAIL_MS = 800;
const ENTER_F = 6;

type Mode = { name: string; words: { words: TimedWord[] }; src: string; startS: number; combineMs: number; boxFrac: number };
const MODES: Mode[] = [
  { name: "long-form", words: words1, src: vo1, startS: 0.8, combineMs: 1200, boxFrac: 0.68 },
  { name: "social", words: words2, src: vo2, startS: 6.0, combineMs: 600, boxFrac: 0.8 },
  { name: "chunk", words: words3, src: vo3, startS: 10.4, combineMs: 800, boxFrac: 0.8 },
];

// Narration seconds -> master-timeline seconds (slowed by RATE, placed at startS).
const place = (m: Mode): { words: TimedWord[] } => ({
  words: m.words.words.map((x) => ({ w: x.w, s: m.startS + x.s / RATE, e: m.startS + x.e / RATE })),
});

const segments = MODES.map((m) => {
  const { pages } = createTikTokStyleCaptions({
    captions: fromWords(place(m)),
    combineTokensWithinMilliseconds: m.combineMs,
  });
  return { mode: m, windows: pageWindows(pages, TAIL_MS) };
});

const easeOut = Easing.out(Easing.cubic);

const PageView: React.FC<{ w: PageWindow; mode: Mode }> = ({ w, mode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const from = (w.fromMs / 1000) * fps;
  const to = (w.toMs / 1000) * fps;
  const p = interpolate(frame, [from - ENTER_F, from], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut });
  // The outgoing page fades over the incoming page's entrance, so a page is never swapped in place.
  const out = interpolate(frame, [to - ENTER_F, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const box = W * mode.boxFrac;
  return (
    <div
      style={{
        position: "absolute",
        left: (W - box) / 2,
        width: box,
        bottom: H - SAFE.bottom,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(${(1 - p) * 40}px)`,
        opacity: p * out,
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: FONT_SIZE,
          lineHeight: 1.4,
          textAlign: "center",
          color: "#f6f1e4",
          background: "rgba(14, 10, 6, 0.78)",
          padding: "10px 28px 14px",
          borderRadius: 6,
          whiteSpace: "pre-wrap",
          maxWidth: box,
        }}
      >
        {w.page.tokens.map((t, i) => {
          const active = ms >= t.fromMs - (LEAD_F / fps) * 1000 && ms < t.toMs;
          return (
            <span key={i} style={{ color: active ? "#ffd60a" : undefined, boxShadow: active ? "inset 0 -6px 0 rgba(255,214,10,.55)" : undefined }}>
              {i === 0 ? t.text.trimStart() : t.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

type Live = { w: PageWindow; mode: Mode };

// The pages on screen at a master-timeline frame: pages hold until the next begins, so during
// an entrance the outgoing page and the incoming one are both live (the latter last).
const liveWindows = (frame: number, fps: number): Live[] => {
  const ms = (frame / fps) * 1000;
  return segments.flatMap(({ mode, windows }) =>
    windows.filter((x) => ms >= x.fromMs - (ENTER_F / fps) * 1000 && ms < x.toMs).map((w) => ({ w, mode })),
  );
};

// Per-page reading check: green when CPS and visible time pass, red otherwise.
const Overlay: React.FC<{ live: Live }> = ({ live }) => {
  const text = live.w.page.text.trim();
  const r = readingCheck(text, live.w.toMs - live.w.fromMs, { maxCps: NORMS.maxCps, minS: NORMS.minLegibleS });
  const words = live.w.page.tokens.length;
  const ok = r.ok && words <= NORMS.maxWords + (live.mode.name === "long-form" ? 2 : 0) && (live.mode.name !== "long-form" || r.chars <= 42);
  return (
    <div style={{ position: "absolute", left: 40, top: 40, fontFamily: FONT_MONO, fontSize: 26, color: ok ? "#8be28b" : "#ff6b6b", background: "rgba(0,0,0,.6)", padding: "8px 14px" }}>
      {live.mode.name} | {r.chars} ch | {r.cps.toFixed(1)} cps | {r.seconds.toFixed(2)} s | {ok ? "OK" : "FAIL"}
    </div>
  );
};

export const T09Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("T09 fonts"));
  useEffect(() => {
    loadFace(FONT_MONO, monoUrl, "100 800")
      .catch((e) => console.error(e))
      .finally(() => continueRender(handle));
  }, [handle]);
  const zoom = interpolate(frame, [0, T09_DURATION], [1.04, 1.12]);
  const lives = liveWindows(frame, fps);
  const live = lives.at(-1);

  return (
    <AbsoluteFill style={{ background: "#14100b" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Img src={bg} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.9)" }} />
      </AbsoluteFill>
      {segments.map(({ mode }) => (
        <Sequence key={mode.name} from={Math.round(mode.startS * fps)} layout="none">
          <Html5Audio src={mode.src} playbackRate={RATE} />
        </Sequence>
      ))}
      {lives.map((l) => (
        <PageView key={`${l.mode.name}-${l.w.fromMs}`} w={l.w} mode={l.mode} />
      ))}
      {live ? <Overlay live={live} /> : null}
    </AbsoluteFill>
  );
};
