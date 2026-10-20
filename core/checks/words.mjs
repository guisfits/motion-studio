// Word matching for gates: narration words carry punctuation and accents ("Lutero,", "você").
export const norm = (w) =>
  w
    .normalize("NFC")
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

// Earliest occurrence inside the window, or, with `near`, the occurrence closest to that time.
export function findWord(words, word, [t0, t1], near) {
  const target = norm(word);
  const hits = words.filter(
    (x) => norm(x.w) === target && x.start >= t0 && x.start <= t1,
  );
  const distance =
    near === undefined ? (x) => x.start : (x) => Math.abs(x.start - near);
  return hits.sort((a, b) => distance(a) - distance(b))[0] ?? null;
}
