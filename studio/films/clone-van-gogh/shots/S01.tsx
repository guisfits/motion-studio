import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT, H, W, Pic, backOut, hash, keys, useFonts } from "../lib/s01-03-kit";
import skyUrl from "../assets/gen/s01-sky.png";
import seaUrl from "../assets/gen/s01-sea.png";
import manUrl from "../assets/gen/s01-vg-sink-cut.png";
import fishAUrl from "../assets/gen/s01-fish-a-cut.png";
import fishBUrl from "../assets/gen/s01-fish-b-cut.png";

// S01 (abs 0-31): drowning. 1a wide (local 0-9), 1b punch-in + PAIN stamps (10-31).
// Numbers measured on the reference frames 1, 10, 11, 27 (breakdown "Shot 1a/1b").

const PUNCH = 10;

type FishPose = [number, number, number]; // centre x, y (fractions), width (fraction of W)
const FISH: { src: string; wide?: FishPose; punch?: FishPose; dx: number; flip?: boolean }[] = [
  { src: fishAUrl, wide: [0.59, 0.88, 0.5], punch: [0.4, 0.84, 0.47], dx: 0.007 },
  { src: fishAUrl, wide: [0.17, 0.73, 0.12], punch: [0.86, 0.52, 0.1], dx: 0.002 },
  { src: fishAUrl, wide: [0.65, 0.51, 0.04], dx: 0.001 },
  { src: fishAUrl, wide: [0.33, 0.58, 0.05], dx: 0.001 },
  { src: fishAUrl, punch: [0.08, 0.95, 0.3], dx: 0.004 },
  { src: fishBUrl, wide: [0.19, 0.51, 0.12], punch: [0.1, 0.53, 0.13], dx: -0.002 },
  { src: fishBUrl, wide: [0.6, 0.61, 0.11], punch: [0.8, 0.7, 0.22], dx: -0.003 },
];

const STAMP_START = [20, 20, 22, 22, 24, 24, 26, 26];
const STAMP_BASE: [number, number, number][] = [
  [0.24, 0.49, 0.2], [0.63, 0.4, 0.16], [0.24, 0.68, 0.22], [0.58, 0.66, 0.2],
  [0.49, 0.61, 0.16], [0.36, 0.55, 0.16], [0.72, 0.52, 0.18], [0.42, 0.45, 0.16],
];

export const S01: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const punch = f >= PUNCH;
  const pf = f - PUNCH;

  // World camera: wide = identity (waterline 38 % H), punch = ~1.45x about (0.3 W, 0.49 H).
  const wl = H * 0.38;
  const oy = 943;
  const camS = punch ? keys(pf, [[0, 1.45], [21, 1.52]]) : keys(f, [[0, 1], [9, 1.04]]);
  const camOx = punch ? 324 : 540;
  const camOy = punch ? oy : 700;
  const camLift = punch ? keys(pf, [[0, 0], [21, 40]]) : 0;

  const man = punch
    ? { cx: W * 0.5, cy: H * keys(pf, [[0, 0.565], [21, 0.575]]), h: H * 0.42, s: keys(pf, [[0, 1], [21, 1.06]]) }
    : { cx: W * 0.5 + f * 1.2, cy: H * (0.375 + (f / 9) * 0.02), h: H * 0.28, s: 1 };

  const fishScale = punch ? 1 : 1;
  const nStamps = STAMP_START.filter((s) => f >= s).length;

  return (
    <AbsoluteFill style={{ background: "#12254A", overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: `${camOx}px ${camOy}px`, transform: `translateY(${camLift}px) scale(${camS})` }}>
        <div style={{ position: "absolute", left: 0, top: wl - 1500, width: W, height: 1500, background: "#1b2c4d" }} />
        <img src={skyUrl} style={{ position: "absolute", left: -110 - f * 4.3, top: wl + 330 - 2311, width: 1300, height: 2311, filter: "brightness(1.15)" }} />
        <img src={skyUrl} style={{ position: "absolute", left: 560 - f * 3.2, top: wl + 160 - 2311, width: 1300, height: 2311, transform: "scaleX(-1)", filter: "brightness(1.15)" }} />
        <div style={{ position: "absolute", left: 0, top: wl, width: W, height: 2400, background: "linear-gradient(#1e4ba3, #1b449a 60%, #1a3f8c)" }} />
        <img src={seaUrl} style={{ position: "absolute", left: -60, top: wl - 15, width: 1200, height: 2133, opacity: 0.3, mixBlendMode: "soft-light" }} />
        <svg width={W} height={60} style={{ position: "absolute", left: 0, top: wl - 30 }} viewBox="0 0 1080 60">
          <path d={`M0 30 ${Array.from({ length: 13 }, (_, i) => `Q ${i * 90 + 45} ${i % 2 ? 40 : 18} ${(i + 1) * 90} 30`).join(" ")}`} fill="none" stroke="#4FA9F0" strokeWidth={14} strokeLinecap="round" />
        </svg>
      </AbsoluteFill>
      {FISH.map((fi, i) => {
        const p = punch ? fi.punch : fi.wide;
        if (!p) return null;
        const t = punch ? pf : f;
        return <Pic key={i} src={fi.src} cx={(p[0] + fi.dx * t) * W} cy={p[1] * H} w={p[2] * W * fishScale} h={p[2] * W * fishScale * 0.625} flip opacity={fi.src === fishBUrl ? 0.75 : 1} />;
      })}
      <Pic src={manUrl} cx={man.cx} cy={man.cy} w={man.h * 0.75} h={man.h} flip rot={0} scale={man.s} />
      {Array.from({ length: nStamps }, (_, i) => {
        const age = f - STAMP_START[i];
        const step = Math.floor(f / 2);
        const [bx, by, bw] = STAMP_BASE[i];
        const jx = (hash(i * 7 + step) - 0.5) * 0.04;
        const jy = (hash(i * 13 + step) - 0.5) * 0.02;
        const rot = (hash(i * 3 + step * 0.5) - 0.5) * 36 - 3;
        const sc = keys(age, [[0, 1.4], [2, 1]], backOut);
        return (
          <div key={i} style={{ position: "absolute", left: (bx + jx) * W, top: (by + jy) * H, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc})`, fontFamily: FONT, fontSize: bw * W * 0.5, color: "#D92B46", opacity: 0.88, textShadow: "0 3px 5px rgba(0,0,0,.4)", letterSpacing: 2 }}>PAIN</div>
        );
      })}
    </AbsoluteFill>
  );
};
