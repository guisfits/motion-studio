import type { Caption } from "@remotion/captions";
import type { WordsFile } from "./transcribe";

const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

/**
 * Word timings (seconds) to Remotion `Caption[]` (milliseconds). Tokens carry a leading space so
 * `createTikTokStyleCaptions` can join them. Words are sorted by start, an overlap is clamped so a
 * word ends where the next begins, and empty or malformed input gives `[]` instead of a crash.
 */
export function fromWords(input: WordsFile): Caption[] {
  const raw = input && Array.isArray(input.words) ? input.words : [];
  const words = raw
    .filter(
      (x) => x && typeof x.w === "string" && x.w.trim() !== "" && isNum(x.s) && isNum(x.e) && x.s >= 0 && x.e > x.s,
    )
    .map((x) => ({ text: ` ${x.w.trim()}`, startMs: Math.round(x.s * 1000), endMs: Math.round(x.e * 1000) }))
    .sort((a, b) => a.startMs - b.startMs);

  return words
    .map((w, i) => ({ ...w, endMs: i + 1 < words.length ? Math.min(w.endMs, words[i + 1].startMs) : w.endMs }))
    .filter((w) => w.endMs > w.startMs)
    .map((w) => ({
      text: w.text,
      startMs: w.startMs,
      endMs: w.endMs,
      timestampMs: Math.round((w.startMs + w.endMs) / 2),
      confidence: null,
    }));
}
