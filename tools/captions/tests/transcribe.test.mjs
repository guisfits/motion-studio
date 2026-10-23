import test from "node:test";
import assert from "node:assert/strict";
import { captionsToWords } from "../transcribe.mjs";

const cap = (text, startMs, endMs) => ({ text, startMs, endMs });

test("trailing punctuation glues to the previous word and extends its end", () => {
  const words = captionsToWords([cap(" Hello", 0, 400), cap(",", 400, 450), cap(" world", 500, 900)]);
  assert.deepEqual(words, [
    { w: "Hello,", s: 0, e: 0.45 },
    { w: "world", s: 0.5, e: 0.9 },
  ]);
});

test("a leading punctuation-only token prefixes the next word, never becomes a word", () => {
  const words = captionsToWords([cap(" \"", 0, 50), cap("Go", 50, 300)]);
  assert.deepEqual(words, [{ w: "\"Go", s: 0, e: 0.3 }]);
});

test("contractions stay one word", () => {
  const words = captionsToWords([
    cap(" It", 0, 200),
    cap("'s", 200, 300),
    cap(" don", 400, 600),
    cap("'t", 600, 700),
    cap(" is", 800, 950),
    cap("n't", 950, 1000),
    cap(" it", 1100, 1200),
    cap("\u2019s", 1200, 1300),
  ]);
  assert.deepEqual(
    words.map((w) => w.w),
    ["It's", "don't", "isn't", "it\u2019s"],
  );
  assert.equal(words[0].e, 0.3);
});
