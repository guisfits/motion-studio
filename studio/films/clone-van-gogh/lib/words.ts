import words from "../voice/words.json";
import { FPS } from "../scene";

export type Word = { w: string; s: number; e: number };

/** Our voice's words (voice/words.json, whisper on voice/vo.wav), in order. */
export const WORDS: Word[] = (words as { words: Word[] }).words;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Index of the `nth` (0-based) word matching `text` (case and punctuation ignored). */
export function wordIndex(text: string, nth = 0): number {
  const want = norm(text);
  let seen = 0;
  for (let i = 0; i < WORDS.length; i++) {
    if (norm(WORDS[i].w) === want && seen++ === nth) return i;
  }
  throw new Error(`word "${text}" #${nth} not in voice/words.json`);
}

/** Film frame (16 fps, absolute) where word `i` starts / ends. */
export const wordStart = (i: number) => Math.round(WORDS[i].s * FPS);
export const wordEnd = (i: number) => Math.round(WORDS[i].e * FPS);

/** Absolute start frame of a word by its text, e.g. `at("pain")`, `at("the", 2)`. */
export const at = (text: string, nth = 0) => wordStart(wordIndex(text, nth));
