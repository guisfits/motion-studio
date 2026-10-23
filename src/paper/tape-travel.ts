/**
 * Upward distance (px) that parks a tape strip fully above the frame. The strip rotates about
 * its centre, so its lowest point sits (height + rotatedBoxHeight) / 2 below `top`.
 */
export function tapeTravel(top: number, width: number, height: number, rotateDeg: number): number {
  const r = (rotateDeg * Math.PI) / 180;
  const boxHeight = Math.abs(width * Math.sin(r)) + Math.abs(height * Math.cos(r));
  return top + (height + boxHeight) / 2;
}
