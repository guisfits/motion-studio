import { describe, expect, it } from "vitest";
import { splitTiles } from "../tiles";

describe("splitTiles", () => {
  it("gives one tile per visible letter", () => {
    expect(splitTiles("Nínive")).toEqual(["N", "í", "n", "i", "v", "e"]);
  });

  it("keeps a decomposed accent on its letter instead of tiling it alone", () => {
    expect(splitTiles("Nínive")).toHaveLength(6);
    expect(splitTiles("RESSURREIÇÃO")).toHaveLength("RESSURREIÇÃO".length);
  });

  it("keeps spaces as tiles and is empty for empty text", () => {
    expect(splitTiles("a b")).toEqual(["a", " ", "b"]);
    expect(splitTiles("")).toEqual([]);
  });
});
