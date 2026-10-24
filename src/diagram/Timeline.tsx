import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SetDown } from "../paper/SetDown";
import { FONT_MONO } from "../type/fonts";
import { DrawPath } from "./DrawPath";
import { timelineLayout, type TimelineItem } from "./layout";

export type TimelineProps = {
  items: TimelineItem[];
  /** Box of the timeline in px. */
  width: number;
  height: number;
  /** Seconds before the axis starts drawing. */
  delay?: number;
  /** Seconds between two dates being set down. */
  stagger?: number;
  ink?: string;
  paper?: string;
};

const CARD: [number, number] = [400, 290];
const TICK = 40;
const FONT = FONT_MONO;

/**
 * A dated axis that builds up: the axis line draws left to right in step with the dates, and
 * each date card is set down (alternating above and below) with a tick joining it to the line.
 * Items keep their order; cards land in chronological order.
 */
export const Timeline: React.FC<TimelineProps> = ({
  items,
  width,
  height,
  delay = 0,
  stagger = 0.9,
  ink = "#3a2a1c",
  paper = "#f4efe3",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Keep the outermost cards fully inside the box.
  const pts = timelineLayout(items, width, (CARD[0] / 2 + 20) / width);
  const axisPad = (CARD[0] / 2 + 20) * 0.55;
  const order = [...items.keys()].sort((a, b) => items[a].year - items[b].year);
  const axisY = height / 2;
  const total = stagger * items.length;
  const draw = interpolate(frame / fps, [delay, delay + total], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "relative", width, height }}>
      <DrawPath d={`M${axisPad} ${axisY} L${width - axisPad} ${axisY}`} progress={draw} size={[width, height]} stroke={ink} width={8} />
      {items.map((item, i) => {
        const rank = order.indexOf(i);
        const above = rank % 2 === 0;
        const at = delay + rank * stagger + 0.3;
        const cardTop = above ? axisY - TICK - CARD[1] : axisY + TICK;
        const tickFrom = above ? axisY - TICK : axisY + TICK;
        const x = pts[i].x;
        return (
          <React.Fragment key={item.label}>
            <div
              style={{
                position: "absolute",
                left: x - 2,
                top: above ? tickFrom : axisY,
                width: 5,
                height: TICK,
                background: ink,
                transform: `scaleY(${interpolate(frame / fps, [at + 0.5, at + 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                transformOrigin: above ? "50% 100%" : "50% 0%",
              }}
            />
            <SetDown
              delay={at}
              from={above ? "top" : "bottom"}
              size={CARD}
              rotate={above ? -2 : 2}
              style={{ left: x - CARD[0] / 2, top: cardTop }}
            >
              <div
                style={{
                  width: CARD[0],
                  height: CARD[1],
                  boxSizing: "border-box",
                  background: paper,
                  color: ink,
                  fontFamily: FONT,
                  textAlign: "center",
                  paddingTop: 26,
                }}
              >
                <div style={{ fontSize: 120, fontWeight: 700, lineHeight: 1 }}>{item.year}</div>
                <div style={{ fontSize: 54, marginTop: 20 }}>{item.label}</div>
              </div>
            </SetDown>
          </React.Fragment>
        );
      })}
    </div>
  );
};
