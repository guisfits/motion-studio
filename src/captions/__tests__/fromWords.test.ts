import { describe, expect, it } from "vitest";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { fromWords } from "../fromWords";
import { wordAt } from "../useWordAt";

describe("fromWords", () => {
  it("converts seconds to milliseconds with a leading space per token", () => {
    const caps = fromWords({ words: [{ w: "In", s: 0.5, e: 0.75 }, { w: "the", s: 0.75, e: 1.1 }] });
    expect(caps.map((c) => [c.text, c.startMs, c.endMs])).toEqual([
      [" In", 500, 750],
      [" the", 750, 1100],
    ]);
    expect(caps[0].timestampMs).toBe(625);
  });

  it("clamps an overlap so the earlier word ends where the next begins", () => {
    const caps = fromWords({ words: [{ w: "a", s: 0, e: 1.2 }, { w: "b", s: 1, e: 2 }] });
    expect(caps[0].endMs).toBe(1000);
    expect(caps[1].startMs).toBe(1000);
  });

  it("sorts unordered words and drops malformed ones", () => {
    const caps = fromWords({
      words: [
        { w: "b", s: 2, e: 3 },
        { w: "a", s: 0, e: 1 },
        { w: "", s: 1, e: 2 },
        { w: "nan", s: Number.NaN, e: 2 },
        { w: "neg", s: 4, e: 3 },
      ],
    });
    expect(caps.map((c) => c.text)).toEqual([" a", " b"]);
  });

  it("returns [] for empty or malformed input", () => {
    expect(fromWords({ words: [] })).toEqual([]);
    expect(fromWords(undefined as never)).toEqual([]);
    expect(fromWords({ words: null } as never)).toEqual([]);
  });

  it("feeds createTikTokStyleCaptions", () => {
    const caps = fromWords({ words: [{ w: "a", s: 0, e: 0.3 }, { w: "b", s: 0.3, e: 0.6 }] });
    const { pages } = createTikTokStyleCaptions({ captions: caps, combineTokensWithinMilliseconds: 800 });
    expect(pages).toHaveLength(1);
    expect(pages[0].tokens).toHaveLength(2);
  });
});

describe("wordAt", () => {
  const caps = fromWords({ words: [{ w: "a", s: 1, e: 2 }, { w: "b", s: 2, e: 3 }] });
  it("finds the word being said at a frame", () => {
    expect(wordAt(caps, 45, 30)?.text).toBe(" a");
    expect(wordAt(caps, 60, 30)?.text).toBe(" b");
  });
  it("is null before, after and for empty captions", () => {
    expect(wordAt(caps, 10, 30)).toBeNull();
    expect(wordAt(caps, 100, 30)).toBeNull();
    expect(wordAt([], 0, 30)).toBeNull();
  });
});
