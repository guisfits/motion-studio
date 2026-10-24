import { describe, expect, it } from "vitest";
import { tableAt, tableTransform, type CamTable } from "../table";

// Applies "translate(a,b) scale(s) translate(-w/2,-h/2)" to a point, the way the browser does with transform-origin 0 0.
const apply = (css: string, p: [number, number]): [number, number] => {
  const m = /translate\(([-\d.e]+)px, ([-\d.e]+)px\) scale\(([-\d.e]+)\) translate\(([-\d.e]+)px, ([-\d.e]+)px\)/.exec(css);
  if (!m) throw new Error(css);
  const [, ax, ay, s, bx, by] = m.map(Number);
  return [ax + s * (p[0] + bx), ay + s * (p[1] + by)];
};

describe("tableAt", () => {
  it("an identity table is the identity at every frame", () => {
    const id: CamTable = [[1, 0, 0], [1, 0, 0], [1, 0, 0]];
    for (const f of [-3, 0, 0.5, 1, 2, 40]) expect(tableAt(id, f)).toEqual({ scale: 1, tx: 0, ty: 0 });
  });

  it("is exact on whole frames", () => {
    const t: CamTable = [[1, 0, 0], [1.2, 4, -2], [1.5, 10, 6]];
    expect(tableAt(t, 1)).toEqual({ scale: 1.2, tx: 4, ty: -2 });
    expect(tableAt(t, 2)).toEqual({ scale: 1.5, tx: 10, ty: 6 });
  });

  it("follows a known zoom ramp: x1.1 per frame, held constant between rows", () => {
    const t: CamTable = Array.from({ length: 6 }, (_, k) => [1.1 ** k, 0, 0] as const);
    for (let k = 0; k < 6; k++) expect(tableAt(t, k).scale).toBeCloseTo(1.1 ** k, 12);
    // geometric between rows, so the ramp stays exactly x1.1 per frame at sub-frame times
    expect(tableAt(t, 2.5).scale).toBeCloseTo(1.1 ** 2.5, 12);
    expect(tableAt(t, 3.25).scale).toBeCloseTo(1.1 ** 3.25, 12);
  });

  it("interpolates translation linearly", () => {
    const t: CamTable = [[1, 0, 0], [1, 10, -20]];
    expect(tableAt(t, 0.25)).toMatchObject({ tx: 2.5, ty: -5 });
    expect(tableAt(t, 0.5)).toMatchObject({ tx: 5, ty: -10 });
  });

  it("clamps before the first and after the last row", () => {
    const t: CamTable = [[1, 0, 0], [1.3, 7, 3]];
    expect(tableAt(t, -10)).toEqual({ scale: 1, tx: 0, ty: 0 });
    expect(tableAt(t, 99)).toEqual({ scale: 1.3, tx: 7, ty: 3 });
    expect(tableAt(t, Number.NaN)).toEqual({ scale: 1, tx: 0, ty: 0 });
  });

  it("a single-row table holds, an empty one is an error", () => {
    expect(tableAt([[1.4, 1, 2]], 5)).toEqual({ scale: 1.4, tx: 1, ty: 2 });
    expect(() => tableAt([], 0)).toThrow();
  });
});

describe("tableTransform", () => {
  const W = 1080;
  const H = 1920;

  it("the identity pose leaves every point where it was", () => {
    const css = tableTransform({ scale: 1, tx: 0, ty: 0 }, W, H);
    for (const p of [[0, 0], [W, H], [123, 456]] as [number, number][]) {
      const q = apply(css, p);
      expect(q[0]).toBeCloseTo(p[0], 9);
      expect(q[1]).toBeCloseTo(p[1], 9);
    }
  });

  it("zooms about the frame centre (with origin 0 0): the centre stays, a corner moves by scale", () => {
    const css = tableTransform({ scale: 2, tx: 0, ty: 0 }, W, H);
    expect(apply(css, [W / 2, H / 2])).toEqual([W / 2, H / 2]);
    // a point 100 px right of the centre lands 200 px right of it; a centred origin would double that again
    expect(apply(css, [W / 2 + 100, H / 2])).toEqual([W / 2 + 200, H / 2]);
    expect(apply(css, [0, 0])).toEqual([-W / 2, -H / 2]);
  });

  it("the translation moves the centre by exactly (tx, ty) at any zoom", () => {
    const css = tableTransform({ scale: 1.5, tx: 12, ty: -30 }, W, H);
    expect(apply(css, [W / 2, H / 2])).toEqual([W / 2 + 12, H / 2 - 30]);
  });

  it("a parallax plane zooms by scale ** depth and takes its share of the move", () => {
    const pose = { scale: 4, tx: 20, ty: 10 };
    const css = tableTransform(pose, W, H, 0.5, 0.25);
    expect(apply(css, [W / 2 + 100, H / 2])).toEqual([W / 2 + 5 + 200, H / 2 + 2.5]);
  });
});
