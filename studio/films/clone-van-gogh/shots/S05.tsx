import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { H, Sprite, W, ZoomBlurLayer, tab } from "../lib/s04-07-kit";
import { bounce } from "../../../../src/physics";
import { S04Scene } from "./S04";
import plateUrl from "../assets/gen/a47-s05-plate.png";
import brainUrl from "../assets/gen/a47-brain-top-cut.png";

// Shot 5 (local 0 = scene frame 148). Measured on the reference (frames 148-181):
//  f0      the wide S04 frame, smeared vertically (the frame before the zoom);
//  f1-f11  the balance scene arrives through a radial zoom blur: x3 -> x1 in a decelerating ease
//          (3.0, 1.9, 1.5, 1.33, 1.2, 1.11 ...) while the blur radius falls to nothing;
//  f9-f14  the brain sits in the pan and the scene sways a little;
//  f15-f20 the pan tips: the whole picture rolls ~20 deg about the hand and rings out (spring);
//  f20+    the brain slides off the pan and falls under gravity, tumbling, out of the bottom.
const FPS = 16;
const S = 1.25; // plate scale: the pan is 0.42 W wide, as in the reference
const PAN_IMG = { x: 0.46, y: 0.5 };
const PAN_SCREEN = { x: 0.4, y: 0.45 };
const PIVOT_IMG = { x: 0.47, y: 0.19 };
const BRAIN_ALPHA = 0.72;
const BRAIN_W = (0.27 * W) / BRAIN_ALPHA;

const ZOOM = [1, 3.0, 1.9, 1.5, 1.33, 1.2, 1.11, 1.06, 1.035, 1.02, 1.01, 1.0];
const BLUR = [0, 130, 85, 55, 32, 18, 9, 4, 0];
const LEAVE = 17; // frame the pan lets go of the brain (inertia: the pan is pulled away, the brain stays)
const GRAVITY = 8; // px per frame^2
const SPIN = 11; // deg per frame once it falls

const imgToScreen = (p: { x: number; y: number }) => ({ x: PAN_SCREEN.x * W + (p.x - PAN_IMG.x) * W * S, y: PAN_SCREEN.y * H + (p.y - PAN_IMG.y) * H * S });
const PIVOT = imgToScreen(PIVOT_IMG);
const PAN = imgToScreen(PAN_IMG);

const roll = (f: number) => 18 * bounce(f - 14, FPS, { hz: 1.0, damping: 0.4 }) + 0.8 * Math.sin(f * 0.3);

/** Point `p` carried by the picture's roll about the hand. */
const rolled = (p: { x: number; y: number }, deg: number) => {
  const a = (deg * Math.PI) / 180;
  const dx = p.x - PIVOT.x;
  const dy = p.y - PIVOT.y;
  return { x: PIVOT.x + dx * Math.cos(a) - dy * Math.sin(a), y: PIVOT.y + dx * Math.sin(a) + dy * Math.cos(a) };
};

const seat = { x: PAN.x, y: PAN.y - 0.045 * H };
const brainPose = (f: number) => {
  if (f < LEAVE) {
    const th = roll(f);
    return { ...rolled(seat, th), rot: th };
  }
  // inertia: the brain keeps the pan's last position, kicked slightly up, then falls freely, tumbling
  const p0 = rolled(seat, roll(LEAVE));
  const t = f - LEAVE;
  return { x: p0.x + 3 * t, y: p0.y - 6 * t + 0.5 * GRAVITY * t * t, rot: roll(LEAVE) + SPIN * t };
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const z = tab(ZOOM, f);
  const b = brainPose(f);
  const th = roll(f);
  return (
    <AbsoluteFill style={{ background: "#120e09", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "#3a2d19", transform: `scale(${z})`, transformOrigin: `${PAN_SCREEN.x * 100}% ${PAN_SCREEN.y * 100}%` }}>
        <div style={{ position: "absolute", left: PIVOT.x - PIVOT_IMG.x * W * S, top: PIVOT.y - PIVOT_IMG.y * H * S, width: W * S, height: H * S, transform: `rotate(${th}deg)`, transformOrigin: `${PIVOT_IMG.x * 100}% ${PIVOT_IMG.y * 100}%` }}>
          <Img src={plateUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "brightness(1.55) sepia(0.35) saturate(1.2)" }} />
        </div>
        <Sprite src={brainUrl} x={b.x} y={b.y} w={BRAIN_W} rot={b.rot} style={{ filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.55))" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 55%, rgba(8,6,3,0.8) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 45% 40%, transparent 35%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

export const S05: React.FC = () => {
  const f = useCurrentFrame();
  if (f === 0) {
    return (
      <AbsoluteFill style={{ filter: "url(#a47-vsmear)" }}>
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id="a47-vsmear" x="-5%" y="-10%" width="110%" height="120%">
            <feGaussianBlur stdDeviation="0 14" />
          </filter>
        </svg>
        <S04Scene f={43} exit />
      </AbsoluteFill>
    );
  }
  return (
    <ZoomBlurLayer amount={tab(BLUR, f)} center={[PAN_SCREEN.x, PAN_SCREEN.y]}>
      <Scene f={f} />
    </ZoomBlurLayer>
  );
};
