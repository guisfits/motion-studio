import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { SetDown, Tape } from "../../src/paper";
import { FONT_FRAKTUR, FONT_MONO, loadFace } from "../../src/type";
import { tornWipe } from "../../src/transitions/tornWipe";
import { RouteMap, Timeline, Tree } from "../../src/diagram";
// Public-domain fixture (assets/README.md), imported so the bundler serves it.
import monoUrl from "../../assets/fonts/JetBrainsMono-VF.ttf";
import frakturUrl from "../../assets/fonts/UnifrakturCook-Bold.ttf";
import ortelius from "../../assets/img/ortelius-1572-world-map.jpg";

const JOIN = 20;
const SCENE = [195, 180, 250] as const;
export const T04_DURATION = SCENE[0] + SCENE[1] + SCENE[2] - 2 * JOIN;

const INK = "#3a2a1c";
const PAPER = "#f4efe3";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Hero caption on a paper tag, set down from the left. */
const Tag: React.FC<{ text: string; delay: number; left: number; top: number; rotate?: number }> = ({
  text,
  delay,
  left,
  top,
  rotate = -1.5,
}) => (
  <SetDown delay={delay} from="left" rotate={rotate} size={[760, 150]} style={{ left, top }}>
    <div
      style={{
        background: PAPER,
        color: INK,
        fontFamily: FONT_FRAKTUR,
        fontWeight: 700,
        fontSize: 104,
        lineHeight: 1.15,
        padding: "4px 40px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  </SetDown>
);

/** Scene 1: a route inked across an old map; a place tag is set down at every stop. */
const MAP = { left: 280, top: 120, w: 1360, h: 940 };
const ROUTE: [number, number][] = [
  [0.535, 0.31],
  [0.5, 0.45],
  [0.45, 0.54],
  [0.6, 0.64],
  [0.745, 0.42],
];
const STOPS = ["Lisbon", "Cape Verde", "Brazil", "Good Hope", "Calicut"];
// Tag offset from each stop (px), chosen to sit on open sea rather than over the route.
const TAG_AT: [number, number][] = [[-215, -30], [-300, -50], [-195, -25], [-120, 45], [30, 40]];
// Seconds at which the route head reaches each stop (the head waits while a tag lands).
const ARRIVE = [1.5, 2.6, 3.7, 4.9, 6.0];
const LEG = 0.85;

const stopProgress = (): number[] => {
  const px = ROUTE.map(([x, y]) => [x * MAP.w, y * MAP.h]);
  const seg = px.slice(1).map((p, i) => Math.hypot(p[0] - px[i][0], p[1] - px[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  return seg.reduce<number[]>((acc, s) => [...acc, acc[acc.length - 1] + s / total], [0]);
};

const VoyageScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const at = stopProgress();
  // Keyframes: wait at a stop, travel the leg in LEG s.
  const times = ARRIVE.flatMap((a, i) => (i === 0 ? [a] : [a - LEG, a]));
  const values = at.flatMap((v, i) => (i === 0 ? [v] : [at[i - 1], v]));
  const progress = interpolate(t, times, values, clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#d8d0bf" }}>
      <SetDown delay={0.2} from="bottom" dur={0.8} size={[MAP.w, MAP.h]} rotate={-1} style={{ left: MAP.left, top: MAP.top }}>
        <RouteMap image={ortelius} route={ROUTE} progress={t < ARRIVE[0] ? 0 : progress} width={MAP.w} height={MAP.h} />
      </SetDown>
      <Tag text="The Voyage" delay={0.9} left={60} top={24} />
      <div style={{ position: "absolute", left: MAP.left, top: MAP.top, width: MAP.w, height: MAP.h }}>
        {ROUTE.map(([x, y], i) => (
          <SetDown
            key={STOPS[i]}
            delay={ARRIVE[i] - 0.1}
            from="top"
            size={[330, 80]}
            rotate={i % 2 ? 2 : -2}
            style={{ left: x * MAP.w + TAG_AT[i][0], top: y * MAP.h + TAG_AT[i][1] }}
          >
            <div style={{ background: PAPER, color: INK, fontFamily: FONT_MONO, fontSize: 36, fontWeight: 700, padding: "8px 24px", whiteSpace: "nowrap" }}>
              {STOPS[i]}
            </div>
          </SetDown>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const STRIP = { left: 30, top: 170, w: 1860, h: 890 };

/** Scene 2: dates set down one by one on a ruled strip while the axis line draws. */
const TimelineScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#cfc5ae" }}>
    <SetDown delay={0.2} from="right" dur={0.8} size={[STRIP.w, STRIP.h]} rotate={0.6} style={{ left: STRIP.left, top: STRIP.top }}>
      <div style={{ width: STRIP.w, height: STRIP.h, background: "#e9e1cf" }} />
    </SetDown>
    <Tag text="A Century in Dates" delay={0.9} left={60} top={40} rotate={1} />
    <div style={{ position: "absolute", left: STRIP.left, top: STRIP.top }}>
      <Timeline
        items={[
          { year: 1517, label: "Founding" },
          { year: 1521, label: "Assembly" },
          { year: 1534, label: "Charter" },
          { year: 1546, label: "Council" },
          { year: 1555, label: "Treaty" },
        ]}
        width={STRIP.w}
        height={STRIP.h}
        delay={1.4}
        stagger={0.75}
      />
    </div>
  </AbsoluteFill>
);

const TREE_SHEET = { left: 30, top: 180, w: 1860, h: 870 };

/** Scene 3: a lineage growing node by node, branches drawing on as each card lands. */
const TreeScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#d3c9b3" }}>
    <SetDown delay={0.2} from="bottom" dur={0.8} size={[TREE_SHEET.w, TREE_SHEET.h]} rotate={-0.6} style={{ left: TREE_SHEET.left, top: TREE_SHEET.top }}>
      <div style={{ width: TREE_SHEET.w, height: TREE_SHEET.h, background: "#e9e1cf" }} />
    </SetDown>
    <Tag text="The Lineage" delay={0.9} left={60} top={40} />
    <div style={{ position: "absolute", left: TREE_SHEET.left + 60, top: TREE_SHEET.top + 35 }}>
      <Tree
        nodes={[
          { id: "alder", label: "Alder" },
          { id: "brook", label: "Brook", parent: "alder" },
          { id: "cole", label: "Cole", parent: "alder" },
          { id: "dale", label: "Dale", parent: "alder" },
          { id: "ames", label: "Ames", parent: "brook" },
          { id: "bell", label: "Bell", parent: "brook" },
          { id: "cade", label: "Cade", parent: "cole" },
          { id: "dean", label: "Dean", parent: "dale" },
          { id: "eli", label: "Eli", parent: "ames" },
        ]}
        width={TREE_SHEET.w - 120}
        height={TREE_SHEET.h - 70}
        delay={1.2}
        stagger={0.5}
      />
    </div>
    {/* Closing event: two tape strips fix the finished sheet. */}
    <Tape delay={6.4} rotate={35} width={260} top={975} style={{ left: 10 }} />
    <Tape delay={7.0} rotate={35} width={260} top={150} style={{ left: 1650 }} />
  </AbsoluteFill>
);

/** Diagram demo: map route, timeline, lineage tree, joined by torn-paper wipes. */
export const T04Diagram: React.FC = () => {
  const [handle] = useState(() => delayRender("T04 fonts"));
  useEffect(() => {
    Promise.all([loadFace(FONT_MONO, monoUrl, "100 800"), loadFace(FONT_FRAKTUR, frakturUrl, "700")])
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
  const join = linearTiming({ durationInFrames: JOIN });
  return (
    <AbsoluteFill style={{ backgroundColor: "#d8d0bf" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE[0]}>
          <VoyageScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={tornWipe({ direction: "left", seed: "t04-a" })} timing={join} />
        <TransitionSeries.Sequence durationInFrames={SCENE[1]}>
          <TimelineScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={tornWipe({ direction: "up", seed: "t04-b" })} timing={join} />
        <TransitionSeries.Sequence durationInFrames={SCENE[2]}>
          <TreeScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
