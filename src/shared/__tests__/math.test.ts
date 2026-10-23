import { describe, expect, it } from "vitest";
import { clamp01 } from "../math";

describe("clamp01", () => {
  it("clamps to 0..1 and passes the interior through", () => {
    expect([clamp01(-1), clamp01(0.25), clamp01(3)]).toEqual([0, 0.25, 1]);
  });
});
