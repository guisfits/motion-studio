import { describe, expect, it } from "vitest";
import { timelineLayout, treeLayout } from "../layout";

describe("timelineLayout", () => {
  const items = [
    { label: "a", year: 1517 },
    { label: "b", year: 1521 },
    { label: "c", year: 1534 },
    { label: "d", year: 1560 },
  ];

  it("keeps input order and labels", () => {
    expect(timelineLayout(items, 1000).map((p) => p.label)).toEqual(["a", "b", "c", "d"]);
  });

  it("is monotonic in year and inside the width", () => {
    const xs = timelineLayout(items, 1000).map((p) => p.x);
    for (let i = 1; i < xs.length; i++) expect(xs[i]).toBeGreaterThan(xs[i - 1]);
    for (const x of xs) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1000);
    }
  });

  it("is proportional to the year gaps", () => {
    const xs = timelineLayout(items, 1000).map((p) => p.x);
    expect((xs[2] - xs[1]) / (xs[1] - xs[0])).toBeCloseTo(13 / 4, 5);
  });

  it("orders by year even when the input is unsorted", () => {
    const out = timelineLayout([items[2], items[0], items[1]], 1000);
    expect(out[1].x).toBeLessThan(out[2].x);
    expect(out[2].x).toBeLessThan(out[0].x);
  });

  it("handles empty input, a single item and equal years", () => {
    expect(timelineLayout([], 1000)).toEqual([]);
    expect(timelineLayout([items[0]], 1000)[0].x).toBe(500);
    const eq = timelineLayout([items[0], { label: "z", year: 1517 }], 1000);
    expect(eq[0].x).toBe(eq[1].x);
    expect(eq[0].x).toBeGreaterThanOrEqual(0);
    expect(eq[0].x).toBeLessThanOrEqual(1000);
  });
});

describe("treeLayout", () => {
  const nodes = [
    { id: "root" },
    { id: "a", parent: "root" },
    { id: "b", parent: "root" },
    { id: "a1", parent: "a" },
    { id: "a2", parent: "a" },
    { id: "b1", parent: "b" },
  ];

  it("puts the root at the top and children below their parent", () => {
    const p = treeLayout(nodes, 1000, 600);
    expect(p.root.y).toBeLessThan(p.a.y);
    expect(p.a.y).toBeLessThan(p.a1.y);
    for (const n of nodes) {
      expect(p[n.id].x).toBeGreaterThanOrEqual(0);
      expect(p[n.id].x).toBeLessThanOrEqual(1000);
      expect(p[n.id].y).toBeGreaterThanOrEqual(0);
      expect(p[n.id].y).toBeLessThanOrEqual(600);
    }
    for (const n of nodes) if (n.parent) expect(p[n.id].y).toBeGreaterThan(p[n.parent].y);
  });

  it("keeps nodes of one level apart", () => {
    const p = treeLayout(nodes, 1000, 600);
    const row = ["a1", "a2", "b1"].map((id) => p[id].x).sort((x, y) => x - y);
    for (let i = 1; i < row.length; i++) expect(row[i] - row[i - 1]).toBeGreaterThan(10);
    expect(p.a.x).not.toBe(p.b.x);
  });

  it("centres a parent over its children", () => {
    const p = treeLayout(nodes, 1000, 600);
    expect(p.a.x).toBeCloseTo((p.a1.x + p.a2.x) / 2, 5);
  });

  it("handles empty input, a single node and several roots", () => {
    expect(treeLayout([], 1000, 600)).toEqual({});
    const one = treeLayout([{ id: "x" }], 1000, 600);
    expect(one.x.x).toBe(500);
    const forest = treeLayout([{ id: "r1" }, { id: "r2" }], 1000, 600);
    expect(forest.r1.y).toBe(forest.r2.y);
    expect(forest.r1.x).not.toBe(forest.r2.x);
  });
});
