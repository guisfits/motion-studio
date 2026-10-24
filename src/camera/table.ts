/**
 * Camera from a table: one cumulative [scale, tx, ty] pose per frame, as tools/critique/camera-table.py
 * writes it from a measured video. Row k is the pose k frames in; row 0 is normally the identity.
 * `tx`/`ty` are the move of the frame centre in px, `scale` the zoom, both about the frame centre.
 */
export type CamRow = readonly [scale: number, tx: number, ty: number];
export type CamTable = readonly CamRow[];
export type TablePose = { scale: number; tx: number; ty: number };

/**
 * Pose at a (fractional) frame. Clamped to the first and last row. Between rows the translation
 * is linear and the scale geometric (a constant zoom rate stays constant at sub-frame times).
 */
export const tableAt = (table: CamTable, frame: number): TablePose => {
  if (table.length === 0) throw new Error("tableAt: empty camera table");
  const last = table.length - 1;
  const f = Math.max(0, Math.min(last, Number.isFinite(frame) ? frame : 0));
  const i = Math.min(last, Math.floor(f));
  const j = Math.min(last, i + 1);
  const u = f - i;
  const [s0, x0, y0] = table[i];
  const [s1, x1, y1] = table[j];
  return { scale: s0 * (s1 / s0) ** u, tx: x0 + (x1 - x0) * u, ty: y0 + (y1 - y0) * u };
};

/**
 * CSS transform that applies a pose about the frame centre. It must be used with
 * `transform-origin: 0 0`: the translate-scale-translate chain already pivots on the centre, and a
 * centred origin would apply the zoom a second time.
 *
 * `depth` (0..1) is a parallax plane: its zoom is `scale ** depth`, and it takes `shareT` (default
 * `depth`) of the translation. A plane at depth 1 follows the camera exactly.
 */
export const tableTransform = (pose: TablePose, width: number, height: number, depth = 1, shareT = depth): string =>
  `translate(${width / 2 + pose.tx * shareT}px, ${height / 2 + pose.ty * shareT}px) scale(${pose.scale ** depth}) translate(${-width / 2}px, ${-height / 2}px)`;
