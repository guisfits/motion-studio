export type CoverUV = { repeatX: number; repeatY: number; offsetX: number; offsetY: number };

/**
 * Texture repeat/offset that make an image cover a box of another aspect (like CSS object-fit:
 * cover), optionally zoomed in and panned. `pan*` run -1..1 across the room the crop has left.
 */
export const coverUV = (imgAspect: number, boxAspect: number, zoom = 1, panX = 0, panY = 0): CoverUV => {
  const baseW = imgAspect > boxAspect ? boxAspect / imgAspect : 1;
  const baseH = imgAspect > boxAspect ? 1 : imgAspect / boxAspect;
  const repeatX = baseW / zoom;
  const repeatY = baseH / zoom;
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  return {
    repeatX,
    repeatY,
    offsetX: (1 - repeatX) * clamp01(0.5 + panX / 2),
    offsetY: (1 - repeatY) * clamp01(0.5 + panY / 2),
  };
};
