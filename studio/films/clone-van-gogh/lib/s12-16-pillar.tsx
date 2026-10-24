import { AbsoluteFill } from "remotion";

/** Dark pillar sweep T13>14 (abs frames 430-436), drawn by both S13 and S14 at the same absolute frame. */
export function pillarSpan(abs: number): [number, number] | null {
  // [left, right] edge as a fraction of the frame width
  // Measured on the reference (0-based abs frames): the bar enters from the right, widens over the
  // middle (old shot still visible left of it), then its trailing edge runs back left, revealing the
  // new shot behind it on the right. Cut under the bar at 433.
  const table: Record<number, [number, number]> = {
    427: [0.92, 1.3],
    428: [0.86, 1.3],
    429: [0.8, 1.3],
    430: [0.72, 1.3],
    431: [0.62, 1.3],
    432: [0.38, 1.3],
    433: [-0.3, 0.38],
    434: [-0.3, 0.28],
    435: [-0.3, 0.2],
    436: [-0.3, 0.1],
    437: [-0.3, 0.02],
  };
  return table[abs] ?? null;
}

export const Pillar: React.FC<{ abs: number }> = ({ abs }) => {
  const span = pillarSpan(abs);
  if (!span) return null;
  const [l, r] = span;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${l * 100}%`,
          width: `${(r - l) * 100}%`,
          background: "linear-gradient(90deg, #26261f 0%, #0e0e0c 14%, #0e0e0c 86%, #1c1c18 100%)",
          filter: "blur(4px)",
        }}
      />
    </AbsoluteFill>
  );
};
