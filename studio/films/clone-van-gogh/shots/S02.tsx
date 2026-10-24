import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT, H, W, backOut, easeOut, keys, useFonts } from "../lib/s01-03-kit";
import holes from "../assets/s01-03/holes.json";
import wallUrl from "../assets/gen/s02-wall.png";
import ovalUrl from "../assets/s01-03/s02-frame-oval-frame.png";
import ovalMask from "../assets/s01-03/s02-frame-oval-mask.png";
import rectUrl from "../assets/s01-03/s02-frame-rect-frame.png";
import rectMask from "../assets/s01-03/s02-frame-rect-mask.png";
import heartUrl from "../assets/s01-03/s02-frame-heart-frame.png";
import heartMask from "../assets/s01-03/s02-frame-heart-mask.png";
import roundUrl from "../assets/s01-03/s02-frame-round-frame.png";
import roundMask from "../assets/s01-03/s02-frame-round-mask.png";
import selfUrl from "../assets/pd/self-portrait.jpg";
import wheatUrl from "../assets/pd/wheatfield.jpg";
import cafeUrl from "../assets/pd/cafe-terrace.jpg";
import rhoneUrl from "../assets/pd/rhone.jpg";
import remyUrl from "../assets/pd/saint-remy.jpg";
import irisUrl from "../assets/pd/irises.jpg";

// S02 (abs 32-59): portrait wall; six gilt frames fly in and settle; "&" + SOMEHOW typed in.
// Positions/sizes read off the reference sheet (frames are larger than the breakdown's first guess).

export const KINDS = {
  oval: { frame: ovalUrl, mask: ovalMask, hole: holes["s02-frame-oval"] },
  rect: { frame: rectUrl, mask: rectMask, hole: holes["s02-frame-rect"] },
  heart: { frame: heartUrl, mask: heartMask, hole: holes["s02-frame-heart"] },
  round: { frame: roundUrl, mask: roundMask, hole: holes["s02-frame-round"] },
};

/** A gilt frame with a painting behind its (transparent) hole, centred on (cx, cy), width w px. */
export const GiltFrame: React.FC<{ kind: keyof typeof KINDS; painting: string; cx: number; cy: number; w: number; rot?: number; scale?: number; opacity?: number; shadow?: boolean }> = ({
  kind, painting, cx, cy, w, rot = 0, scale = 1, opacity = 1, shadow = true,
}) => {
  const k = KINDS[kind];
  const [x0, y0, x1, y1, aspect] = k.hole;
  const h = w / aspect;
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h, transform: `rotate(${rot}deg) scale(${scale})`, opacity, filter: shadow ? "drop-shadow(0 14px 18px rgba(0,0,0,.55))" : undefined }}>
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${k.mask})`, WebkitMaskSize: "100% 100%", maskImage: `url(${k.mask})`, maskSize: "100% 100%" }}>
        <img src={painting} style={{ position: "absolute", left: `${x0 * 100}%`, top: `${y0 * 100}%`, width: `${(x1 - x0) * 100}%`, height: `${(y1 - y0) * 100}%`, objectFit: "cover" }} />
      </div>
      <img src={k.frame} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
};

type Item = {
  kind: keyof typeof KINDS; painting: string; w: number; rest: [number, number]; restRot: number;
  from: [number, number]; fromRot: number; fromScale?: number; start: number; end: number; sway: number;
};

const ITEMS: Item[] = [
  { kind: "oval", painting: selfUrl, w: 0.43, rest: [0.5, 0.46], restRot: 0, from: [0.62, 0.48], fromRot: -8, fromScale: 1.15, start: 0, end: 4, sway: 0 },
  { kind: "rect", painting: cafeUrl, w: 0.35, rest: [0.76, 0.15], restRot: 2, from: [1.0, -0.02], fromRot: 25, start: 0, end: 5, sway: 1 },
  { kind: "heart", painting: irisUrl, w: 0.36, rest: [0.79, 0.75], restRot: 3, from: [1.12, 0.62], fromRot: -20, start: 0, end: 6, sway: 2 },
  { kind: "oval", painting: wheatUrl, w: 0.27, rest: [0.2, 0.17], restRot: -2, from: [-0.15, -0.02], fromRot: -30, start: 1, end: 6, sway: 3 },
  { kind: "round", painting: rhoneUrl, w: 0.2, rest: [0.06, 0.42], restRot: 0, from: [-0.14, 0.42], fromRot: -15, start: 1, end: 5, sway: 4 },
  { kind: "rect", painting: remyUrl, w: 0.43, rest: [0.28, 0.79], restRot: -4, from: [0.28, 1.2], fromRot: -25, start: 2, end: 7, sway: 5 },
];

export const SOMEHOW_FONT = 128;

export const S02: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const cam = keys(f, [[0, 1], [20, 1.05], [27, 1.07]]);
  const word = "SOMEHOW";
  return (
    <AbsoluteFill style={{ background: "#2b1a10", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${cam})`, transformOrigin: "50% 45%" }}>
        <img src={wallUrl} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, rgba(255,230,190,${keys(f, [[0, 0.22], [5, 0]])}) 0%, transparent 55%)` }} />
        {ITEMS.map((it, i) => {
          const t = keys(f, [[it.start, 0], [it.end, 1]]);
          const e = t < 1 ? backOut(t) : 1;
          const p = (a: number, b: number) => a + (b - a) * e;
          const sway = t >= 1 ? Math.sin((f / 16) * Math.PI * 2 + it.sway) * 0.5 : 0;
          return (
            <GiltFrame key={i} kind={it.kind} painting={it.painting} w={it.w * W}
              cx={p(it.from[0], it.rest[0]) * W} cy={p(it.from[1], it.rest[1]) * H}
              rot={p(it.fromRot, it.restRot) + sway} scale={p(it.fromScale ?? 1, 1)} />
          );
        })}
      </AbsoluteFill>
      {f >= 1 && (
        <div style={{ position: "absolute", left: 0.14 * W, top: 0.595 * H, transform: "translate(-50%,-50%)", fontFamily: FONT, fontSize: 56, color: "#fff", textShadow: "0 3px 0 rgba(0,0,0,.6)", opacity: keys(f, [[1, 0], [2, 1]]) }}>&amp;</div>
      )}
      <div style={{ position: "absolute", left: 0.52 * W, top: 0.585 * H, transform: "translate(-50%,-50%)", fontFamily: FONT, fontSize: SOMEHOW_FONT, letterSpacing: 4, color: "#fff", textShadow: "0 4px 0 rgba(0,0,0,.6)", whiteSpace: "nowrap", display: "flex" }}>
        {word.split("").map((ch, k) => {
          const start = 2 + k * 1.5;
          if (f < start) return <span key={k} style={{ visibility: "hidden" }}>{ch}</span>;
          const sc = keys(f - start, [[0, 1.3], [2, 1]], easeOut);
          return <span key={k} style={{ display: "inline-block", transform: `scale(${sc})` }}>{ch}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};
