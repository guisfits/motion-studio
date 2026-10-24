import { describe, expect, it } from "vitest";
import { routeHead } from "../RouteMap";

describe("routeHead", () => {
  const route: [number, number][] = [[0, 0], [1, 0], [1, 1]];

  it("walks the polyline in px: start, a corner, the end", () => {
    expect(routeHead(route, 0, 200, 100)).toEqual({ x: 0, y: 0 });
    const mid = routeHead(route, 0.5, 200, 100);
    expect(mid.x).toBeCloseTo(150, 3); // 300 px long, half of it is 150 px along the top edge
    expect(mid.y).toBeCloseTo(0, 3);
    const end = routeHead(route, 1, 200, 100);
    expect(end.x).toBeCloseTo(200, 3);
    expect(end.y).toBeCloseTo(100, 3);
  });

  it("clamps progress outside 0..1", () => {
    expect(routeHead(route, -3, 200, 100)).toEqual(routeHead(route, 0, 200, 100));
    expect(routeHead(route, 4, 200, 100)).toEqual(routeHead(route, 1, 200, 100));
  });

  it("does not throw on an empty route or a single point", () => {
    expect(routeHead([], 0.5, 200, 100)).toEqual({ x: 0, y: 0 });
    expect(routeHead([[0.5, 0.5]], 0.5, 200, 100)).toEqual({ x: 100, y: 50 });
  });
});
