import { AbsoluteFill, useCurrentFrame, Img } from "remotion";
import { FONT, H, W, easeInOut, easeOut, hash, keys, useFonts } from "../lib/s01-03-kit";
import { drift, flutter, throwIn } from "../../../../src/physics";
import { GiltFrame } from "./S02";
import bustUrl from "../assets/gen/r2-vg-prof71-cut.png";
import branchUrl from "../assets/gen/r2-branch-cut.png";
import leafUrl from "../assets/gen/s03-leaf-cut.png";
import leafBUrl from "../assets/gen/s03-leaf-b-cut.png";
import starryUrl from "../assets/pd/starry-night.jpg";

// S03 (abs 52-104): torn-paper holes open over S02, blossom profile + falling leaves (3a), punch to the
// framed Starry Night where the head was (3b, local 19). Local f = reference frame - 53.

const PUNCH = 19; // reference f72: the frame pops in, then the camera pans and pushes in
const HOLES: [number, number, number][] = [[0.14, 0.18, 0.7], [0.5, 0.3, 1], [0.8, 0.7, 1], [0.6, 0.55, 0.9], [0.45, 0.8, 0.8]];
const ORANGE = "#E8A33A";

/** Torn-edge alpha mask (data-URI SVG, circles + turbulence displacement) for the growing holes. */
function tearMask(f: number, grow: number): string {
  const circles = HOLES.map(([x, y, k]) => {
    const r = (60 + 52 * Math.pow(Math.max(f, 0), 1.6) * k) + grow;
    return `<circle cx="${x * W}" cy="${y * H}" r="${r.toFixed(1)}" fill="#fff"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="r" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="110" xChannelSelector="R" yChannelSelector="G"/></filter><g filter="url(#r)">${circles}</g></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}


const FPS = 16;

type Leaf = { src: string; start: number; x: number; size: number; blur: number; fall: number; sway: number; swayHz: number; spin: number; hue: number; shade: number; back: boolean };

// Reference leaves are huge (big 38-50 % W, blurred by depth), many, and fall fast with sway, spin and a 3D tumble.
const LEAVES: Leaf[] = Array.from({ length: 50 }, (_, i) => {
  const cls = i % 2 === 0 ? 0 : i % 4 === 1 ? 1 : 2; // 0 big & blurred, 1 medium, 2 small & far
  const r = (k: number) => hash(i * 17 + k);
  const size = cls === 0 ? 0.36 + r(1) * 0.16 : cls === 1 ? 0.18 + r(1) * 0.1 : 0.07 + r(1) * 0.07;
  return {
    src: r(2) > 0.45 ? leafUrl : leafBUrl,
    start: 3 + 52 * Math.pow(i / 50, 0.85) + r(3) * 1.5, // the shower thickens: 1-2 leaves at f3, dense by f35
    x: -0.05 + r(4) * 1.1,
    size,
    blur: cls === 0 ? 7 + r(5) * 3 : cls === 1 ? 2 + r(5) * 2 : 0.6,
    fall: cls === 0 ? 600 + r(6) * 180 : cls === 1 ? 400 + r(6) * 120 : 250 + r(6) * 80,
    sway: 50 + r(7) * 90,
    swayHz: 0.45 + r(8) * 0.4,
    spin: 70 + r(9) * 140,
    hue: (r(10) - 0.5) * 24,
    shade: cls === 2 ? 0.55 + r(11) * 0.2 : 0.8 + r(11) * 0.3,
    back: cls === 2,
  };
});

const LeafEl: React.FC<{ l: Leaf; i: number; f: number }> = ({ l, i, f }) => {
  const t = f - l.start;
  if (t < 0) return null;
  const w = l.size * W;
  const o = flutter(t, FPS, `s03-leaf-${i}`, { x: l.x * W, y: -w * 0.7, fall: l.fall, sway: l.sway, swayHz: l.swayHz, spin: l.spin });
  if (o.y - w * 0.7 > H) return null;
  const tumble = 62 * Math.sin((o.flip * Math.PI) / 180);
  return (
    <div style={{ position: "absolute", left: o.x - w / 2, top: o.y - w / 2, width: w, height: w, transform: `perspective(${w * 3}px) rotateZ(${o.rotate}deg) rotateY(${tumble}deg)`, filter: `blur(${l.blur}px) hue-rotate(${l.hue}deg) brightness(${l.shade})` }}>
      <Img src={l.src} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

// Camera (reference: no pan, total zoom ~31 %, peak 2.4 %/f): a gentle push, an eased push at the frame's pop, then slow.
// Only the BUST is thrown on the pop (reference f71-76: the coat drops ~12 % H and the head slides right behind the frame).
function camera(f: number) {
  const pre = keys(f, [[0, 1], [PUNCH - 1, 1.07]], easeOut);
  const q = keys(f, [[PUNCH, 0], [PUNCH + 11, 1]], easeInOut);
  const slow = keys(f, [[PUNCH + 11, 0], [52, 1]]);
  return pre + q * 0.13 + slow * 0.11;
}

// Blossom clusters on the coat (front) and bare branches behind the head (back).
const BACK_BRANCHES: { x: number; y: number; w: number; rot: number; blur: number; shade: number; flip?: boolean }[] = [
  { x: -500, y: -100, w: 1900, rot: 158, blur: 3, shade: 0.6 },
  { x: 250, y: 330, w: 1800, rot: -16, blur: 1.5, shade: 0.75 },
  { x: -420, y: 760, w: 1700, rot: 74, blur: 2, shade: 0.7, flip: true },
];
const FRONT_BRANCHES: { x: number; y: number; w: number; rot: number }[] = [
  { x: 20, y: 1130, w: 1000, rot: 25 },
  { x: 380, y: 1040, w: 1000, rot: -62 },
  { x: 150, y: 1500, w: 1100, rot: 112 },
  { x: 520, y: 1500, w: 1100, rot: -18 },
];

export const S03: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const sc = camera(f);
  const world: React.CSSProperties = { transformOrigin: `${W / 2}px ${H / 2}px`, transform: `scale(${sc})` };
  // the bust drops and slides so the head ends behind the frame (hair top at 27 % H, centre at 0.55 W)
  const toss = throwIn(f - PUNCH - 1, FPS, { from: { x: 0, y: 0, rotate: 0, scale: 1 }, to: { x: 1, y: 0, rotate: 0, scale: 1 }, frames: 5, damping: 0.5 }).x;
  const bx = toss * W * (0.25 + 0.17 * (sc - 1.2));
  const by = toss * (320 + (sc - 1.2) * 640);
  const bustWorld: React.CSSProperties = { transformOrigin: `${W / 2}px ${H / 2}px`, transform: `translate(${bx}px, ${by}px) scale(${sc})` };
  const tearing = f < 9;
  const headless = f > PUNCH;

  // the bust is thrown up into the hole (reference f55-58) and settles with a wobble
  const rise = throwIn(f - 1, FPS, { from: { x: 0, y: 900, rotate: -5, scale: 1 }, to: { x: 0, y: 0, rotate: 0, scale: 1 }, frames: 4, damping: 0.5 });
  const sway = drift(f, FPS, "s03-body", { amp: 3, hz: 0.5 });

  const scene = (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #F2F0EC 0%, #E4E1DB 60%, #B8B4AC 100%)" }}>
      <AbsoluteFill style={world}>
        {BACK_BRANCHES.map((b, i) => (
          <Img key={i} src={branchUrl} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, transform: `rotate(${b.rot + sway.rotate}deg) scaleX(${b.flip ? -1 : 1})`, filter: `blur(${b.blur}px) brightness(${b.shade * 0.65}) saturate(.6)` }} />
        ))}
      </AbsoluteFill>
      {LEAVES.map((l, i) => l.back && <LeafEl key={i} l={l} i={i} f={f} />)}
    </AbsoluteFill>
  );

  const man = (
    <AbsoluteFill style={bustWorld}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${rise.x}px, ${rise.y}px) rotate(${rise.rotate}deg)`, transformOrigin: "50% 100%" }}>
        {/* from the frame's pop the face is gone: only the hair cap and the coat remain, the frame is the head */}
        {headless ? (
          <>
            <Img src={bustUrl} style={{ position: "absolute", left: -84, top: 245, width: 920, height: 1560, clipPath: "inset(0 0 79% 0)", WebkitMaskImage: "linear-gradient(to bottom, #000 12%, transparent 21%)", maskImage: "linear-gradient(to bottom, #000 12%, transparent 21%)" }} />
            <Img src={bustUrl} style={{ position: "absolute", left: -84, top: 245, width: 920, height: 1560, clipPath: "inset(46% 0 0 0)", WebkitMaskImage: "linear-gradient(to bottom, transparent 46%, #000 56%)", maskImage: "linear-gradient(to bottom, transparent 46%, #000 56%)" }} />
          </>
        ) : (
          <Img src={bustUrl} style={{ position: "absolute", left: -84, top: 245, width: 920, height: 1560 }} />
        )}
        {/* the bust is cropped at the picture's bottom: its lower brush strokes, mirrored, carry the coat past the frame */}
        <Img src={bustUrl} style={{ position: "absolute", left: -84, top: 245 + 1560, width: 920, height: 1560, transform: "scaleY(-1)", clipPath: "inset(0 0 62% 0)" }} />
        {FRONT_BRANCHES.map((b, i) => (
          <Img key={i} src={branchUrl} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, transform: `rotate(${b.rot + (i % 2 ? -sway.rotate : sway.rotate)}deg)`, filter: "saturate(1.1) contrast(1.05)" }} />
        ))}
      </div>
    </AbsoluteFill>
  );

  // The framed painting is pinned to the screen (reference f71-76): thrown in over the face, then drifts.
  const fr = throwIn(f - PUNCH, FPS, {
    from: { x: 0.5 * W, y: 0.62 * H, rotate: -9, scale: 1.3 },
    to: { x: 0.52 * W, y: 0.485 * H, rotate: 1.5, scale: 1 },
    frames: 4,
    arc: 40,
    damping: 0.5,
  });
  const fd = drift(f, FPS, "s03-frame", { amp: 5, hz: 0.45 });
  const frameW = keys(f, [[PUNCH, 0.72], [PUNCH + 5, 0.88], [52, 1.05]]) * W;

  // text rides the screen; TURNED IT sits behind the frame once it lands
  const text = (
    <div style={{ position: "absolute", left: W / 2, top: 0.705 * H, transform: "translate(-50%,-50%)", textAlign: "center", fontFamily: FONT, fontSize: 108, lineHeight: "80px", color: ORANGE, textShadow: "0 4px 0 #5a2d12", whiteSpace: "nowrap" }}>
      {f >= 1 && <div>TURNED IT</div>}
      {f >= 2 && <div>INTO SOME</div>}
    </div>
  );

  const ever = f >= 33 && (
    <div style={{ position: "absolute", left: 0.5 * W, top: 0.5 * H, transform: "translate(-50%,-50%)", fontFamily: FONT, fontSize: 160, whiteSpace: "nowrap", textShadow: "0 4px 0 rgba(0,0,0,.45)" }}>
      <span style={{ color: "#fff" }}>EVER</span>{f >= 35 && <span style={{ color: "#D92B2B" }}> CREATED</span>}
    </div>
  );

  return (
    <AbsoluteFill>
      {tearing ? (
        <>
          <AbsoluteFill style={{ background: "#EDE8DE", WebkitMaskImage: tearMask(f, 26), maskImage: tearMask(f, 26) }} />
          <AbsoluteFill style={{ WebkitMaskImage: tearMask(f, 0), maskImage: tearMask(f, 0) }}>{scene}</AbsoluteFill>
        </>
      ) : scene}
      {man}
      {text}
      {f >= PUNCH && (
        <GiltFrame kind="rect" painting={starryUrl} cx={fr.x + fd.x} cy={fr.y + fd.y} w={frameW} rot={fr.rotate + fd.rotate} scale={fr.scale} />
      )}
      {ever}
      {LEAVES.map((l, i) => !l.back && <LeafEl key={i} l={l} i={i} f={f} />)}
    </AbsoluteFill>
  );
};
