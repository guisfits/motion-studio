// Air layers (loop f62-149, breakdown 2-4): red biplane + banner, the giant pigeon with its robot
// parts and red reticle, and the blurred foreground trees. Everything reads the step clock; robot
// parts, reticle, banner and the pigeon's eye are original vector drawings made here.
import { AbsoluteFill, Img } from "remotion";
import pigeonUrl from "../assets/gen/G13-pigeon-a-cut.png";
import planeUrl from "../assets/gen/G05-biplane-cut.png";
import treeAUrl from "../assets/gen/G06-tree-a-cut.png";
import treeBUrl from "../assets/gen/G06-tree-b-cut.png";
import treeCUrl from "../assets/gen/G06-tree-c-cut.png";
import { BANNER_FONT, CREAM, easeOut, K, keys, NAVY, Piece, RED, useLoopFrame } from "../lib/kit";

// Pigeon image geometry (px of the cut-out): eye centre, size, and the head scale in ref px per image px.
const PW = 1010;
const PH = 1831;
const EYE_X = 399;
const EYE_Y = 146;

// Eye path and diameter (breakdown 4; reticle centres from f113 on, all ref px).
const EYE_X_KEYS: [number, number][] = [[69, 900], [70, 667], [73, 280], [75, 236], [78, 176], [85, 250], [88, 376], [95, 420], [108, 484], [113, 370], [118, 324], [123, 370], [130, 400], [135, 380], [138, 370], [140, 260], [143, 53], [145, -260]];
const EYE_Y_KEYS: [number, number][] = [[69, 600], [70, 600], [73, 673], [75, 680], [78, 680], [85, 660], [88, 656], [95, 650], [108, 650], [113, 570], [118, 490], [123, 480], [130, 510], [135, 530], [138, 560], [140, 700], [143, 1350], [145, 1800]];
const EYE_D_KEYS: [number, number][] = [[69, 68], [75, 66], [85, 56], [88, 52], [95, 48], [135, 48], [138, 56], [140, 90], [143, 150], [145, 170]];
// Head scale on the full-body pigeon (G13-a, generated: the CC0 photo was cropped at the chest and
// its patched body read as a column). At these scales the body runs past the frame bottom.
// Whip-out f140-145 drops the bird down-left out of frame (breakdown 2, F).
const HEAD_KEYS: [number, number][] = [[69, 0.69], [75, 0.66], [85, 0.63], [88, 0.62], [95, 0.62], [135, 0.62], [138, 0.67], [140, 0.83], [143, 0.89], [145, 0.95]];
const RET_D_KEYS: [number, number][] = [[108, 60], [113, 112], [118, 160], [123, 180], [130, 170], [135, 200], [138, 200], [140, 260], [143, 400], [145, 460]];

const Biplane: React.FC<{ f: number }> = ({ f }) => {
  if (f < 63 || f > 86) return null;
  const x = keys(f, [[63, 667], [65, 513], [68, 377], [70, 310], [75, 220], [78, 170], [84, 20], [86, -100]]);
  const y = keys(f, [[63, 73], [65, 290], [68, 340], [70, 370], [75, 370], [78, 380], [86, 392]]);
  const rot = keys(f, [[63, -48], [65, -40], [68, -8], [70, 0], [86, 0]]);
  return <Piece src={planeUrl} x={x} y={y} w={170} rot={rot} look="red" pre="contrast(1.7) brightness(0.55)" />;
};

// Cloth ribbon following an arch, type clipped left to right as it unspools behind the plane.
const Banner: React.FC<{ f: number }> = ({ f }) => {
  if (f < 68 || f > 98) return null;
  const xl = keys(f, [[68, 600], [70, 510], [75, 357], [88, 113], [93, -120], [98, -360]]);
  const yc = keys(f, [[68, 340], [70, 370], [75, 420], [88, 500], [98, 560]]);
  const rot = keys(f, [[68, -16], [70, -14], [75, 8], [88, 16], [98, 18]]);
  const vis = keys(f, [[68, 50], [70, 140], [73, 260], [75, 340]]);
  const arc = "M12,38 Q170,14 328,36";
  return (
    <div style={{ position: "absolute", left: xl * K, top: (yc - 30) * K, width: 340 * K, height: 60 * K, transformOrigin: "0 50%", transform: `rotate(${rot}deg)`, clipPath: `inset(0 ${(1 - vis / 340) * 100}% 0 0)` }}>
      <svg width={340 * K} height={60 * K} viewBox="0 0 340 60">
        <path id="bn" d={arc} fill="none" />
        <use href="#bn" stroke={NAVY} strokeWidth={47} fill="none" />
        <use href="#bn" stroke={CREAM} strokeWidth={42} fill="none" />
        <text fill="#0E1445" fontFamily={BANNER_FONT} fontSize={35} letterSpacing={0.5}>
          <textPath href="#bn" startOffset="50%" textAnchor="middle" dominantBaseline="central" textLength={300} lengthAdjust="spacingAndGlyphs">
            BIRDS AREN'T REAL
          </textPath>
        </text>
      </svg>
    </div>
  );
};

const Eye: React.FC<{ d: number; glare: boolean }> = ({ d, glare }) => (
  <svg width={d * K} height={d * K} viewBox="-1 -1 2 2" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
    <circle r={0.98} fill={CREAM} stroke="#1F2A6B" strokeWidth={0.07} />
    <circle cx={-0.12} cy={0.02} r={0.5} fill={NAVY} />
    <circle cx={0.04} cy={-0.18} r={0.14} fill={CREAM} />
    {glare ? <ellipse cx={0} cy={-0.05} rx={1.1} ry={0.9} fill="#F4F2DC" /> : null}
  </svg>
);

const Pigeon: React.FC<{ f: number; ex: number; ey: number; ed: number }> = ({ f, ex, ey, ed }) => {
  const s = keys(f, HEAD_KEYS);
  const left = ex - EYE_X * s;
  const top = ey - EYE_Y * s;
  const bottom = top + PH * s;
  const ext = Math.max(0, 1500 - bottom);
  const glare = f >= 100 && f <= 105;
  return (
    <>
      <AbsoluteFill style={{ filter: "brightness(1.3) contrast(0.95) url(#tri)" }}>
        <Img src={pigeonUrl} style={{ position: "absolute", left: left * K, top: top * K, width: PW * s * K }} />
        {ext > 0 ? (
          <div style={{ position: "absolute", left: left * K, top: (bottom - 2) * K, width: PW * s * K, height: (ext + 2) * K, overflow: "hidden", clipPath: "polygon(4% 0, 96% 0, 78% 100%, 22% 100%)" }}>
            <Img
              src={pigeonUrl}
              style={{ position: "absolute", left: 0, top: 0, width: PW * s * K, transformOrigin: `0 ${(PH - 30) * s * K}px`, transform: `translateY(${-(PH - 30) * s * K}px) scaleY(${(ext + 30 * s) / (30 * s)})`, filter: `blur(${5 * K}px) brightness(0.8)` }}
            />
          </div>
        ) : null}
      </AbsoluteFill>
      {f < 108 ? (
        <div style={{ position: "absolute", left: ex * K, top: ey * K }}>
          <Eye d={ed} glare={glare} />
        </div>
      ) : null}
    </>
  );
};

const Reticle: React.FC<{ f: number; x: number; y: number }> = ({ f, x, y }) => {
  if (f < 108 || f > 145) return null;
  const d = keys(f, RET_D_KEYS);
  const rot = f * 7;
  const rings = keys(f, [[110, 0], [113, 1]]);
  const arc = (r: number, dash: string, a: number, w = 0.022) => (
    <circle r={r} fill="none" stroke={RED} strokeWidth={w} strokeDasharray={dash} transform={`rotate(${a})`} opacity={rings} />
  );
  return (
    <svg width={d * K} height={d * K} viewBox="-1 -1 2 2" style={{ position: "absolute", left: x * K, top: y * K, transform: "translate(-50%,-50%)", overflow: "visible" }}>
      {arc(0.97, "1.4 0.5 0.9 0.7", rot)}
      {arc(0.84, "0.9 0.4 1.6 0.5", -rot * 1.3)}
      {arc(0.71, "2.0 0.6 0.7 0.5", rot * 0.8)}
      <circle r={0.52} fill={RED} />
      <circle r={0.34} fill="none" stroke={NAVY} strokeWidth={0.09} opacity={rings} />
      <circle r={0.22} fill={rings > 0.5 ? "#2A3F8F" : RED} />
      <circle r={0.09} fill={NAVY} opacity={rings} />
      <circle cx={-0.06} cy={-0.07} r={0.04} fill={CREAM} opacity={rings} />
    </svg>
  );
};

const Chest: React.FC<{ f: number; dx: number; dy: number }> = ({ f, dx, dy }) => {
  if (f < 113 || f > 145) return null;
  const y = keys(f, [[113, 1010], [118, 880]], easeOut) + dy;
  return (
    <svg width={200 * K} height={130 * K} viewBox="0 0 144 154" preserveAspectRatio="none" style={{ position: "absolute", left: (370 + dx) * K, top: y * K, transform: "translate(-50%,-50%)" }}>
      <rect x={4} y={6} width={136} height={142} rx={16} fill="#8DA2BF" stroke={NAVY} strokeWidth={4} />
      <path d="M8 30 L50 70 M136 30 L94 70" stroke="#E9B895" strokeWidth={13} strokeLinecap="round" />
      <path d="M12 130 L48 96 M132 130 L96 96" stroke="#E9B895" strokeWidth={13} strokeLinecap="round" />
      <rect x={44} y={20} width={56} height={114} rx={12} fill="#2B3E78" stroke={NAVY} strokeWidth={3} />
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse key={i} cx={72} cy={32 + i * 15} rx={24} ry={6.5} fill={CREAM} stroke={NAVY} strokeWidth={2.5} />
      ))}
    </svg>
  );
};

const Camera: React.FC<{ f: number; ex: number; ey: number }> = ({ f, ex, ey }) => {
  if (f < 120 || f > 145) return null;
  const sc = keys(f, [[120, 0.4], [123, 1]], easeOut);
  return (
    <svg width={110 * K} height={70 * K} viewBox="0 0 110 70" style={{ position: "absolute", left: (ex - 135) * K, top: (ey + 62) * K, transform: `translate(-50%,-50%) rotate(-16deg) scale(${sc})` }}>
      <rect x={34} y={6} width={72} height={46} rx={7} fill="#E9C7A6" stroke={NAVY} strokeWidth={3} />
      <rect x={52} y={50} width={14} height={16} fill={NAVY} />
      <circle cx={26} cy={29} r={24} fill={NAVY} />
      <circle cx={26} cy={29} r={17} fill={RED} />
      <circle cx={26} cy={29} r={7} fill="#3A0A10" />
      <circle cx={21} cy={23} r={3} fill={CREAM} />
    </svg>
  );
};

const Trees: React.FC<{ f: number }> = ({ f }) => {
  if (f < 75 || f > 143) return null;
  const pre = "brightness(0.55)";
  // Left mass (tree a): right edge x, centre y; enters from the top-left, drifts out, leaves fast.
  const lR = keys(f, [[75, -30], [78, 90], [88, 194], [100, 235], [135, 255], [140, -140]]);
  const lY = keys(f, [[75, 100], [88, 300], [135, 320]]);
  // Bush bottom-left (tree c) from f85.
  const bUp = keys(f, [[85, 170], [95, 0]], easeOut);
  const bOut = keys(f, [[135, 0], [140, 260]]);
  // Right mass (tree b, mirrored): left edge x.
  const rL = keys(f, [[75, 760], [78, 435], [88, 572], [100, 585], [120, 608], [135, 640], [140, 700], [143, 800]]);
  return (
    <>
      {f >= 77 ? <Piece src={treeBUrl} x={rL + 190} y={730} w={380} blur={9} pre={pre} style={{ transform: "translate(-50%,-50%) scaleX(-1)" }} /> : null}
      <Piece src={treeAUrl} x={lR - 210} y={lY} w={420} blur={12} pre={pre} />
      {f >= 85 ? <Piece src={treeCUrl} x={55 - bOut} y={1215 + bUp + bOut} w={400} blur={13} pre={pre} /> : null}
    </>
  );
};

export const Air: React.FC = () => {
  const f = useLoopFrame();
  if (f < 62) return null;
  const ex = keys(f, EYE_X_KEYS);
  const ey = keys(f, EYE_Y_KEYS);
  const ed = keys(f, EYE_D_KEYS);
  const follow = f > 138 ? { dx: ex - 370, dy: ey - 560 } : { dx: 0, dy: 0 };
  return (
    <AbsoluteFill>
      <Biplane f={f} />
      <Banner f={f} />
      {f >= 69 && f <= 145 ? <Pigeon f={f} ex={ex} ey={ey} ed={ed} /> : null}
      <Chest f={f} {...follow} />
      <Camera f={f} ex={ex} ey={ey} />
      <Reticle f={f} x={ex * K / K} y={ey} />
      <Trees f={f} />
    </AbsoluteFill>
  );
};
