import type { CamKey, CamPose } from "../camera";
import { viewAt } from "../camera";
import type { CamEase } from "../camera";

/** A box on the page as fractions of its width and height. */
export type PageRect = { x: number; y: number; w: number; h: number };

export type DocZoomGeometry = {
  /** Page centre in world px. */
  x: number;
  y: number;
  /** Page size in world px. */
  size: [number, number];
  /** The quote the camera frames. */
  rect: PageRect;
  /** The line the highlighter sweeps; defaults to `rect`. */
  word?: PageRect;
  /** Share of the frame width the quote fills at the end of the push. */
  fill?: number;
};

export type DocZoomTiming = {
  /** Frame the push starts (the wide look holds until then). */
  pushFrom: number;
  /** Frame the push arrives on the quote. */
  pushTo: number;
  ease?: CamEase;
  /** Frame size in px, the camera's window (default 1920x1080). */
  frame?: [number, number];
};

/** A page fraction in world px. */
export const pagePoint = (g: Pick<DocZoomGeometry, "x" | "y" | "size">, fx: number, fy: number) => ({
  x: g.x + (fx - 0.5) * g.size[0],
  y: g.y + (fy - 0.5) * g.size[1],
});

/** A page rect in world px (top-left corner and size). */
export const pageBox = (g: Pick<DocZoomGeometry, "x" | "y" | "size">, r: PageRect) => {
  const p = pagePoint(g, r.x, r.y);
  return { left: p.x, top: p.y, width: r.w * g.size[0], height: r.h * g.size[1] };
};

/**
 * The camera keys of a doc zoom: the whole page held wide (about 70% of the frame), then a push
 * onto the quote. The component and a film's trace both read these keys, so they cannot disagree.
 */
export function docZoomKeys(g: DocZoomGeometry, t: DocZoomTiming): CamKey[] {
  const [fw, fh] = t.frame ?? [1920, 1080];
  const [w, h] = g.size;
  const wideZoom = Math.min((fw * 0.7) / w, (fh * 0.8) / h);
  const closeZoom = ((g.fill ?? 0.82) * fw) / (g.rect.w * w);
  const wide = pagePoint(g, 0.5, 0.5);
  const close = pagePoint(g, g.rect.x + g.rect.w / 2, g.rect.y + g.rect.h / 2);
  return [
    { frame: 0, x: wide.x, y: wide.y, zoom: wideZoom },
    { frame: t.pushFrom, x: wide.x, y: wide.y, zoom: wideZoom, ease: t.ease ?? "move" },
    { frame: t.pushTo, x: close.x, y: close.y, zoom: closeZoom },
  ];
}

/** The camera pose a doc zoom draws at `frame` (what a trace reads). */
export const docZoomPose = (
  g: DocZoomGeometry,
  t: DocZoomTiming,
  frame: number,
  durationInFrames: number,
  drift = 0,
): CamPose => viewAt(docZoomKeys(g, t), frame, { durationInFrames, drift });
