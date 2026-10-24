import { AbsoluteFill, Easing, Img, useCurrentFrame } from "remotion";
import { HEIGHT, WIDTH } from "../scene";
import { throwIn, impactShake, drift } from "../../../../src/physics";
import { CAM_S09, camRow, camTransform } from "../lib/s09-11-cam";
import { lerp, prog } from "../lib/s08-11-common";
import skyUrl from "../assets/gen/s09-sky2.png";
import fieldUrl from "../assets/gen/s09-field2.png";
import bustUrl from "../assets/gen/s09-bust2-cut.png";
import knifeUrl from "../assets/gen/s09-hand-knife2-cut.png";
import earHandUrl from "../assets/gen/s09-hands-ear-cut.png";
import earOnlyUrl from "../assets/gen/s09-ear-only.png";

// S09 (abs 289-316): ear in sunflowers, rebuilt from the reference's pixels (not the breakdown's numbers:
// the head+beard is 22 % of the frame height at f289, not 14 %). Back to front: impasto swirl sky,
// a dense sunflower field, the Van Gogh bust (3/4 left, head centre at 46 % W / 37 % H), the field
// again in front of his chest, a knife hand from the right, the left hand from the top-left that
// carries the ear, and a blurred foreground of big flowers.
// Camera: the reference's measured path (lib/s09-11-cam.ts): a decelerating push-in 1 -> 1.56 over 14
// frames (five punches, the first +12.9 %), then from local 16 the whole picture slides up (the last
// frame +36 % H) and the bottom goes black (T9>10).

const FPS = 16;
const FIELD_Y = 0.5 * HEIGHT; // where the flowers start
const BUST_K = 1.05; // head+beard 22 % of the frame height, as measured on the reference
const BUST = { w: 768 * BUST_K, left: 66, top: 528 }; // head centre lands at (486, 806): 45 % W, 42 % H
const EAR = { x: BUST.left + 535 * BUST_K, y: BUST.top + 305 * BUST_K };

const sky: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: WIDTH, height: HEIGHT, objectFit: "cover", filter: "saturate(1.2) contrast(1.22) brightness(0.98)" };

/** The flower field at a given scale of the generated plate (the plate's flowers are ~2x the reference's). */
const Field: React.FC<{ k: number; bottom: number; blur?: number; mask: [number, number]; flip?: boolean }> = ({ k, bottom, blur = 0, mask, flip }) => {
  const w = 1088 * k;
  const h = 1920 * k;
  const copies = Math.ceil(WIDTH / w) + 1;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        WebkitMaskImage: `linear-gradient(to bottom, transparent ${mask[0]}px, #000 ${mask[1]}px)`,
        maskImage: `linear-gradient(to bottom, transparent ${mask[0]}px, #000 ${mask[1]}px)`,
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
    >
      {Array.from({ length: copies }, (_, i) => (
        <Img key={i} src={fieldUrl} style={{ position: "absolute", left: i * w - (flip ? w * 0.3 : 0), top: bottom - h, width: w, height: h, transform: i % 2 ? "scaleX(-1)" : undefined }} />
      ))}
    </div>
  );
};

export const S09: React.FC = () => {
  const f = useCurrentFrame();
  const c = camRow(CAM_S09, f);
  const dz = Math.abs(c.s / camRow(CAM_S09, f - 1).s - 1) * 100;
  const smear = f === 0 ? 0 : Math.min(5, dz * 0.45); // zoom smear on the punches
  const slide = f >= 16 ? Math.min(14, Math.abs(c.ty - camRow(CAM_S09, f - 1).ty) / 40) : 0; // vertical smear while it slides

  // knife hand (cut-out 1024x768, grip at (330, 230), blade up-left): in already at f0 with the blade
  // pointing left behind the head; it swings round to point down at the ear by local 7 (overshoot), then presses in.
  const knife = throwIn(f + 2, FPS, {
    from: { x: 150, y: -40, rotate: 4, scale: 0.92 },
    to: { x: 0, y: 0, rotate: -100, scale: 1 },
    frames: 7,
    damping: 0.5,
  });
  const press = prog(f, 12, 16, Easing.out(Easing.cubic));
  const knifeShake = impactShake(f, FPS, "s09-knife", { at: 16, amp: 5, hz: 8, decay: 8 });
  const KNIFE_K = 0.45;
  const GRIP = { x: 780, y: 790 };

  // ear hand (cut-out 1024x768, pinch at (610, 386)): thrown in from the top-left on local 8 and over-
  // shoots onto the head, where the ear sits on his; it then rides along with a small drift.
  // phase A (local 8-11): arrives above the head; phase B (local 12-17): slides down onto his ear.
  const HAND_K = 0.5;
  const PINCH_A = { x: 560, y: 500 };
  const PINCH_B = { x: EAR.x + 6, y: EAR.y - 86 };
  const earHand = throwIn(f - 8, FPS, {
    from: { x: -760, y: -700, rotate: -16, scale: 0.95 },
    to: { x: 0, y: 0, rotate: 0, scale: 1 },
    frames: 3,
    arc: 90,
    damping: 0.5,
  });
  const down = throwIn(f - 12, FPS, { from: { x: 0, y: 0, rotate: 0, scale: 1 }, to: { x: 1, y: 1, rotate: 0, scale: 1 }, frames: 4, damping: 0.55 });
  const earDrift = drift(f, FPS, "s09-ear", { amp: 5, hz: 1.2 });
  const pinch = { x: lerp(PINCH_A.x, PINCH_B.x, down.x) + earDrift.x, y: lerp(PINCH_A.y, PINCH_B.y, down.y) + earDrift.y };

  const yb = HEIGHT / 2 + c.ty + c.s * (HEIGHT / 2); // screen y of the picture's bottom edge
  const layer = (d: number, children: React.ReactNode, extra?: React.CSSProperties) => (
    <div style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: HEIGHT, transformOrigin: "0 0", transform: camTransform(c, d, 1), ...extra }}>{children}</div>
  );

  return (
    <AbsoluteFill style={{ background: "#1a1a18", overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: smear > 0.3 || slide > 0.5 ? `blur(${Math.max(smear, slide * 0.25).toFixed(2)}px)` : undefined }}>
        {layer(0.85, <Img src={skyUrl} style={sky} />)}
        {layer(1, <Field k={0.42} bottom={HEIGHT + 60} mask={[FIELD_Y - 40, FIELD_Y + 20]} />)}
        {layer(
          1,
          <>
            <Img src={bustUrl} style={{ position: "absolute", left: BUST.left, top: BUST.top, width: BUST.w }} />
          </>,
        )}
        {layer(1, <Field k={0.5} bottom={HEIGHT + 100} mask={[FIELD_Y + 170, FIELD_Y + 300]} flip />
        )}
        {layer(1, <Field k={0.75} bottom={HEIGHT + 160} mask={[FIELD_Y + 330, FIELD_Y + 480]} blur={2.5} />)}
        {layer(
          1,
          <>
            <div
              style={{
                position: "absolute",
                left: GRIP.x - 370 + knife.x - press * 30 + knifeShake.x,
                top: GRIP.y - 350 + knife.y + press * 22 + knifeShake.y,
                width: 1024,
                height: 768,
                transformOrigin: "370px 350px",
                transform: `scale(${KNIFE_K * knife.scale})`,
                filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.45))",
              }}
            >
              {/* the fist and arm stay put; only the blade swings round the grip */}
              <Img src={knifeUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", clipPath: "inset(0 0 0 370px)" }} />
              <Img src={knifeUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", clipPath: "inset(0 654px 0 0)", transformOrigin: "370px 350px", transform: `rotate(${knife.rotate}deg)` }} />
            </div>
            {f >= 8 && (
              <div
                style={{
                  position: "absolute",
                  left: pinch.x - 610 + earHand.x,
                  top: pinch.y - 386 + earHand.y,
                  width: 1024,
                  height: 768,
                  transformOrigin: "610px 386px",
                  transform: `rotate(${earHand.rotate + earDrift.rotate}deg) scale(${earHand.scale * HAND_K})`,
                  filter: "drop-shadow(0 12px 14px rgba(0,0,0,0.4))",
                }}
              >
                <Img src={earOnlyUrl} style={{ position: "absolute", left: 610 - 62, top: 372, width: 124, height: 203 }} />
                <Img src={earHandUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
              </div>
            )}
          </>,
        )}
        {layer(1.1, <Field k={1.15} bottom={HEIGHT + 300} mask={[FIELD_Y + 640, FIELD_Y + 800]} blur={6} />)}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.12) 100%)" }} />
      </AbsoluteFill>
      {/* the picture slides up off a dark bottom (T9>10): the plane's own bottom edge, softened */}
      {yb < HEIGHT + 20 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: yb - 150, height: HEIGHT, background: "linear-gradient(to bottom, rgba(26,26,24,0) 0, #1a1a18 150px)" }} />
      )}
    </AbsoluteFill>
  );
};
