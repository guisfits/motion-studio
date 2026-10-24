import { AbsoluteFill } from "remotion";

/** Dark pillar sweep T13>14 (abs frames 430-436), drawn by both S13 and S14 at the same absolute frame. */
export function pillarSpan(abs: number): [number, number] | null {
  // [left, right] edge as a fraction of the frame width
  const table: Record<number, [number, number]> = {
    430: [0.82, 1.1],
    431: [0.6, 1.1],
    432: [0.35, 1.1],
    433: [-0.1, 1.1],
    434: [-0.1, 0.87],
    435: [-0.1, 0.13],
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
