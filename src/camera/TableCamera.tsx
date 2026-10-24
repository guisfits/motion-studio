import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { tableAt, tableTransform, type CamTable } from "./table";

export type TableCameraProps = {
  table: CamTable;
  /** Frames to subtract from the current frame before the lookup (a table that starts at local frame 1 passes 1). Default 0. */
  offset?: number;
  /** Parallax plane, 0..1; see `tableTransform`. Default 1: the plane follows the camera exactly. */
  depth?: number;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Children live in frame pixels; the measured camera zooms and moves them about the frame centre.
 * Reads the frame itself, so a wrapper such as CameraMotionBlur sees a different pose per sample.
 */
export const TableCamera: React.FC<TableCameraProps> = ({ table, offset = 0, depth = 1, style, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const pose = tableAt(table, frame - offset);
  return (
    <AbsoluteFill style={{ transformOrigin: "0 0", transform: tableTransform(pose, width, height, depth), ...style }}>
      {children}
    </AbsoluteFill>
  );
};
