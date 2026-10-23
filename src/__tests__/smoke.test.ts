import { describe, expect, it } from "vitest";

describe("library entry", () => {
  it("imports without throwing", async () => {
    const lib = await import("../index");
    expect(lib).toBeTypeOf("object");
  });
});
