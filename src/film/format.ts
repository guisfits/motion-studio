import type { Box } from "./types";

export type FilmFormat = "9x16" | "1x1" | "16x9";

type Safe = { top: number; bottom: number; left: number; right: number };

// Output formats and their safe areas (ported from archive/engine-v1/core/lib/layout.js).
export const FORMATS: Record<FilmFormat, { W: number; H: number; safe: Safe }> = {
  // Reels/Shorts/TikTok: the bottom ~20% (caption + buttons) and the right rail (like/comment/share)
  // are covered by the platform UI; the top carries the account row. The phone also crops ~51 px
  // off each side of the video (measured on an iPhone, 2026-10-10).
  "9x16": { W: 1080, H: 1920, safe: { top: 220, bottom: 400, left: 70, right: 165 } },
  "1x1": { W: 1080, H: 1080, safe: { top: 72, bottom: 72, left: 72, right: 72 } },
  // YouTube / site: title-safe 5 % plus room for the player chrome at the bottom.
  "16x9": { W: 1920, H: 1080, safe: { top: 64, bottom: 96, left: 96, right: 96 } },
};

/** W, H and the safe box [x, y, w, h] of a format. */
export function layoutOf(format: FilmFormat): { W: number; H: number; safe: Box } {
  const f = FORMATS[format];
  if (!f) throw new Error(`unknown format "${format}" (use ${Object.keys(FORMATS).join(", ")})`);
  const { W, H, safe } = f;
  return { W, H, safe: [safe.left, safe.top, W - safe.left - safe.right, H - safe.top - safe.bottom] };
}
