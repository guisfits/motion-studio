import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ramp01 } from "../shared/math";
import { SetDown } from "../paper/SetDown";
import { FONT_MONO } from "../type/fonts";
import { DrawPath } from "./DrawPath";
import { elbowPath, treeLayout, type TreeNode } from "./layout";

export type TreeProps = {
  /** Nodes in the order they should appear (parents before children). */
  nodes: (TreeNode & { label?: string })[];
  /** Box of the tree in px. */
  width: number;
  height: number;
  /** Seconds before the first node lands. */
  delay?: number;
  /** Seconds between two nodes being set down. */
  stagger?: number;
  ink?: string;
  paper?: string;
};

const CARD: [number, number] = [330, 144];
const FONT = FONT_MONO;

/**
 * A lineage that grows node by node: each node card is set down from above, and the branch
 * to its parent draws on just before it lands, so the tree is always connected.
 */
export const Tree: React.FC<TreeProps> = ({
  nodes,
  width,
  height,
  delay = 0,
  stagger = 0.7,
  ink = "#3a2a1c",
  paper = "#f4efe3",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pos = treeLayout(nodes, width, height);
  const t = frame / fps;
  return (
    <div style={{ position: "relative", width, height }}>
      {nodes.map((n, i) => {
        if (!n.parent || !pos[n.parent]) return null;
        const from = { x: pos[n.parent].x, y: pos[n.parent].y + CARD[1] / 2 };
        const to = { x: pos[n.id].x, y: pos[n.id].y - CARD[1] / 2 };
        const start = delay + i * stagger;
        const progress = ramp01(t, start, stagger * 0.8);
        return (
          <DrawPath key={`e-${n.id}`} d={elbowPath(from, to)} progress={progress} size={[width, height]} stroke={ink} width={7} />
        );
      })}
      {nodes.map((n, i) => (
        <SetDown
          key={n.id}
          delay={delay + i * stagger + stagger * 0.5}
          from="top"
          size={CARD}
          rotate={i % 2 === 0 ? -1.5 : 1.5}
          style={{ left: pos[n.id].x - CARD[0] / 2, top: pos[n.id].y - CARD[1] / 2 }}
        >
          <div
            style={{
              width: CARD[0],
              height: CARD[1],
              boxSizing: "border-box",
              background: paper,
              color: ink,
              fontFamily: FONT,
              fontSize: 76,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {n.label ?? n.id}
          </div>
        </SetDown>
      ))}
    </div>
  );
};
