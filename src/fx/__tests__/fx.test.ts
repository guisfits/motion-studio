import { describe, expect, it } from "vitest";
import * as fx from "../index";

// The fx components need WebGL, so they are judged on renders; this guards the public surface.
describe("fx exports", () => {
  it("exposes the three organic effects", () => {
    expect(Object.keys(fx).sort()).toEqual(["InkSpread", "Smoke", "Water"]);
  });
});
