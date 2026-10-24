import { bounce } from "../../../../src/physics";

/** Stroke cycle of the painter's arm at ~2.6 Hz (16 fps: 6 frames per stroke), with spring follow-through. */
export const STROKE_F = 6;

/** Shoulder, elbow and "dab" angles (deg) at frame f: a quick press toward the canvas, then a springy release. */
export function strokeAngles(f: number, fps: number): { ua: number; fa: number; dab: number } {
  const k = Math.floor(f / STROKE_F);
  const t = f - k * STROKE_F;
  const kick = ((k * 7) % 5) - 2; // each stroke lands a little differently
  const press = bounce(t, fps, { hz: 3.4, damping: 0.4 });
  const drift = 1.5 * Math.sin(f * 0.21);
  return { ua: -2.5 * press + 1.4 * kick * 0.4 + drift, fa: 7 * press - 3 + kick, dab: press };
}

/** Wet-paint dab where the brush lands: grows then fades within one stroke. */
export const Dab: React.FC<{ x: number; y: number; t: number; hue: string }> = ({ x, y, t, hue }) => {
  const a = Math.max(0, 1 - t / 5);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 11,
        top: y - 6,
        width: 22 + t * 2,
        height: 12 + t,
        borderRadius: 8,
        background: hue,
        opacity: 0.55 * a,
        filter: "blur(1.5px)",
        mixBlendMode: "screen",
      }}
    />
  );
};
