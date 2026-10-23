import type { Caption } from "@remotion/captions";
import { useCurrentFrame, useVideoConfig } from "remotion";

const norm = (s: string) => s.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/** The caption being spoken at `frame`, or null before, between or after words. Pure. */
export function wordAt(captions: Caption[], frame: number, fps: number): Caption | null {
  const ms = (frame / fps) * 1000;
  return captions.find((c) => ms >= c.startMs && ms < c.endMs) ?? null;
}

/** `wordAt` for the current frame of the composition. */
export function useWordAt(captions: Caption[]): Caption | null;
/** `wordAt` for an explicit frame. */
export function useWordAt(captions: Caption[], frame: number, fps: number): Caption | null;
export function useWordAt(captions: Caption[], frame?: number, fps?: number): Caption | null {
  const current = useCurrentFrame();
  const config = useVideoConfig();
  return wordAt(captions, frame ?? current, fps ?? config.fps);
}

/** Onset in seconds of the `nth` spoken occurrence of `word` (accent- and punctuation-tolerant). */
export function wordStartS(captions: Caption[], word: string, nth = 0): number {
  const hit = captions.filter((c) => norm(c.text) === norm(word))[nth];
  if (!hit) throw new Error(`captions: "${word}" (#${nth}) is not in the narration`);
  return hit.startMs / 1000;
}
