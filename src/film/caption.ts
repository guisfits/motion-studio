import type { Box, TraceItem } from "./types";

// JetBrains Mono (assets/fonts/JetBrainsMono-VF.ttf, unitsPerEm 1000): advance 600, cap height
// 730, ascent 1020, descent 300. Measured from the font file, so a trace can place a caption's box
// without a browser. A film that sets its captions in another face supplies its own metrics.
export const MONO = Object.freeze({ advance: 0.6, capHeight: 0.73 });

/** RevealWords' gaps, as fractions of the font size (src/type/RevealWords.tsx). */
export const REVEAL_GAP = Object.freeze({ column: 0.3, row: 0.25 });

export type CaptionMetrics = { advance: number; capHeight: number };

/**
 * Box of a one-line `RevealWords` caption set in a monospaced face, centred on `centerX` with its
 * top at `top`: `lineHeight` is the CSS line height as a multiple of `size`. `maxWidth` is the
 * width of the box `RevealWords` is drawn in: a line wider than it wraps on screen, so the one-line
 * box would describe a caption nobody sees, and it throws instead (chunk shorter or set smaller).
 */
export function captionBox(
  words: string[],
  size: number,
  {
    centerX,
    top,
    lineHeight = 1.3,
    metrics = MONO,
    maxWidth,
  }: { centerX: number; top: number; lineHeight?: number; metrics?: CaptionMetrics; maxWidth?: number },
): Box {
  const chars = words.reduce((n, w) => n + w.length, 0);
  const w = chars * metrics.advance * size + Math.max(0, words.length - 1) * REVEAL_GAP.column * size;
  if (maxWidth !== undefined && w > maxWidth + 0.5)
    throw new Error(`caption "${words.join(" ")}" is ${Math.round(w)} px wide in a ${maxWidth} px box: RevealWords would wrap it`);
  return [centerX - w / 2, top, w, lineHeight * size];
}

/** A `caption` trace item for text of font `size` px: `cap` is the cap height as drawn. */
export const captionItem = (
  id: string,
  text: string,
  box: Box,
  { size, color, alpha, metrics = MONO }: { size: number; color: string; alpha: number; metrics?: CaptionMetrics },
): TraceItem => ({ id, role: "caption", text, box, alpha, cap: size * metrics.capHeight, color });
