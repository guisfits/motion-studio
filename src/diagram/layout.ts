// Pure layout helpers for the diagram components (no React, no Remotion).

export type TimelineItem = { label: string; year: number };
export type TreeNode = { id: string; parent?: string };
export type Point = { x: number; y: number };

const TIMELINE_PAD = 0.08;

/**
 * X position of every item on a horizontal axis `width` px wide, proportional to its year.
 * Output keeps the input order; the first and last years sit `pad * width` from the ends
 * (default `TIMELINE_PAD`), a lone item (or all-equal years) sits at the centre.
 */
export const timelineLayout = (
  items: TimelineItem[],
  width: number,
  padFraction: number = TIMELINE_PAD,
): { x: number; label: string }[] => {
  if (items.length === 0) return [];
  const years = items.map((i) => i.year);
  const min = Math.min(...years);
  const span = Math.max(...years) - min;
  const pad = width * padFraction;
  return items.map(({ label, year }) => ({
    label,
    x: span === 0 ? width / 2 : pad + ((year - min) / span) * (width - 2 * pad),
  }));
};

/**
 * Top-down tree layout inside `width` x `height`: one row per generation (root row first),
 * leaves spread evenly left to right, each parent centred over its children. Nodes whose
 * parent is missing are roots, so several roots form a forest; nodes in a parent loop are
 * placed too (the first of the loop sits on top).
 */
export const treeLayout = (
  nodes: TreeNode[],
  width: number,
  height: number,
): Record<string, Point> => {
  if (nodes.length === 0) return {};
  const ids = new Set(nodes.map((n) => n.id));
  const kids = new Map<string, string[]>();
  const roots: string[] = [];
  for (const n of nodes) {
    if (n.parent && ids.has(n.parent) && n.parent !== n.id) {
      kids.set(n.parent, [...(kids.get(n.parent) ?? []), n.id]);
    } else {
      roots.push(n.id);
    }
  }

  const depth = new Map<string, number>();
  const xSlot = new Map<string, number>();
  let leaves = 0;
  const visit = (id: string, d: number): void => {
    depth.set(id, d);
    const children = (kids.get(id) ?? []).filter((c) => !depth.has(c));
    if (children.length === 0) {
      xSlot.set(id, leaves++ + 0.5);
      return;
    }
    children.forEach((c) => visit(c, d + 1));
    const slots = children.map((c) => xSlot.get(c) as number);
    xSlot.set(id, (Math.min(...slots) + Math.max(...slots)) / 2);
  };
  roots.forEach((r) => visit(r, 0));
  // A parent loop leaves nodes no root reaches: the first of each loop becomes a root, so every
  // node is still placed.
  nodes.forEach((n) => {
    if (!depth.has(n.id)) visit(n.id, 0);
  });

  const rows = Math.max(...depth.values()) + 1;
  const out: Record<string, Point> = {};
  for (const [id, d] of depth) {
    out[id] = { x: ((xSlot.get(id) as number) / leaves) * width, y: ((d + 0.5) / rows) * height };
  }
  return out;
};

/** SVG path through `points`: straight segments, joined into one open polyline. */
export const polylinePath = (points: [number, number][]): string =>
  points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");

/** Vertical-start elbow curve from a parent's bottom to a child's top. */
export const elbowPath = (from: Point, to: Point): string => {
  const my = (from.y + to.y) / 2;
  return `M${from.x.toFixed(2)} ${from.y.toFixed(2)} C${from.x.toFixed(2)} ${my.toFixed(2)} ${to.x.toFixed(2)} ${my.toFixed(2)} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
};
