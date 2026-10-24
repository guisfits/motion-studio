import React from "react";
import { Img } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { DrawPath } from "./DrawPath";
import { polylinePath } from "./layout";

export type RouteMapProps = {
  /** Map image URL (public-domain scan). */
  image: string;
  /** Route in normalised image coordinates: [0,0] top-left, [1,1] bottom-right. */
  route: [number, number][];
  /** 0..1 along the route; the line is drawn to here and the marker sits at its head. */
  progress: number;
  /** Box of the map in px. */
  width: number;
  height: number;
  stroke?: string;
  lineWidth?: number;
};

/** Position (px) of the route's head at `progress`; also used by callers to time stops. */
export const routeHead = (
  route: [number, number][],
  progress: number,
  width: number,
  height: number,
): { x: number; y: number } => {
  const d = polylinePath(route.map(([x, y]) => [x * width, y * height]));
  const p = getPointAtLength(d, Math.min(1, Math.max(0, progress)) * getLength(d));
  return p ? { x: p.x, y: p.y } : { x: 0, y: 0 };
};

/**
 * An old map with a route inked on it: the line travels (`DrawPath`) and a pin marker follows
 * its head. Frame-pure in `progress`.
 */
export const RouteMap: React.FC<RouteMapProps> = ({
  image,
  route,
  progress,
  width,
  height,
  stroke = "#7a1f12",
  lineWidth = 10,
}) => {
  const d = polylinePath(route.map(([x, y]) => [x * width, y * height]));
  const head = routeHead(route, progress, width, height);
  return (
    <div style={{ position: "relative", width, height }}>
      <Img src={image} style={{ width, height, display: "block" }} />
      <DrawPath d={d} progress={progress} size={[width, height]} stroke="#f4efe3" width={lineWidth + 8} />
      <DrawPath d={d} progress={progress} size={[width, height]} stroke={stroke} width={lineWidth} />
      {progress > 0 ? (
        <div
          style={{
            position: "absolute",
            left: head.x - 28,
            top: head.y - 28,
            width: 56,
            height: 56,
            borderRadius: 28,
            boxSizing: "border-box",
            background: stroke,
            border: "8px solid #f4efe3",
            boxShadow: "2px 4px 4px rgba(20,12,6,0.45)",
          }}
        />
      ) : null}
    </div>
  );
};
