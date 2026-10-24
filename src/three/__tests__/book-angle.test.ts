import { describe, expect, it } from "vitest";
import { leafAngle } from "../Book3D";

describe("leafAngle", () => {
  it("keeps every leaf flat while the book is closed", () => {
    for (let i = 0; i < 8; i++) expect(leafAngle(i, 0, 0)).toBe(0);
  });

  it("fans the first leaves to the left when open, in order, leaving the rest", () => {
    const a = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => leafAngle(i, 1, 0));
    expect(a[0]).toBeGreaterThan(a[1]);
    expect(a[1]).toBeGreaterThan(a[2]);
    expect(a[2]).toBeGreaterThan(Math.PI * 0.85);
    expect(a[3]).toBe(0);
  });

  it("turns one more leaf with the extra turn", () => {
    expect(leafAngle(3, 1, 0.25)).toBeGreaterThan(Math.PI * 0.8);
    expect(leafAngle(4, 1, 0.25)).toBe(0);
  });
});
