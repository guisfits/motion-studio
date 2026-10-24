import type React from "react";
import { Img, useVideoConfig } from "remotion";
import { Camera, type CamKey } from "../camera";
import { Highlight, type HighlightProps } from "../type";
import { docZoomKeys, pageBox, type DocZoomGeometry, type DocZoomTiming } from "./doc-zoom";

export type DocZoomPageProps = DocZoomGeometry & {
  /** The scan. */
  src: string;
  /** When the highlighter sweeps the line: `at` seconds, or `word` + `captions`. */
  sweep: Pick<HighlightProps, "at" | "word" | "nth" | "captions">;
  color?: string;
  /** Sweep length in frames. */
  sweepFrames?: number;
};

// Highlight draws its bar 0.6em tall, 0.02em above the bottom, across a 0.16em side padding.
const BAR = 0.6;
const BAR_LIFT = 0.02;
const PAD = 0.16;

/** The page and its highlighter in world px; put it inside a `Camera` (or use `DocZoom`). */
export const DocZoomPage: React.FC<DocZoomPageProps> = ({ src, sweep, color, sweepFrames = 14, ...geometry }) => {
  const [w, h] = geometry.size;
  const line = pageBox(geometry, geometry.word ?? geometry.rect);
  // Size the em so the bar is the line's height, then box the child to the bar.
  const em = line.height / BAR;
  const barBox = { height: em * (BAR + BAR_LIFT), width: line.width - 2 * PAD * em };
  return (
    <>
      <Img
        src={src}
        style={{ position: "absolute", left: geometry.x - w / 2, top: geometry.y - h / 2, width: w, height: h }}
      />
      <Highlight
        {...sweep}
        color={color}
        dur={sweepFrames}
        seed="doczoom"
        style={{
          position: "absolute",
          left: line.left,
          top: line.top,
          display: "block",
          padding: `0 ${PAD}em`,
          fontSize: em,
          lineHeight: 1,
          mixBlendMode: "multiply",
        }}
      >
        <span style={{ display: "block", ...barBox }} />
      </Highlight>
    </>
  );
};

export type DocZoomProps = DocZoomPageProps &
  DocZoomTiming & {
    /** Your own keys (e.g. spliced into a film's camera); default `docZoomKeys`. */
    keys?: CamKey[];
    drift?: number;
    blur?: boolean;
  };

/**
 * A scan laid on the table, the camera pushing in to one quote while a highlighter sweeps the key
 * line. Geometry and timing go through `docZoomKeys`, which a trace calls with the same props and
 * the same `frame` (the composition's size, `layoutOf(format)` W and H, unless you pass one).
 */
export const DocZoom: React.FC<DocZoomProps> = ({ keys, drift = 0, blur, pushFrom, pushTo, ease, frame, ...page }) => {
  const { width, height } = useVideoConfig();
  // The camera's window is the composition: a portrait Reel must not frame the quote for 1920x1080.
  const view: [number, number] = frame ?? [width, height];
  return (
    <Camera keys={keys ?? docZoomKeys(page, { pushFrom, pushTo, ease, frame: view })} drift={drift} blur={blur}>
      <DocZoomPage {...page} />
    </Camera>
  );
};
