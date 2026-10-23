import { measureText } from "@remotion/layout-utils";

/** Typographic style that changes glyph advance; must match how the text is finally rendered. */
export type MeasureStyle = {
  fontWeight?: string | number;
  /** CSS letter-spacing, e.g. "0.05em" or "4px". */
  letterSpacing?: string;
};

export type MeasureFn = (text: string, fontFamily: string, fontSize: number, style?: MeasureStyle) => number;

const domMeasure: MeasureFn = (text, fontFamily, fontSize, style = {}) =>
  measureText({
    text,
    fontFamily,
    fontSize,
    fontWeight: String(style.fontWeight ?? "400"),
    letterSpacing: style.letterSpacing,
  }).width;

/**
 * Largest whole font size (px) <= maxSize at which `text` is at most maxWidth wide. Width is
 * linear in size, so one probe gives the estimate; a short walk-down absorbs rounding and hinting.
 * `style` (weight, letter-spacing) must match the rendered text or the fit is off.
 * `measure` is injectable for DOM-less tests.
 */
export function fitSize(
  text: string,
  fontFamily: string,
  maxWidth: number,
  maxSize: number,
  measure: MeasureFn = domMeasure,
  style: MeasureStyle = {},
): number {
  if (!text || maxWidth <= 0 || maxSize <= 0) return 0;
  const probe = 100;
  const w = measure(text, fontFamily, probe, style);
  if (w <= 0) return Math.floor(maxSize);
  let size = Math.min(Math.floor(maxSize), Math.floor((maxWidth / w) * probe));
  while (size > 0 && measure(text, fontFamily, size, style) > maxWidth) size -= 1;
  return Math.max(size, 0);
}

/** Alias of `fitSize` kept for the "auto-shrink" call sites; same arguments, same result. */
export const fitText = fitSize;
