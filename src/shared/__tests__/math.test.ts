import { describe, expect, it } from "vitest";
import { clamp01, ramp01 } from "../math";

describe("clamp01", () => {
  it("clamps to 0..1 and passes the interior through", () => {
    expect([clamp01(-1), clamp01(0.25), clamp01(3)]).toEqual([0, 0.25, 1]);
  });
});

describe("ramp01", () => {
  it("runs 0..1 across [from, from + len], holding at both ends", () => {
    expect([ramp01(0, 2, 4), ramp01(2, 2, 4), ramp01(4, 2, 4), ramp01(6, 2, 4), ramp01(9, 2, 4)]).toEqual([0, 0, 0.5, 1, 1]);
  });

  it("applies an easing to the progress", () => {
    expect(ramp01(3, 2, 2, (t) => t * t)).toBeCloseTo(0.25);
  });

  it("steps from 0 to 1 at `from` when len is 0 or negative, instead of throwing", () => {
    expect([ramp01(1, 2, 0), ramp01(2, 2, 0), ramp01(3, 2, 0), ramp01(3, 2, -1)]).toEqual([0, 1, 1, 1]);
  });
});
