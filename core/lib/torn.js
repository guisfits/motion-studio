// A torn paper edge: a seeded, fixed clip-path polygon (never random per frame), shared by the
// vox kit (pieces, clippings) and the table (torn surfaces).
import { rng } from "./motion.js";

// A torn edge on all four sides. n: points along the long sides (even; the short sides get half),
// depth: how far the tear bites in, as % of the side.
export function tornClip(seed, n = 16, depth = 3.5) {
  const r = rng(seed);
  const j = () => r() * depth;
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${j()}%`);
  for (let i = 1; i <= n / 2; i++) pts.push(`${100 - j() * 0.6}% ${(i / (n / 2)) * 100}%`);
  for (let i = n - 1; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - j()}%`);
  for (let i = n / 2 - 1; i >= 1; i--) pts.push(`${j() * 0.6}% ${(i / (n / 2)) * 100}%`);
  return `polygon(${pts.join(",")})`;
}
