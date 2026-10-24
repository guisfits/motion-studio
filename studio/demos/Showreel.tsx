import type React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { tornWipe } from "../../src/transitions";
import { T01Camera } from "./T01Camera";
import { T02Parallax } from "./T02Parallax";
import { T03Type } from "./T03Type";
import { T04Diagram } from "./T04Diagram";
import { T05Paper } from "./T05Paper";
import { T06Transitions } from "./T06Transitions";
import { T07Texture } from "./T07Texture";
import { T08Sound } from "./T08Sound";
import { T09Captions } from "./T09Captions";
import { T10Three } from "./T10Three";
import { T11Puppet } from "./T11Puppet";
import { T13Fx } from "./T13Fx";

const FPS = 30;
// Torn-paper join between two techniques, in frames.
const JOIN = 18;

// One excerpt per technique: the demo component played from `start` s for `len` s. Excerpts
// pick each demo's busiest stretch, so every cut lands mid-motion (no pop-in at a cut).
const CLIPS: { C: React.FC; start: number; len: number }[] = [
  { C: T01Camera, start: 2, len: 5.5 },
  { C: T02Parallax, start: 3, len: 5 },
  { C: T05Paper, start: 1, len: 5 },
  { C: T03Type, start: 4, len: 5 },
  { C: T09Captions, start: 2, len: 5 },
  { C: T04Diagram, start: 1.5, len: 6 },
  { C: T11Puppet, start: 2.5, len: 5 },
  { C: T10Three, start: 6, len: 6 },
  { C: T13Fx, start: 2.5, len: 6 },
  { C: T06Transitions, start: 3, len: 5 },
  { C: T07Texture, start: 5, len: 5 },
  { C: T08Sound, start: 1, len: 5 },
];

export const SHOWREEL_DURATION =
  CLIPS.reduce((n, c) => n + Math.round(c.len * FPS), 0) - JOIN * (CLIPS.length - 1);

// ~60 s reel of every phase-1 technique, joined by torn-paper wipes alternating left and up.
export const Showreel: React.FC = () => {
  const timing = linearTiming({ durationInFrames: JOIN });
  return (
    <AbsoluteFill style={{ backgroundColor: "#d8d0bf" }}>
      <TransitionSeries>
        {CLIPS.flatMap(({ C, start, len }, i) => {
          const seq = (
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={Math.round(len * FPS)}>
              {/* A negative `from` starts the demo `start` s in. */}
              <Sequence from={-Math.round(start * FPS)}>
                <C />
              </Sequence>
            </TransitionSeries.Sequence>
          );
          if (i === 0) return [seq];
          return [
            <TransitionSeries.Transition
              key={`t${i}`}
              presentation={tornWipe({ direction: i % 2 ? "left" : "up", seed: `reel-${i}` })}
              timing={timing}
            />,
            seq,
          ];
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
