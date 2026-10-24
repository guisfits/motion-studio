import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { Easing } from "remotion";
import { HEIGHT, WIDTH } from "../scene";
import { lerp, planeStyle, prog, type Cam } from "../lib/s08-11-common";
import skyUrl from "../assets/gen/s09-sky.png";
import fieldUrl from "../assets/gen/s09-field.png";
import bustUrl from "../assets/gen/s09-vg-bust-cut.png";
import knifeUrl from "../assets/gen/s09-hand-knife-cut.png";
import handTopUrl from "../assets/gen/s09-hand-top-cut.png";

// S09 (abs 289-316): ear in sunflowers. Back to front: swirl sky, sunflower field, Van Gogh bust,
// a knife hand from the right, a hand from the top that lifts the ear, blurred foreground flowers.
// Camera: accelerating push 1.0 -> 1.55 with the head riding up the frame, 2 deg clockwise roll.
// Last two frames (local 26, 27): the whole picture whips up and the bottom goes black (T9>10).

const LAST = 26;
const HAND_S = 1.35;
const HEAD = { x: 378, y: 790 }; // world position of the head centre at frame 0
const EAR = { x: HEAD.x + 105, y: HEAD.y + 25 };
const BUST_W = 470; // head+beard ~ 450 source px -> ~270 px = 14 % H
const BUST_HEAD = { x: 254, y: 202 }; // head centre inside the scaled bust image

const camera = (f: number): Cam => {
  const t = Easing.in(Easing.quad)(Math.min(1, f / LAST));
  return { x: lerp(540, 470, t), y: lerp(960, 1260, t), zoom: lerp(1, 1.55, t), rotate: lerp(0, 2, t) };
};

const cover: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: WIDTH, height: HEIGHT, objectFit: "cover" };

export const S09: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camera(f);

  // knife hand: in from the right f0-8, rests behind the ear, pulls back f14-21
  const knifeIn = prog(f, 0, 8, Easing.out(Easing.cubic));
  const knifeOut = prog(f, 14, 21, Easing.in(Easing.quad));
  const knifeDx = (1 - knifeIn) * 650 + knifeOut * 700;
  const knifeDy = (1 - knifeIn) * -60 + prog(f, 8, 13) * 25;

  // top hand: comes down f6-12, holds, lifts the ear away f14-27
  const topIn = prog(f, 6, 12, Easing.out(Easing.cubic));
  const topOut = prog(f, 14, 27, Easing.in(Easing.quad));
  const topDy = (1 - topIn) * -900 - topOut * 900;
  const topDx = -topOut * 160;
  const wound = prog(f, 11, 14) ;

  // whip out (T9>10): +36 % H then +60 % H, vertical smear, bottom to black
  const whip = f >= 26 ? (f === 26 ? 0.36 : 0.6) : 0;
  const whipBlur = whip ? 14 + (f - 26) * 10 : 0;

  return (
    <AbsoluteFill style={{ background: "#1a1a18", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translateY(${-whip * HEIGHT}px)`,
          filter: whipBlur ? `blur(${whipBlur / 4}px)` : undefined,
        }}
      >
        <div style={planeStyle(cam, 0.7)}>
          <Img src={skyUrl} style={cover} />
        </div>
        <div style={planeStyle(cam, 0.9)}>
          <Img
            src={fieldUrl}
            style={{
              ...cover,
              WebkitMaskImage: "linear-gradient(to bottom, transparent 44%, #000 53%)",
              maskImage: "linear-gradient(to bottom, transparent 44%, #000 53%)",
            }}
          />
        </div>
        <div style={planeStyle(cam, 1)}>
          <Img
            src={bustUrl}
            style={{ position: "absolute", left: HEAD.x - BUST_HEAD.x, top: HEAD.y - BUST_HEAD.y, width: BUST_W }}
          />
          <Img
            src={knifeUrl}
            style={{
              position: "absolute",
              left: EAR.x - 82 + knifeDx,
              top: EAR.y - 171 + knifeDy,
              width: 760,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: EAR.x - 14,
              top: EAR.y - 6,
              width: 28,
              height: 40,
              borderRadius: "50%",
              background: "#a01616",
              opacity: wound * 0.9,
              filter: "blur(3px)",
            }}
          />
          {/* the cut-out is only the hand holding the ear (the arm was lost by the matting): the forearm is drawn */}
          <div
            style={{
              position: "absolute",
              left: EAR.x - 430 * HAND_S + topDx,
              top: EAR.y - 740 * HAND_S + topDy,
              width: 768,
              height: 1024,
              transformOrigin: "0 0",
              transform: `scale(${HAND_S})`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 372,
                top: -1600,
                width: 118,
                height: 2230,
                borderRadius: "0 0 40px 40px",
                background: "linear-gradient(90deg, #b9825f, #e0b394 45%, #c48f6d)",
              }}
            />
            <Img src={handTopUrl} style={{ position: "absolute", left: 0, top: 0, width: 768, height: 1024 }} />
          </div>
        </div>
        <div style={planeStyle(cam, 1)}>
          <Img
            src={fieldUrl}
            style={{
              ...cover,
              WebkitMaskImage: "linear-gradient(to bottom, transparent 55%, #000 63%)",
              maskImage: "linear-gradient(to bottom, transparent 55%, #000 63%)",
            }}
          />
        </div>
        <div style={{ ...planeStyle(cam, 1.3), filter: "blur(7px)" }}>
          <Img
            src={fieldUrl}
            style={{
              ...cover,
              top: 700,
              transform: "scale(1.5)",
              transformOrigin: "50% 100%",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 55%, #000 80%)",
              maskImage: "linear-gradient(to bottom, transparent 55%, #000 80%)",
            }}
          />
        </div>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)" }} />
      </AbsoluteFill>
      {whip > 0 && (
        <AbsoluteFill
          style={{ background: "linear-gradient(to bottom, transparent 40%, #1a1a18 85%)", opacity: f === 26 ? 0.6 : 1 }}
        />
      )}
    </AbsoluteFill>
  );
};
