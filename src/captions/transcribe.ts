// Shapes shared by tools/captions/transcribe.mjs (writer) and fromWords (reader).

/** One spoken word; `s` and `e` are seconds from the start of the narration. */
export type TimedWord = { w: string; s: number; e: number };

/** The file `tools/captions/transcribe.mjs <audio.wav> <out.json>` writes. */
export type WordsFile = { words: TimedWord[] };
