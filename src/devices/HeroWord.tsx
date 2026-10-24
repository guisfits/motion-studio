import type React from "react";
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FRAKTUR, landingS, type Landing } from "../type";
import { heroWordPose, type HeroEnter } from "./hero-word";

export type HeroWordProps = Landing & {
  text: string;
  /** The subject's cut-out PNG, drawn over the word. */
  cutout: string;
  /** Where the cut-out stands, absolute in the frame (left/top/width/height in px). */
  cutoutStyle: CSSProperties;
  /** The ground behind the word (paper, a print); it stays under both. */
  children?: ReactNode;
  /** Font size px (hero type: at least 0.05 of the frame height in capitals). */
  size?: number;
  /** Top of the word in px. */
  top: number;
  edge?: "left" | "right";
  /** Share of the word that lies past the chosen edge. */
  bleed?: number;
  rotate?: number;
  enter?: HeroEnter;
  color?: string;
  fontFamily?: string;
};

/**
 * A giant word behind a cut-out subject. Layers, bottom to top: ground, word, cut-out. The word
 * arrives on its key word (`at`, or `word` + `captions`) as a stamp or a slide from its edge, cropped
 * by the frame on purpose. Pose comes from `heroWordPose`, so a trace reads the same numbers.
 */
export const HeroWord: React.FC<HeroWordProps> = ({
  text,
  cutout,
  cutoutStyle,
  children,
  size = 440,
  top,
  edge = "right",
  bleed = 0.22,
  rotate = -4,
  enter = "stamp",
  color = "#1f1710",
  fontFamily = FONT_FRAKTUR,
  ...landing
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pose = heroWordPose(frame / fps - landingS(landing), enter);
  const sign = edge === "right" ? 1 : -1;
  // translateX % is of the word's own width: `bleed` hangs past the edge, `slide` brings it in
  // from beyond the frame.
  const shift = sign * (bleed + pose.slide * (1 - bleed + 0.1)) * 100;
  return (
    <AbsoluteFill>
      {children}
      <div
        style={{
          position: "absolute",
          top,
          [edge]: 0,
          whiteSpace: "nowrap",
          font: `400 ${size}px/0.9 ${fontFamily}`,
          color,
          opacity: pose.opacity,
          transformOrigin: "50% 60%",
          transform: `translateX(${shift}%) rotate(${rotate}deg) scale(${pose.scaleX}, ${pose.scaleY})`,
        }}
      >
        {text}
      </div>
      <Img src={cutout} style={{ position: "absolute", ...cutoutStyle }} />
    </AbsoluteFill>
  );
};
