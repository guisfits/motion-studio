export type Pose = { x: number; y: number; zoom: number };
export type LayerPose = { x: number; y: number; scale: number };

// How much of the camera's travel a plane at depth 1 still follows: far planes creep, never freeze.
const FAR_FOLLOW = 0.7;

/** Share of the camera's motion a plane at `depth` follows: 1 at depth 0, less behind it, more in front. */
const follow = (depth: number): number => Math.max(0, 1 - FAR_FOLLOW * depth);

/**
 * Effective camera pose for a plane at `depth` (0 = locked to the camera plane, 1 = far background,
 * negative = foreground). Motion is measured from `origin` so all planes line up on the opening pose;
 * pure per input, nothing accumulates.
 */
export function layerOffset(depth: number, cam: Pose, origin: Pose = { x: 0, y: 0, zoom: 1 }): LayerPose {
  const k = follow(depth);
  return {
    x: origin.x + (cam.x - origin.x) * k,
    y: origin.y + (cam.y - origin.y) * k,
    scale: origin.zoom + (cam.zoom - origin.zoom) * k,
  };
}

/** Depth-of-field blur radius in px: none on the focus plane, `perDepth` px per unit of distance from it. */
export const blurFor = (depth: number, focus: number, perDepth: number): number =>
  Math.abs(depth - focus) * perDepth;
