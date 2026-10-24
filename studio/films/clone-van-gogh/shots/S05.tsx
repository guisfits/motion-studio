import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { EASE_IN, EASE_IO, EASE_OUT, H, RadialBlur, Sprite, W, kf } from "../lib/s04-07-kit";
import { S04Scene } from "./S04";
import scaleUrl from "../assets/gen/s05-scale.png";
import brainUrl from "../assets/gen/s05-brain-gold-cut.png";

// Shot 5 (local 0 = scene frame 148 = breakdown f149). Opens with the radial zoom blur over S04's
// last frames (T4>5, f149-152), then the balance scene settles from 1.25x to 1.05x.

/** Gold brain sprite: the cut-out's alpha box is 641 of 832 px wide. */
const BRAIN_W = 0.2 * W * (832 / 641);
// Left pan, in screen fractions at zoom 1.
const PAN = { x: 0.3, y: 0.38 };

const brainPose = (f: number) => {
  // sits in the pan f150-165, the beam tips and it slides (166-172), then falls (173-181).
  const y = kf(f, [[0, 0.38], [17, 0.38], [24, 0.45, EASE_IO], [26, 0.46], [32, 1.04, EASE_IN]]);
  const x = kf(f, [[0, PAN.x], [17, PAN.x], [26, 0.34, EASE_IO], [32, 0.45]]);
  const rot = kf(f, [[17, 0], [26, 40, EASE_IO], [32, 150]]);
  return { x: x * W, y: y * H, rot };
};

const Scene: React.FC<{ f: number; zoom: number }> = ({ f, zoom }) => {
  const sway = 1.6 * Math.sin(f * 0.28);
  const b = brainPose(f);
  return (
    <AbsoluteFill style={{ background: "#1a150c", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 40%" }}>
        <Img
          src={scaleUrl}
          style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover", transform: `rotate(${sway * 0.4}deg)`, transformOrigin: "55% 12%" }}
        />
        <Sprite src={brainUrl} x={b.x} y={b.y} w={BRAIN_W} rot={b.rot} style={{ filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.55))" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(255,190,110,0.16)", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

export const S05: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = kf(f, [[0, 1.6], [1, 2.0], [2, 1.5], [3, 1.28, EASE_OUT], [7, 1.05, EASE_OUT]]);
  const blur = kf(f, [[0, 0.9], [1, 1.2], [2, 0.8], [3, 0.4], [4, 0]]);
  // S04's last frames dissolve out under the blur.
  const s04 = kf(f, [[0, 0.85], [1, 0.3], [2, 0]]);
  return (
    <AbsoluteFill>
      <RadialBlur amount={blur} origin="50% 42%">
        <Scene f={f} zoom={zoom} />
      </RadialBlur>
      {s04 > 0.01 && (
        <AbsoluteFill style={{ opacity: s04 }}>
          <RadialBlur amount={0.9} origin="50% 42%">
            <AbsoluteFill style={{ transform: `scale(${kf(f, [[0, 1.6], [1, 2.1]])})`, transformOrigin: "50% 45%" }}>
              <S04Scene f={43 + f} />
            </AbsoluteFill>
          </RadialBlur>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
