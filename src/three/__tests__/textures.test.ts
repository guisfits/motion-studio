import { describe, expect, it } from "vitest";
import { requireSrc } from "../textures";

describe("requireSrc", () => {
  it("passes a URL through", () => {
    expect(requireSrc("Card3D", "image", "/a.png")).toBe("/a.png");
  });

  it("throws, naming the component and prop, for an empty or missing source", () => {
    expect(() => requireSrc("Card3D", "image", "")).toThrow(/Card3D: "image"/);
    expect(() => requireSrc("Book3D", "cover", undefined)).toThrow(/Book3D: "cover"/);
  });
});
