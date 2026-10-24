import { describe, expect, it } from "vitest";
import { collectCues, toSfxCues, type Cue } from "../cues";

describe("collectCues", () => {
  it("offsets each sequence's cues by its start and sorts them in time", () => {
    const cues = collectCues(
      [
        { from: 60, cues: [{ at: 0.5, sfx: "tape" }] },
        { from: 0, cues: [{ at: 1, sfx: "paper-place", gain: 0.8 }] },
      ],
      30,
    );
    expect(cues).toEqual([
      { at: 1, sfx: "paper-place", gain: 0.8 },
      { at: 2.5, sfx: "tape" },
    ]);
  });

  it("drops cues that fall before 0 or are not finite", () => {
    const cues = collectCues([{ from: 0, cues: [{ at: -0.1, sfx: "tear" }, { at: Number.NaN, sfx: "tear" }] }], 30);
    expect(cues).toEqual([]);
  });

  it("returns [] for no sequences", () => {
    expect(collectCues([], 30)).toEqual([]);
  });
});

describe("toSfxCues", () => {
  it("maps to the sfx renderer's {t, type, gain} shape, gain only when set", () => {
    const cues: Cue[] = [{ at: 1.25, sfx: "tear" }, { at: 2, sfx: "tape", gain: 0.5 }];
    expect(toSfxCues(cues)).toEqual([
      { t: 1.25, type: "tear" },
      { t: 2, type: "tape", gain: 0.5 },
    ]);
  });
});
