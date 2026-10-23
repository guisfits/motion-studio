import { measureText } from "@remotion/layout-utils";

export type MeasureFn = (text: string, fontFamily: string, fontSize: number) => number;

const domMeasure: MeasureFn = (text, fontFamily, fontSize) =>
  measureText({ text, fontFamily, fontSize, fontWeight: "400" }).width;

/**
 * Largest whole font size (px) <= maxSize at which `text` is at most maxWidth wide. Width is
 * linear in size, so one probe gives the estimate; a short walk-down absorbs rounding and hinting.
 * `measure` is injectable for DOM-less tests.
 */
export function fitSize(
  text: string,
  fontFamily: string,
  maxWidth: number,
  maxSize: number,
  measure: MeasureFn = domMeasure,
): number {
  if (!text || maxWidth <= 0 || maxSize <= 0) return 0;
  const probe = 100;
  const w = measure(text, fontFamily, probe);
  if (w <= 0) return Math.floor(maxSize);
  let size = Math.min(Math.floor(maxSize), Math.floor((maxWidth / w) * probe));
  while (size > 0 && measure(text, fontFamily, size) > maxWidth) size -= 1;
  return Math.max(size, 0);
}

/** Auto-shrink: the font size that keeps `text` inside `maxWidth`, never above `maxSize`. */
export function fitText(text: string, fontFamily: string, maxWidth: number, maxSize: number): number {
  return fitSize(text, fontFamily, maxWidth, maxSize);
}
