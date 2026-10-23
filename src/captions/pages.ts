import type { TikTokPage } from "@remotion/captions";

export type PageWindow = { page: TikTokPage; fromMs: number; toMs: number };

/**
 * When each page is on screen: from its own start until the next page begins (captions replace,
 * never blank), the last one held `tailMs` past its spoken end. Longer holds only help reading.
 */
export function pageWindows(pages: TikTokPage[], tailMs: number): PageWindow[] {
  return pages.map((page, i) => ({
    page,
    fromMs: page.startMs,
    toMs: i + 1 < pages.length ? pages[i + 1].startMs : page.startMs + page.durationMs + tailMs,
  }));
}

export type ReadingNorms = { maxCps: number; minS: number };

/** Reading-time check for one page: characters per second within the cap and shown at least `minS`. */
export function readingCheck(text: string, visibleMs: number, norms: ReadingNorms) {
  const seconds = visibleMs / 1000;
  const chars = text.trim().length;
  const cps = seconds > 0 ? chars / seconds : Number.POSITIVE_INFINITY;
  return { chars, seconds, cps, ok: cps <= norms.maxCps && seconds >= norms.minS };
}
