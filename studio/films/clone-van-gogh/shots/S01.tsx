import { AbsoluteFill, useCurrentFrame, Img } from "remotion";
import { FONT, H, W, Pic, backOut, hash, keys, useFonts } from "../lib/s01-03-kit";
import { drift, impactShake } from "../../../../src/physics";
import nightUrl from "../assets/gen/r2-night.png";
import cloudAUrl from "../assets/gen/r2-cloud-a-cut.png";
import cloudBUrl from "../assets/gen/r2-cloud-b-cut.png";
import seaUrl from "../assets/gen/s01-sea.png";
import manUrl from "../assets/gen/s01-vg-sink-cut.png";
import fishAUrl from "../assets/gen/s01-fish-a-cut.png";
import fishBUrl from "../assets/gen/s01-fish-b-cut.png";

// S01 (abs 0-31): drowning. 1a wide (local 0-9), 1b punch-in + PAIN stamps (10-31).
// Measured on the reference (strips f0-31): wide = tiny man on the waterline (y 42 % H); the cut at
// f10 lands ~1.9x closer with the waterline at 33 % H, then the camera slowly pulls back and rolls.
// Clouds are engraved cumulus; PAIN stamps are a mix of one-two big and several small, re-jittered
// every 2nd frame.

const PUNCH = 10;
const FPS = 16;
const WL = H * 0.42; // waterline in wide world coordinates

type Pose = [number, number, number]; // centre x, y (fractions), width (fraction of W)
type Item = { src: string; wide?: Pose; punch?: Pose; dx: number; blur?: number; opacity?: number };

const FISH: Item[] = [
  { src: fishAUrl, wide: [0.59, 0.88, 0.5], punch: [0.4, 0.84, 0.47], dx: 0.007, blur: 1.5 },
  { src: fishAUrl, wide: [0.17, 0.73, 0.12], punch: [0.86, 0.52, 0.1], dx: 0.002 },
  { src: fishAUrl, wide: [0.65, 0.51, 0.04], dx: 0.001 },
  { src: fishAUrl, wide: [0.33, 0.58, 0.05], dx: 0.001 },
  { src: fishAUrl, punch: [0.08, 0.95, 0.3], dx: 0.004, blur: 2 },
  { src: fishBUrl, wide: [0.19, 0.51, 0.12], punch: [0.1, 0.53, 0.13], dx: -0.002, opacity: 0.75 },
  { src: fishBUrl, wide: [0.6, 0.61, 0.11], punch: [0.8, 0.7, 0.22], dx: -0.003, opacity: 0.75 },
];

// Engraved clouds drift left (wide 0.4 % W/f) and sit high; the punch has its own arrangement.
const CLOUDS: Item[] = [
  { src: cloudAUrl, wide: [0.83, 0.06, 0.5], punch: [0.16, 0.1, 0.4], dx: -0.004 },
  { src: cloudAUrl, wide: [0.1, 0.27, 0.34], punch: [0.92, 0.25, 0.3], dx: -0.003 },
  { src: cloudBUrl, wide: [0.8, 0.3, 0.4], punch: [0.8, 0.14, 0.4], dx: -0.004 },
  { src: cloudBUrl, wide: [0.12, 0.17, 0.3], punch: [0.3, 0.02, 0.3], dx: -0.002 },
  { src: cloudBUrl, wide: [0.55, 0.35, 0.3], dx: -0.003 },
];

const STARS = Array.from({ length: 60 }, (_, i) => ({ x: hash(i * 3 + 1), y: hash(i * 5 + 2), r: 3 + hash(i * 7) * 2.5 }));

const STAMP_START = [20, 20, 22, 22, 24, 24, 26, 26];
// x, y, font px: two big, the rest small, as in the reference strip
const STAMP_BASE: [number, number, number][] = [
  [0.24, 0.49, 54], [0.63, 0.4, 62], [0.24, 0.68, 52], [0.58, 0.66, 86],
  [0.49, 0.61, 56], [0.36, 0.55, 50], [0.72, 0.52, 52], [0.42, 0.45, 54],
];

export const S01: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const punch = f >= PUNCH;
  const pf = f - PUNCH;

  // wide: slow drift/push; punch: waterline lands at 33 % H, then eases out (pull back) and rolls
  const s = punch ? keys(pf, [[0, 1.9], [21, 1.45]], (t) => t) : keys(f, [[0, 1], [9, 1.04]]);
  const wlTarget = punch ? H * keys(pf, [[0, 0.33], [21, 0.36]]) : WL;
  const oy = punch ? (wlTarget - WL * s) / (1 - s) : 700;
  const ox = punch ? 380 : 540;
  const roll = 0;
  // the whole picture settles with a tiny impact shake on the cut
  const hit = impactShake(f, FPS, "s01-cut", { at: PUNCH, amp: 6, hz: 6, decay: 7 });

  const t = punch ? pf : f;
  const bob = drift(f, FPS, "s01-man", { amp: 14, hz: 0.55 });
  const man = punch
    ? { cx: W * 0.5 + bob.x, cy: H * keys(pf, [[0, 0.6], [21, 0.605]]) + bob.y, h: H * 0.6, s: keys(pf, [[0, 1], [21, 0.92]]) }
    : { cx: W * 0.5 + f * 1.2 + bob.x * 0.3, cy: H * (0.375 + (f / 9) * 0.02) + bob.y * 0.3, h: H * 0.28, s: 1 };
  const nStamps = STAMP_START.filter((st) => f >= st).length;

  // in the punch the background pulls back faster than the man (parallax): clouds follow the world zoom, fish half of it
  const kz = punch ? s / 1.9 : 1;
  const place = (it: Item, i: number, k: string) => {
    const p = punch ? it.punch : it.wide;
    if (!p) return null;
    const kk = k === "c" ? kz : 1 - (1 - kz) * 0.45;
    const w = p[2] * W * (k === "c" ? 1.5 : 1) * kk;
    const cx = punch ? ox + ((p[0] + it.dx * t) * W - ox) * kk : (p[0] + it.dx * t) * W;
    const cy = punch ? oy + (p[1] * H - oy) * kk : p[1] * H;
    return <Pic key={`${k}${i}`} src={it.src} cx={cx} cy={cy} w={w} h={w * 0.625} flip={k === "f"} opacity={it.opacity ?? 1} style={{ filter: `${k === "c" ? "brightness(1.25) blur(1.2px) " : ""}${it.blur ? `blur(${it.blur}px)` : ""}` || undefined }} />;
  };

  return (
    <AbsoluteFill style={{ background: "#12254A", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${hit.x}px, ${hit.y}px) rotate(${roll}deg) scale(1.06)`, transformOrigin: "50% 50%", filter: "blur(0.9px)" }}>
        {/* world: night paper, stars, waterline, sea */}
        <AbsoluteFill style={{ transformOrigin: `${ox}px ${oy}px`, transform: `scale(${s})` }}>
          <Img src={nightUrl} style={{ position: "absolute", left: 0, top: WL - 1920, width: W, height: 1920, objectFit: "cover", filter: "saturate(.5) brightness(1.5) contrast(1.05)" }} />
          {STARS.map((st, i) => (
            <div key={i} style={{ position: "absolute", left: st.x * W, top: WL - st.y * 800 - 10, width: st.r, height: st.r, borderRadius: "50%", background: "#B4C078", opacity: 0.6 }} />
          ))}
          <div style={{ position: "absolute", left: 0, top: WL, width: W, height: 2600, background: "linear-gradient(#3a5fb0, #34549f 40%, #2b4789)" }} />
          <Img src={seaUrl} style={{ position: "absolute", left: -60, top: WL - 15, width: 1200, height: 2133, opacity: 0.12, mixBlendMode: "soft-light" }} />
          <svg width={W} height={60} style={{ position: "absolute", left: 0, top: WL - 22 }} viewBox="0 0 1080 60">
            <path d={`M0 30 ${Array.from({ length: 13 }, (_, i) => `Q ${i * 90 + 45} ${i % 2 ? 40 : 18} ${(i + 1) * 90} 30`).join(" ")}`} fill="none" stroke="#4FA9F0" strokeWidth={13} strokeLinecap="round" />
          </svg>
        </AbsoluteFill>
        {CLOUDS.map((c, i) => place(c, i, "c"))}
        {FISH.map((fi, i) => place(fi, i, "f"))}
        <Pic src={manUrl} cx={man.cx} cy={man.cy} w={man.h * 0.75} h={man.h} flip rot={bob.rotate} scale={man.s} />
        {Array.from({ length: nStamps }, (_, i) => {
          const age = f - STAMP_START[i];
          const step = Math.floor(f / 2);
          const [bx, by, fs] = STAMP_BASE[i];
          const jx = (hash(i * 7 + step) - 0.5) * 0.03;
          const jy = (hash(i * 13 + step) - 0.5) * 0.025;
          const rot = (hash(i * 3 + step * 0.5) - 0.5) * 24 - 3;
          const sc = keys(age, [[0, 1.25], [2, 1]], backOut);
          return (
            <div key={i} style={{ position: "absolute", left: (bx + jx) * W, top: (by + jy) * H, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc})`, fontFamily: FONT, fontSize: fs, color: "#D92B46", opacity: 0.85, textShadow: "0 3px 5px rgba(0,0,0,.4)", letterSpacing: 2 }}>PAIN</div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
