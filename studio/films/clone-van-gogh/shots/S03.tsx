import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT, H, W, easeOut, hash, keys, useFonts } from "../lib/s01-03-kit";
import { GiltFrame } from "./S02";
import bustUrl from "../assets/gen/s03-vg-profile-cut.png";
import blossomUrl from "../assets/gen/s03-blossom-cut.png";
import leafUrl from "../assets/gen/s03-leaf-cut.png";
import leafBUrl from "../assets/gen/s03-leaf-b-cut.png";
import starryUrl from "../assets/pd/starry-night.jpg";

// S03 (abs 52-104): torn-paper holes open over S02, blossom profile + falling leaves (3a), punch to the
// framed Starry Night where the head was (3b, local 19). Local f = reference frame - 53.

const PUNCH = 19; // reference f72
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

const LEAVES = Array.from({ length: 16 }, (_, i) => {
  const near = hash(i * 5 + 1);
  return {
    src: i % 2 ? leafUrl : leafBUrl,
    start: i === 0 ? 4 : 4 + i * 3 - hash(i) * 2,
    x0: 0.35 + hash(i * 3 + 2) * 0.8,
    size: 0.05 + near * near * 0.3,
    vy: 0.009 + near * 0.014,
    vx: -(0.004 + hash(i * 11) * 0.006),
    spin: (hash(i * 7) > 0.5 ? 1 : -1) * (2 + hash(i * 9) * 3),
    rot0: hash(i * 13) * 360,
    near,
  };
});

export const S03: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const punched = f >= PUNCH;

  // World camera: pre-punch push 1.0 -> 1.07 about the page centre; punch x1.35, then push to ~1.65 about the painting.
  const P: [number, number] = punched ? [0.52 * W, 0.38 * H] : [0.5 * W, 0.5 * H];
  const T: [number, number] = P;
  const s = punched ? keys(f, [[PUNCH, 1.36], [52, 1.66]]) : keys(f, [[0, 1], [PUNCH - 1, 1.07]], easeOut);
  const world: React.CSSProperties = { transformOrigin: `${P[0]}px ${P[1]}px`, transform: `translate(${T[0] - P[0]}px, ${T[1] - P[1]}px) scale(${s})` };

  const tearing = f < 9;
  const sway = Math.sin((f / 16) * Math.PI * 2) * 1;
  const manIn = keys(f, [[1, 60], [3, 0]]);
  const painting = punched ? keys(f, [[PUNCH, 0], [PUNCH + 1, 1]]) : 0;

  const scene = (
    <AbsoluteFill style={{ background: "#EDEBE6" }}>
      <AbsoluteFill style={world}>
        {/* back branches, three depths */}
        <img src={blossomUrl} style={{ position: "absolute", left: -280, top: -380, width: 1300, transform: "rotate(160deg)", filter: "blur(5px) brightness(.85)", opacity: 0.9 }} />
        <img src={blossomUrl} style={{ position: "absolute", left: 420, top: 60, width: 900, transform: "rotate(-25deg)" }} />
        <img src={blossomUrl} style={{ position: "absolute", left: -250, top: 420, width: 700, transform: "rotate(95deg)", filter: "blur(2px)" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );

  const man = (
    <AbsoluteFill style={{ ...world }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${manIn}px)` }}>
        <img src={bustUrl} style={{ position: "absolute", left: 74, top: 440, width: 1110, height: 1480, clipPath: punched ? `inset(${0.5 * H - 440}px 0 0 0)` : undefined }} />
        {/* blossom clusters on the coat */}
        <img src={blossomUrl} style={{ position: "absolute", left: 120, top: 1180, width: 620, transform: `rotate(${20 + sway}deg)` }} />
        <img src={blossomUrl} style={{ position: "absolute", left: 480, top: 1050, width: 640, transform: `rotate(${-70 + sway}deg)` }} />
        <img src={blossomUrl} style={{ position: "absolute", left: 330, top: 1450, width: 700, transform: `rotate(${110 - sway}deg)` }} />
        {/* front-top right + bottom-right branches */}
        <img src={blossomUrl} style={{ position: "absolute", left: 600, top: -160, width: 760, transform: `rotate(${200 + sway}deg)` }} />
        <img src={blossomUrl} style={{ position: "absolute", left: 640, top: 1380, width: 760, transform: `rotate(${-20 - sway}deg)` }} />
        {painting > 0 && <GiltFrame kind="rect" painting={starryUrl} cx={0.52 * W} cy={0.38 * H} w={0.45 * W} />}
      </div>
      {/* TURNED IT / INTO SOME ride the camera */}
      <div style={{ position: "absolute", left: W / 2, top: 0.653 * H, transform: "translate(-50%,-50%)", textAlign: "center", fontFamily: FONT, fontSize: 85, lineHeight: "62px", color: ORANGE, textShadow: "0 3px 0 #5a2d12", whiteSpace: "nowrap" }}>
        {f >= 1 && <div>TURNED IT</div>}
        {f >= 2 && <div>INTO SOME</div>}
      </div>
    </AbsoluteFill>
  );

  const ever = f >= 33 && (
    <div style={{ position: "absolute", left: 0.7 * W, top: 0.49 * H, transform: "translate(-50%,-50%)", fontFamily: FONT, fontSize: 100, whiteSpace: "nowrap", textShadow: "0 3px 0 rgba(0,0,0,.45)" }}>
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
      {ever}
      {LEAVES.map((l, i) => {
        const t = f - l.start;
        if (t < 0) return null;
        const cx = (l.x0 + l.vx * t) * W;
        const cy = (-0.12 + l.vy * t) * H;
        const w = l.size * W * 1.45;
        return <img key={i} src={l.src} style={{ position: "absolute", left: cx - w / 2, top: cy - w / 2, width: w, height: w, transform: `rotate(${l.rot0 + l.spin * t}deg)`, filter: l.near > 0.75 ? "blur(4px)" : undefined }} />;
      })}
    </AbsoluteFill>
  );
};
