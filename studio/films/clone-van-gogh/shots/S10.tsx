import { AbsoluteFill, Easing, Img, useCurrentFrame } from "remotion";
import { HEIGHT, WIDTH } from "../scene";
import { F_LILITA, F_POPPINS, lerp, prog, useS0811Fonts } from "../lib/s08-11-common";
import { CAM_S10, camRow, camTransform } from "../lib/s09-11-cam";
import { bounce } from "../../../../src/physics";
import hallUrl from "../assets/gen/s10-hall2.png";
import manUrl from "../assets/gen/s10-man2-cut.png";

// S10 (abs 317-347): Van Gogh from behind walks down a dark corridor. The reference was an AI clip (banned
// here), so the walk is faked from measured parts: the reference's camera path (lib/s09-11-cam.ts: a
// crane-down in the first frames, a pull-back to 0.93 and a push to 1.0), a hall plate that parallaxes
// at 0.6 of it, a door that swings open, a cut-out man (3/4 length, legs dissolving into the dark) that
// slides in from behind the door to the middle of the frame with a step bob (2 steps/s), a lateral
// weight shift and a slight roll. LATER starts tucked behind his back (the reference draws "ER" behind
// the jacket for the first frames), the other words are placed in depth. Rack focus in the last frames.

const FPS = 16;
const MAN_SCALE = 1.2; // the reference jacket spans 0.40 W (measured), so the 3/4-length cut-out is drawn big
const MAN = { w: 864, h: 1536, headX: 443, headTop: 166 }; // measured on the cut-out
// the head's top (fraction of H) and centre x (fraction of W) per local frame, read from the reference strip
const HEAD_Y: [number, number][] = [[0, 0.36], [1, 0.3], [2, 0.26], [3, 0.23], [5, 0.21], [8, 0.2], [14, 0.19], [24, 0.2], [29, 0.22]];
const HEAD_X: [number, number][] = [[0, 0.3], [2, 0.37], [4, 0.44], [7, 0.49], [10, 0.5], [30, 0.51]];
const along = (k: [number, number][], f: number) => {
  if (f <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (f <= k[i][0]) {
      const t = Easing.inOut(Easing.quad)((f - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
      return lerp(k[i - 1][1], k[i][1], t);
    }
  }
  return k[k.length - 1][1];
};

type WordSpec = { text: string; at: number; per: number; x: number; y: number; size: number; font: string; opacity?: number };
const WORDS: WordSpec[] = [
  { text: "LATER", at: 1, per: 1, x: 0.53, y: 0.5, size: 250, font: F_LILITA, opacity: 0.92 },
  { text: "VOLUNTARILY", at: 15, per: 0.65, x: 0.36, y: 0.5, size: 64, font: F_POPPINS },
  { text: "ENTERED", at: 23, per: 0.5, x: 0.67, y: 0.3, size: 130, font: F_LILITA },
  { text: "THE", at: 27, per: 0.5, x: 0.285, y: 0.375, size: 120, font: F_LILITA },
];

/** Letters appear one by one (fade over 1.5 frames); `only` keeps layout but shows just those letter indices. */
const Word: React.FC<{ w: WordSpec; f: number; only?: (i: number) => boolean }> = ({ w, f, only }) => {
  const out = w.text === "LATER" ? 1 - prog(f, 11, 15, Easing.linear) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: w.x * WIDTH,
        top: w.y * HEIGHT,
        transform: "translate(-50%, -50%)",
        whiteSpace: "nowrap",
        fontFamily: `"${w.font}", sans-serif`,
        fontSize: w.size,
        lineHeight: 1,
        color: "#fff",
        textShadow: "0 4px 18px rgba(0,0,0,0.45)",
        opacity: out * (w.opacity ?? 1),
      }}
    >
      {[...w.text].map((ch, i) => {
        const a = Math.min(1, Math.max(0, (f - w.at - i * w.per) / 1.5));
        return (
          <span key={i} style={{ opacity: !only || only(i) ? a : 0 }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

export const S10: React.FC = () => {
  useS0811Fonts();
  const f = useCurrentFrame();
  const c = camRow(CAM_S10, f);

  // hall plate (0.8 of its size, window at 13 % H once the crane-down has settled), far: 0.6 of the camera
  const HALL_K = 0.8;
  const hallW = 1088 * HALL_K;
  const hallTop = 0.13 * HEIGHT - 0.37 * 1920 * HALL_K + 0.6 * 600;

  // door: closed at f0 (fills the left two thirds), swings away by f7 with a settle
  const door = bounce(f, FPS, { hz: 1.5, damping: 0.8 });

  // walk
  const headTop = along(HEAD_Y, f) * HEIGHT;
  const headX = along(HEAD_X, f) * WIDTH;
  const step = Math.abs(Math.sin((f / 8) * Math.PI));
  const bob = -step * 11;
  const weight = Math.sin(((f - 2) / 16) * Math.PI * 2) * 9;
  const roll = Math.sin(((f - 2) / 16) * Math.PI * 2) * 0.9;
  const s = MAN_SCALE * c.s ** 0.5;
  const manLeft = headX + weight - MAN.headX * s;
  const manTop = headTop + bob - MAN.headTop * s;

  // rack focus into the keyhole: the whole shot defocuses over the last frames
  const blur = f >= 27 ? [0, 0, 3, 7, 12][Math.min(4, f - 26)] ?? 12 : 0;
  const textBehind = f < 7;

  const man = (
    <div style={{ position: "absolute", left: manLeft, top: manTop, width: MAN.w * s, height: MAN.h * s, transformOrigin: "50% 100%", transform: `rotate(${roll}deg)` }}>
      <div style={{ position: "absolute", inset: 0, filter: "brightness(0.58) contrast(1.15) saturate(0.85)" }}>
        <Img src={manUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        {/* the trousers run on past the knee into the dark, to the bottom of the frame */}
        <div style={{ position: "absolute", left: "33%", width: "36%", top: "93%", height: "45%", background: "linear-gradient(#2a2a2e, #1a1a1d 40%, #121214)", WebkitMaskImage: "linear-gradient(#000 0, #000 70%, transparent)", maskImage: "linear-gradient(#000 0, #000 70%, transparent)" }} />
      </div>
    </div>
  );
  const later = WORDS[0];
  const others = WORDS.slice(1).filter((w) => f >= w.at);

  return (
    <AbsoluteFill style={{ background: "#100e0a", overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: blur ? `blur(${blur}px)` : undefined }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: HEIGHT, transformOrigin: "0 0", transform: camTransform(c, 0.6, 0.6) }}>
          <Img
            src={hallUrl}
            style={{
              position: "absolute",
              left: (WIDTH - hallW) / 2,
              top: hallTop,
              width: hallW,
              height: 1920 * HALL_K,
              filter: "brightness(1.2) contrast(1.0) saturate(1.1) sepia(0.25) blur(1.2px)",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0, #000 14%, #000 86%, transparent 100%)",
              maskImage: "linear-gradient(90deg, transparent 0, #000 14%, #000 86%, transparent 100%)",
            }}
          />
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: HEIGHT, background: "radial-gradient(ellipse at 52% 74%, rgba(240,226,170,0.55) 0%, rgba(240,226,170,0) 34%), radial-gradient(ellipse at 50% 100%, rgba(10,8,6,0.8) 0%, transparent 45%)" }} />
        {/* the door, hinged on the left edge */}
        <div style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: HEIGHT, perspective: 1500, transformOrigin: "0 0", transform: camTransform(c, 1.1, 1) }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: -400,
              width: 760,
              height: HEIGHT + 800,
              transformOrigin: "0 50%",
              transform: `rotateY(${door * 84}deg)`,
              background: "linear-gradient(90deg, #2c2414 0, #3a2f1b 55%, #241c0f 100%)",
              boxShadow: "inset 0 0 160px rgba(0,0,0,0.85)",
            }}
          />
        </div>
        {/* LATER sits between the wall and the man: "LA" in front, "TER" tucked behind his back, then it pops in front */}
        {textBehind ? (
          <>
            <Word w={later} f={f} />
            {man}
            <Word w={later} f={f} only={(i) => i < 2} />
          </>
        ) : (
          <>
            {man}
            <Word w={later} f={f} />
          </>
        )}
        {others.map((w) => (
          <Word key={w.text} w={w} f={f} />
        ))}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
