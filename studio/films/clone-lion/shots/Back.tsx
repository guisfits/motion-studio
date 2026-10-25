// The back plane (breakdown 3-5): ghost tree, flock, the black lion with its violet eyes and the
// yellow marker, the paper strip with its wash; plus the red type that rides the same plane. The
// plane is laid out in the f200 composition and moved by one camera table (head-template centre,
// scale, roll) measured on the lion.
import { AbsoluteFill } from "remotion";
import { useCurrentFrame } from "remotion";
import ram from "../assets/gen/G03-ram-horned-white-cut.png";
import ewe1 from "../assets/gen/G01-ewe-white-a-cut.png";
import ewe2 from "../assets/gen/G02-ewe-white-b-cut.png";
import ewe6 from "../assets/gen/G06-ewe-white-c-cut.png";
import lionUrl from "../assets/gen/G10-lion-dark-mane-a-cut.png";
import stripUrl from "../assets/gen/T01-paper-strip.png";
import { Blur, BRUSH, K, keys, lin, Piece, Plane, RED, VIOLET, Yellow } from "../lib/kit";

export const ANCHOR = { x: 595, y: 497 };

/** Lion head centre on screen (ref px), plane scale and CCW roll, per frame (breakdown 5). */
export const backCam = (f: number) => ({
  px: keys(f, [[0, 414], [10, 420], [20, 438], [30, 470], [40, 510], [45, 532], [60, 545], [75, 550], [90, 556], [100, 560], [110, 564], [120, 568], [140, 578], [160, 586], [180, 593], [200, 595], [220, 593], [240, 590]]),
  py: keys(f, [[0, 364], [10, 360], [20, 342], [30, 321], [40, 316], [45, 318], [60, 332], [75, 328], [85, 331], [90, 340], [100, 355], [110, 377], [120, 401], [140, 455], [160, 493], [170, 500], [200, 498], [220, 493], [240, 496]]),
  s: keys(f, [[0, 0.78], [10, 0.78], [20, 0.8], [30, 0.83], [40, 0.85], [60, 0.88], [90, 0.9], [100, 0.9], [110, 0.93], [120, 0.93], [140, 0.95], [160, 0.98], [200, 1.0], [240, 1.045]]),
  rot: keys(f, [[0, 25], [10, 24], [15, 20], [20, 15], [27, 10], [37, 5], [45, 0]]),
});

export const BackPlane: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const c = backCam(f);
  return (
    <Plane px={c.px} py={c.py} s={c.s} rot={c.rot} ax={ANCHOR.x} ay={ANCHOR.y}>
      {children}
    </Plane>
  );
};

// Lion cut-out in the f200 layout: tail tip at x 30, head centre on the anchor.
export const LION_URL = lionUrl;
const LION = { x: 360, y: 605, w: 648, h: 470 };
export const LION_BOX = LION;
export const MANE = "linear-gradient(to right, transparent 72%, #000 77%)";
const BARS = [250, 300, 350, 400, 450];

/** Pale conifer ghost, ~10 % contrast, f200 bbox x 590-716, y 195-419 (drawn in code). */
const Tree: React.FC = () => (
  <svg width={126 * K} height={224 * K} viewBox="0 0 126 224" style={{ position: "absolute", left: 590 * K, top: 195 * K, filter: `blur(${5 * K}px)` }}>
    <g fill="#E6E6E6">
      <polygon points="63,0 92,56 76,56 108,112 90,112 120,170 6,170 36,112 18,112 50,56 34,56" />
      <rect x="57" y="168" width="12" height="56" />
    </g>
  </svg>
);

export const Back: React.FC = () => {
  const f = useCurrentFrame();
  const sigma = lin(f, [[0, 4.5], [40, 4.5], [50, 3], [55, 2], [60, 0]]);
  const flockSigma = lin(f, [[0, 4], [60, 3.5], [85, 1.2]]);
  const stripBlur = lin(f, [[48, 5], [60, 5], [64, 0]]);
  const stripA = lin(f, [[44, 0], [48, 1]]);
  // The reference wash is faint at f45-80 and gone by ~f100 (sheet m1, f120 has none).
  const wash = lin(f, [[44, 0], [48, 1], [80, 0.6], [100, 0]]);
  const bars = f < 52;
  const k = lin(f, [[18, 0], [44, 1]]);
  const barA = lin(f, [[0, 1], [40, 1], [50, 0]]);
  const mane = lin(f, [[44, 0], [50, 1], [66, 1], [88, 0]]);
  const paleLeft = lin(f, [[84, 0], [96, 0.9], [124, 0.9], [152, 0]]);
  return (
    <BackPlane>
      <Tree />
      <AbsoluteFill style={{ opacity: wash }}>
        {[[170, 120, 60, 300], [270, 80, 90, 320], [380, 120, 50, 280], [470, 70, 80, 320]].map(([x, y, w, h], i) => (
          <div key={i} style={{ position: "absolute", left: x * K, top: y * K, width: w * K, height: h * K, background: "#FBEFA0", opacity: 0.25, transform: "skewX(-14deg)", filter: `blur(${9 * K}px)` }} />
        ))}
      </AbsoluteFill>
      <Blur sigma={stripBlur} opacity={stripA}>
        <Piece src={stripUrl} x={353} y={382} w={470} h={108} look="none" pre="saturate(0.55)" />
        {[361, 398].map((y) => (
          <div key={y} style={{ position: "absolute", left: 124 * K, top: y * K, width: 458 * K, height: 1.3 * K, background: "#3b3a38", opacity: 0.55 }} />
        ))}
      </Blur>
      <Blur sigma={flockSigma}>
        <Piece src={ewe6} x={84} y={590} w={170} h={205} look="ghost" />
        <Piece src={ewe1} x={262} y={585} w={105} h={196} look="ghost" />
        <Piece src={ewe2} x={690} y={585} w={140} h={222} look="ghost" />
        <Piece src={ewe1} x={645} y={580} w={100} h={190} look="ghost" />
        <Piece src={ram} x={420} y={592} w={150} h={269} look="ghost" />
        <Yellow src={ewe6} x={84} y={590} w={170} h={205} opacity={paleLeft} />
      </Blur>
      <Blur sigma={sigma}>
        <Piece src={lionUrl} x={LION.x} y={LION.y} w={LION.w} h={LION.h} look="lion" pre="blur(0.8px)" />
        <Yellow src={lionUrl} x={LION.x} y={LION.y} w={LION.w} h={LION.h} opacity={mane} mask={MANE} />
        {[-12, 40].map((dx, i) => (
          <div key={i} style={{ position: "absolute", left: (ANCHOR.x + dx - 6) * K, top: (ANCHOR.y - 11 - 5) * K, width: 12 * K, height: 10 * K, borderRadius: "50%", background: "radial-gradient(#C6BFEF 0%, #5D4DAD 55%, rgba(93,77,173,0) 100%)", boxShadow: `0 0 ${6 * K}px ${2 * K}px ${VIOLET}` }} />
        ))}
        {bars &&
          BARS.map((x, i) => {
            const cx = x + (520 + i * 30 - x) * k;
            const cy = 610 + (470 - 610) * k;
            const h = 125 + (50 - 125) * k;
            return <div key={x} style={{ position: "absolute", left: cx * K, top: cy * K, width: 17 * K, height: h * K, background: "#EACC49", opacity: barA * 0.92, transform: "translate(-50%,-50%) rotate(-6deg)" }} />;
          })}
        {bars && (
          <svg width={720 * K} height={1000 * K} viewBox="0 0 720 1000" style={{ position: "absolute", left: 0, top: 0, opacity: barA * lin(f, [[0, 1], [25, 1], [40, 0]]) }}>
            <g fill="none" stroke="#EACC49" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="215,700 250,830 440,790" />
              <polyline points="650,590 700,640 650,690 700,740" />
            </g>
          </svg>
        )}
      </Blur>
    </BackPlane>
  );
};

// Title schedule: right edge of the red ink on screen (ref px), breakdown 4/7.
const X1: [number, number][] = [[60, 150], [66, 186], [68, 199], [80, 209], [86, 223], [89, 257], [98, 285], [104, 313], [110, 367], [119, 395], [125, 433], [128, 473], [134, 501], [143, 535], [149, 561], [152, 569], [185, 578]];

const Ink: React.FC<{ title: boolean; edge: number; style?: React.CSSProperties }> = ({ title, edge, style }) => (
  <svg
    width={440 * K}
    height={100 * K}
    viewBox="0 0 440 100"
    style={{
      position: "absolute",
      left: 150 * K,
      top: 335 * K,
      WebkitMaskImage: title ? `linear-gradient(to right, #000 ${edge * K - 10}px, transparent ${edge * K}px)` : undefined,
      ...style,
    }}
  >
    <g fill={RED} stroke={RED} strokeWidth="0.3" fontFamily={BRUSH}>
      {title ? (
        <text x="10" y="73" fontSize="50" textLength="420" lengthAdjust="spacingAndGlyphs">Be A Lion Among Sheep</text>
      ) : (
        <text x="215" y="26" fontSize="21" textAnchor="middle" textLength="93" lengthAdjust="spacingAndGlyphs" strokeWidth="0.4">Note To Self</text>
      )}
    </g>
  </svg>
);

/** The red type: "Note To Self" rides the strip, the title writes on along the measured right edge. */
export const Type: React.FC = () => {
  const f = useCurrentFrame();
  const c = backCam(f);
  const x1 = lin(f, X1);
  // Right edge of the ink in the plane's own layout, then in the mask's local px (box starts at 150).
  const edge = 595 + (x1 - c.px) / c.s - 150 + 14;
  const noteBlur = lin(f, [[48, 5], [60, 5], [64, 0]]);
  const noteA = lin(f, [[44, 0], [48, 0.5], [60, 1]]);
  const ghostNote = f >= 66 && f <= 74;
  const smear = f >= 136 && f <= 142 ? (f >= 139 && f <= 141 ? 20 : 9) : 0;
  const titleOn = f >= 66;
  return (
    <BackPlane>
      <Blur sigma={noteBlur} opacity={noteA}>
        <Ink title={false} edge={0} />
        {ghostNote && <Ink title={false} edge={0} style={{ transform: `translate(${4 * K}px, ${2 * K}px)`, opacity: 0.55 }} />}
      </Blur>
      {titleOn && <Ink title edge={Math.max(0, edge)} />}
      {ghostNote && titleOn && <Ink title edge={Math.max(0, edge)} style={{ transform: `translate(${-4 * K}px, ${-2 * K}px)`, opacity: 0.4 }} />}
      {smear > 0 && (
        <>
          <Ink title edge={440} style={{ transform: `translate(${smear * K}px, 0)`, opacity: 0.35, filter: `blur(${3 * K}px)` }} />
          <Ink title edge={440} style={{ transform: `translate(${-smear * 0.6 * K}px, ${2 * K}px)`, opacity: 0.3 }} />
          <Ink title={false} edge={0} style={{ transform: `translate(${smear * K}px, 0)`, opacity: 0.4 }} />
        </>
      )}
    </BackPlane>
  );
};
