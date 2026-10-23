const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Visible characters of `text`, one per ransom tile: a letter and its combining accent stay together. */
export const splitTiles = (text: string): string[] => [...graphemes.segment(text)].map((s) => s.segment);
