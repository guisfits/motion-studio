import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { crossZoom } from "@remotion/transitions/cross-zoom";
import { bookFlip } from "@remotion/transitions/book-flip";
import { filmBurn } from "@remotion/transitions/film-burn";
import { tornWipe } from "../../src/transitions/tornWipe";
// Public-domain fixtures (assets/README.md).
import moses from "../../assets/img/dore-moses-sinai.jpg";
import riders from "../../assets/img/durer-four-riders.jpg";
import virgin from "../../assets/img/durer-virgin-st-john.jpg";
import campoVaccino from "../../assets/img/piranesi-campo-vaccino.jpg";
import sibyl from "../../assets/img/schedel-tiburtine-sibyl.jpg";
import merian from "../../assets/img/merian-alsatiae.jpg";
import ortelius from "../../assets/img/ortelius-1572-world-map.jpg";
import genesis from "../../assets/img/gutenberg-genesis.jpg";

const SCENE = 78; // frames per scene
const BUILTIN = 18; // built-in transition length
const TORN = 22; // 0.75 s, the baseline join
const MATCH_CUT_R = 300; // px radius of the circle both scenes share at the cut
const MATCH_LEAD = 30; // frames the circle closes/opens around the cut

// 9 scenes, 7 overlapping transitions + 1 match cut (no overlap).
const OVERLAPS = [BUILTIN, BUILTIN, BUILTIN, BUILTIN, BUILTIN, TORN, TORN];
export const T06_DURATION = SCENE * 9 - OVERLAPS.reduce((a, b) => a + b, 0);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PAPER = "#1b1510";

const Label: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      left: 56,
      bottom: 48,
      padding: "10px 20px",
      font: "600 30px/1 ui-monospace, Menlo, monospace",
      color: "#f4efe3",
      background: "rgba(20,12,6,0.72)",
      letterSpacing: 1,
    }}
  >
    {text}
  </div>
);

/** One PD image with a slow push-in; the frame is the scene-local clock. */
const ImageScene: React.FC<{ src: string; label: string; clipRadius?: (f: number) => number | null }> = ({
  src,
  label,
  clipRadius,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, SCENE], [1.04, 1.12], clamp);
  const r = clipRadius?.(frame) ?? null;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <AbsoluteFill style={r === null ? undefined : { clipPath: `circle(${r}px at 50% 50%)` }}>
        <Img
          src={src}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }}
        />
      </AbsoluteFill>
      <Label text={label} />
    </AbsoluteFill>
  );
};

// Match cut: scene 8 closes a circle down to MATCH_CUT_R, scene 9 opens from the same circle.
const FULL_R = 1100;
const closing = (f: number): number | null =>
  interpolate(f, [SCENE - MATCH_LEAD, SCENE], [FULL_R, MATCH_CUT_R], clamp);
const opening = (f: number): number | null =>
  interpolate(f, [0, MATCH_LEAD], [MATCH_CUT_R, FULL_R], clamp);

export const T06Transitions: React.FC = () => {
  const lin = (d: number) => linearTiming({ durationInFrames: d });
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE}>
          <ImageScene src={moses} label="slide" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={lin(BUILTIN)} />
        <TransitionSeries.Sequence durationInFrames={SCENE}>
          <ImageScene src={riders} label="wipe" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={lin(BUILTIN)} />
        <TransitionSeries.Sequence durationInFrames={SCENE}>
          <ImageScene src={virgin} label="cross-zoom" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={crossZoom({})} timing={lin(BUILTIN)} />
        <TransitionSeries.Sequence durationInFrames={SCENE}>
          <ImageScene src={campoVaccino} label="book-flip" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={bookFlip({})} timing={lin(BUILTIN)} />
        <TransitionSeries.Sequence durationInFrames={SCENE}>
          <ImageScene src={sibyl} label="film-burn" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={filmBurn({ seed: 3 })} timing={lin(BUILTIN)} />
        <TransitionSeries.Sequence durationInFrames={SCENE}>
          <ImageScene src={merian} label="tornWipe left" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={tornWipe({ direction: "left", seed: "t06-left" })}
          timing={lin(TORN)}
        />
        <TransitionSeries.Sequence durationInFrames={SCENE}>
          <ImageScene src={ortelius} label="tornWipe up" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={tornWipe({ direction: "up", seed: "t06-up" })}
          timing={lin(TORN)}
        />
        <TransitionSeries.Sequence durationInFrames={SCENE}>
          <ImageScene src={genesis} label="match cut: same circle" clipRadius={closing} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence durationInFrames={SCENE}>
          <ImageScene src={moses} label="match cut: same circle" clipRadius={opening} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
