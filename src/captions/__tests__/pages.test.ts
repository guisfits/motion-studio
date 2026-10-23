import { describe, expect, it } from "vitest";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { fromWords } from "../fromWords";
import { pageWindows, readingCheck } from "../pages";

const words = [
  { w: "Every", s: 0, e: 0.3 },
  { w: "map", s: 0.3, e: 0.6 },
  { w: "is", s: 1.6, e: 1.8 },
  { w: "an", s: 1.8, e: 2 },
];
const { pages } = createTikTokStyleCaptions({ captions: fromWords({ words }), combineTokensWithinMilliseconds: 500, breakOnSilenceAfterMilliseconds: 400 });

describe("pageWindows", () => {
  it("holds each page until the next begins and gives the last one a tail", () => {
    const w = pageWindows(pages, 700);
    expect(w).toHaveLength(2);
    expect(w[0]).toMatchObject({ fromMs: 0, toMs: 1600 });
    expect(w[1].toMs).toBe(1600 + pages[1].durationMs + 700);
  });
  it("is [] for no pages", () => expect(pageWindows([], 700)).toEqual([]));
});

describe("readingCheck", () => {
  it("passes a page held long enough for its characters", () => {
    expect(readingCheck("Every map", 1600, { maxCps: 17, minS: 0.5 }).ok).toBe(true);
  });
  it("fails a page that is too long for its time, and one shown too briefly", () => {
    expect(readingCheck("Every map is an argument", 1000, { maxCps: 17, minS: 0.5 }).ok).toBe(false);
    expect(readingCheck("Hi", 300, { maxCps: 17, minS: 0.5 }).ok).toBe(false);
  });
});
