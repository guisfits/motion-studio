import type { CSSProperties } from "react";
import { Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FRAKTUR, FONT_MONO } from "./fonts";
import { type Landing, landingS } from "./timing";

export type RansomProps = Landing & {
  text: string;
  /** Font size of the tiles in px. */
  size?: number;
  /** Frames between one tile and the next (1-2 reads as typed by hand). */
  stagger?: number;
  seed?: string;
  papers?: string[];
  inks?: string[];
  families?: string[];
  style?: CSSProperties;
};

const DEFAULT_PAPERS = ["#f3ead7", "#e2d3b0", "#cfd8d3", "#e8c9b8", "#fbfaf4"];
const DEFAULT_INKS = ["#1d1a16", "#7a1f18", "#23303a"];
const DEFAULT_FAMILIES = [FONT_MONO, FONT_FRAKTUR, "Georgia, serif", "Impact, sans-serif"];

const ENTER = 4;
const outCubic = Easing.out(Easing.cubic);

/**
 * Ransom-note word: each letter a cut-out tile (face, paper, ink, tilt and scale seeded), dropped
 * in from above one to two frames apart; the last tile lands on the word onset.
 */
export const Ransom: React.FC<RansomProps> = ({
  text,
  size = 120,
  stagger = 2,
  seed = "ransom",
  papers = DEFAULT_PAPERS,
  inks = DEFAULT_INKS,
  families = DEFAULT_FAMILIES,
  style,
  ...landing
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const letters = [...text];
  const onset = Math.round(landingS(landing) * fps);
  const start = onset - ENTER - stagger * (letters.length - 1);
  const pick = <T,>(list: T[], k: string) => list[Math.floor(random(`${seed}-${k}`) * list.length)];

  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: size * 0.04, ...style }}>
      {letters.map((ch, i) => {
        if (ch === " ") return <span key={i} style={{ width: size * 0.3 }} />;
        const t0 = start + i * stagger;
        const p = interpolate(frame, [t0, t0 + ENTER], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: outCubic,
        });
        const rot = (random(`${seed}-r${i}`) - 0.5) * 12;
        const scale = 0.9 + random(`${seed}-s${i}`) * 0.25;
        const jitter = (random(`${seed}-j${i}`) - 0.5) * size * 0.12;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              visibility: frame < t0 ? "hidden" : "visible",
              padding: `${size * 0.04}px ${size * 0.1}px`,
              background: pick(papers, `p${i}`),
              color: pick(inks, `i${i}`),
              fontFamily: pick(families, `f${i}`),
              fontSize: size * scale,
              fontWeight: 700,
              lineHeight: 1.15,
              boxShadow: "0 3px 6px rgba(20, 12, 6, 0.35)",
              transform: `translateY(${jitter + (1 - p) * -size * 0.9}px) rotate(${rot}deg)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};
