import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SetDown, Tape, Torn, stepFrame, tornSplitClips, wiggle } from "../../src/paper";
// Public-domain fixtures (assets/README.md). Imported, so Remotion's bundler serves them
// without a public dir.
import riders from "../../assets/img/durer-four-riders.jpg";
import campoVaccino from "../../assets/img/piranesi-campo-vaccino.jpg";
import cutSibyl from "../../assets/cut/cut-sibyl.png";
import cutVirgin from "../../assets/cut/cut-virgin.png";
import cutMoses from "../../assets/cut/cut-moses.png";

const FPS = 30;
export const T05_DURATION = 10.5 * FPS;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sec = (s: number) => s * FPS;

// Sheet C: the one torn in two. Box and tear height in px.
const C = { x: 800, y: 90, w: 1000, h: 697 };
const TEAR_AT = 4.9; // seconds
const GUIDE_FROM = 3.5;
const SPLIT = tornSplitClips("t05-rip", 50, 2.6);

/** Boil on a settled piece: a new offset every pose of the 12 fps clock, held between. */
const Boil: React.FC<{ seed: string; amp?: number; children: React.ReactNode }> = ({
  seed,
  amp = 2,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const w = wiggle(seed, frame, fps, amp);
  return <div style={{ transform: `translate(${w.x}px, ${w.y}px) rotate(${w.rotate * 0.25}deg)` }}>{children}</div>;
};

const Sheet: React.FC<{ src: string; w: number; h: number; pad?: number }> = ({ src, w, h, pad = 14 }) => (
  <div style={{ width: w, height: h, padding: pad, boxSizing: "border-box", background: "#f4efe3" }}>
    <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.4) contrast(1.05)" }} />
  </div>
);

/** Cut-out with a white die-cut rim (four hard drop-shadows). */
const Cut: React.FC<{ src: string; h: number; w: number }> = ({ src, h, w }) => {
  const rim = [`3px 0`, `-3px 0`, `0 3px`, `0 -3px`].map((o) => `drop-shadow(${o} 0 #fbf8f1)`).join(" ");
  return (
    <div style={{ filter: rim }}>
      <Img src={src} style={{ width: w, height: h, display: "block" }} />
    </div>
  );
};

/** The two halves of sheet C: dashed guide, jolt on the tear, then settle apart. */
const TornSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (stepFrame(frame, fps, 12) - sec(TEAR_AT)) / fps; // stepped, like every piece
  const torn = t >= 0;
  const guide = interpolate(frame, [sec(GUIDE_FROM), sec(TEAR_AT - 0.3)], [0, 1], clamp);

  // Jolt: kick away on the tear, ring down in ~0.5 s, settle into a small gap.
  const ring = torn ? Math.exp(-9 * t) * Math.sin(26 * t) : 0;
  const open = torn ? 1 - Math.exp(-14 * t) : 0;
  const top = { dy: -(10 * open + 26 * ring), rot: -(1.6 * open + 6 * ring) };
  const bottom = { dy: 16 * open + 30 * ring, rot: 2.4 * open + 9 * ring };

  const half = (clip: string, d: { dy: number; rot: number }, origin: string) => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: origin,
        transform: `translateY(${d.dy}px) rotate(${d.rot}deg)`,
        filter: torn ? `drop-shadow(3px 5px 3px rgba(20,12,6,${0.36 * Math.min(1, open * 3)}))` : undefined,
      }}
    >
      <Torn seed="t05-c" clip={clip} fibre={torn ? "#fbf8f1" : null} style={{ width: C.w, height: C.h }}>
        <Sheet src={campoVaccino} w={C.w} h={C.h} />
      </Torn>
    </div>
  );

  return (
    <div style={{ position: "relative", width: C.w, height: C.h }}>
      {half(SPLIT.top, top, "50% 100%")}
      {half(SPLIT.bottom, bottom, "50% 0%")}
      {!torn ? (
        <svg width={C.w} height={C.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <line
            x1={0}
            y1={C.h / 2}
            x2={C.w}
            y2={C.h / 2}
            stroke="#3a2a1c"
            strokeWidth={4}
            strokeDasharray="16 12"
            strokeLinecap="round"
            pathLength={1}
            // dashes alone cannot be drawn on progressively: mask the line with a growing clip
            style={{ clipPath: `inset(0 ${(1 - guide) * 100}% 0 0)` }}
          />
        </svg>
      ) : null}
    </div>
  );
};

export const T05Paper: React.FC = () => {
  const frame = useCurrentFrame();
  // The stage drifts smoothly while the pieces step: smooth camera, stepped paper.
  const drift = interpolate(frame, [0, T05_DURATION], [1, 1.02], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#d8d0bf", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        <SetDown delay={0.3} from="left" rotate={-3} style={{ left: 100, top: 70 }}>
          <Boil seed="a" amp={1.2}>
            <Sheet src={riders} w={640} h={908} />
          </Boil>
        </SetDown>
        <Tape delay={1.2} rotate={-38} width={240} top={80} style={{ left: 60 }} />

        <SetDown delay={1.8} from="right" rotate={1.5} margin={600} style={{ left: C.x, top: C.y }}>
          <TornSheet />
        </SetDown>
        <Tape delay={2.7} rotate={30} width={250} top={80} style={{ left: 1640 }} />

        {[
          { src: cutMoses, w: 282, h: 560, x: 770, y: 430, delay: 6.0, rot: -3, seed: "c1" },
          { src: cutVirgin, w: 600, h: 528, x: 1200, y: 460, delay: 7.4, rot: -1.5, seed: "c3" },
          { src: cutSibyl, w: 288, h: 600, x: 440, y: 390, delay: 8.8, rot: 2, seed: "c2" },
        ].map((c) => (
          <SetDown key={c.seed} delay={c.delay} from="bottom" rotate={c.rot} style={{ left: c.x, top: c.y }}>
            <Boil seed={c.seed} amp={2}>
              <Cut src={c.src} w={c.w} h={c.h} />
            </Boil>
          </SetDown>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
