import { Img } from "remotion";
import { CINZEL } from "./s12-16-kit";

// 2x2 jigsaw drawn in code (SVG). Each piece is a square cell with tabs on its inner edges; the
// tab directions are fixed so neighbours interlock. Cell = 100 units, tab bulges 22.

const T = 22;
/** Path of a cell at (0,0), 100x100; edges l,t,r,b are -1 (notch), 0 (flat) or 1 (tab). */
function piecePath(l: number, t: number, r: number, b: number): string {
  const edge = (x0: number, y0: number, dx: number, dy: number, nx: number, ny: number, s: number) => {
    if (!s) return `L ${x0 + dx * 100} ${y0 + dy * 100} `;
    const p = (u: number, v: number) => `${x0 + dx * u + nx * v * s} ${y0 + dy * u + ny * v * s}`;
    return `L ${p(36, 0)} C ${p(36, 12)} ${p(26, T)} ${p(50, T)} C ${p(74, T)} ${p(64, 12)} ${p(64, 0)} L ${p(100, 0)} `;
  };
  return `M 0 0 ${edge(0, 0, 1, 0, 0, -1, t)}${edge(100, 0, 0, 1, 1, 0, r)}${edge(100, 100, -1, 0, 0, 1, b)}${edge(0, 100, 0, -1, -1, 0, l)}Z`;
}

export type PieceSpec = { id: string; label: string; col: number; row: number; base: string; dark: string; img: string; imgPos: string; extra?: React.ReactNode };

export const PIECES: PieceSpec[] = [];

const CELL = 100;
const EDGES: Record<string, [number, number, number, number]> = {
  hook: [0, 0, 1, 1],
  context: [-1, 0, 0, -1],
  buildup: [0, -1, 1, 0],
  payoff: [-1, 1, 0, 0],
};

/** Cell centre = group origin + ((col - 0.5) * pitch[0], (row - 0.5) * pitch[1]); `size` is the cell edge in px. */
export const Piece: React.FC<{ spec: PieceSpec; size: number; pitch: [number, number] }> = ({ spec, size, pitch }) => {
  const [l, t, r, b] = EDGES[spec.id];
  const d = piecePath(l, t, r, b);
  const pad = 30;
  const k = size / CELL;
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${CELL + pad * 2} ${CELL + pad * 2}`}
      style={{ position: "absolute", left: (spec.col - 0.5) * pitch[0] - size / 2 - pad * k, top: (spec.row - 0.5) * pitch[1] - size / 2 - pad * k, width: (CELL + pad * 2) * k, height: (CELL + pad * 2) * k, overflow: "visible" }}
    >
      <defs>
        <clipPath id={`cp-${spec.id}`}><path d={d} /></clipPath>
        {/* glossy embossed jigsaw: soft bevel from a raking light + clipped to the piece silhouette */}
        <filter id={`bev-${spec.id}`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="h" />
          <feSpecularLighting in="h" surfaceScale="4" specularConstant="0.9" specularExponent="22" lightingColor="#fff6e0" result="spec">
            <fePointLight x="-40" y="-70" z="110" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="specIn" /></feMerge>
        </filter>
        <linearGradient id={`g-${spec.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={spec.base} /><stop offset="1" stopColor={spec.dark} />
        </linearGradient>
      </defs>
      <path d={d} transform="translate(5 9)" fill="rgba(0,0,0,0.42)" style={{ filter: "blur(4px)" }} />
      <g filter={`url(#bev-${spec.id})`}>
      <path d={d} fill={`url(#g-${spec.id})`} />
      <g clipPath={`url(#cp-${spec.id})`}>
        <image href={spec.img} x={-10} y={-10} width={120} height={120} preserveAspectRatio={spec.imgPos} opacity={0.28} style={{ mixBlendMode: "luminosity" }} />
        <path d={d} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={5} transform="translate(1.5 1.5)" />
        {spec.extra}
      </g>
      <path d={d} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={1.4} />
      </g>
      <text x={50} y={36} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} fontSize={11} fill="#fff" style={{ letterSpacing: "0.04em" }}>{spec.label}</text>
    </svg>
  );
};

/** Gold waveform bars for BUILDUP. */
export const Waveform: React.FC = () => (
  <g fill="#e0b13c">
    {Array.from({ length: 16 }, (_, i) => {
      const h = 6 + Math.abs(Math.sin(i * 1.7) * 26) + (i % 3) * 4;
      return <rect key={i} x={8 + i * 5} y={66 - h / 2} width={3} height={h} />;
    })}
  </g>
);

/** Clapper board for BUILDUP with the small "3" disc. */
export const Clapper: React.FC = () => (
  <g transform="translate(46 70)">
    <rect width={44} height={24} fill="#1a1a1a" />
    <rect y={-8} width={44} height={8} fill="#111" />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${i * 9} -8 l 5 0 l -4 8 l -5 0 Z`} fill="#eee" />)}
    <circle cx={50} cy={4} r={7} fill="#c8742e" /><text x={50} y={7.5} fontSize={10} fill="#fff" textAnchor="middle" fontFamily="sans-serif" fontWeight={700}>3</text>
  </g>
);

/** Silhouette of a person in a circle with a city skyline for PAYOFF. */
export const Silhouette: React.FC = () => (
  <g>
    <rect x={8} y={74} width={84} height={26} fill="#4a0a14" opacity={0.7} />
    {[10, 22, 30, 44, 58, 70, 80].map((x, i) => <rect key={i} x={x} y={72 - (i * 7) % 18} width={9} height={30} fill="#3a0710" />)}
    <circle cx={50} cy={64} r={22} fill="#7a1020" />
    <circle cx={50} cy={57} r={5.5} fill="#1b0408" />
    <path d="M 40 82 Q 50 56 60 82 Z" fill="#1b0408" />
  </g>
);

/** Film-strip edge + crosshair for HOOK, dome for CONTEXT. */
export const EyeMark: React.FC = () => (
  <g>
    <ellipse cx={50} cy={66} rx={26} ry={13} fill="#e8e0d0" /><circle cx={50} cy={66} r={9} fill="#2a4a7a" /><circle cx={50} cy={66} r={4} fill="#000" />
    <path d="M 14 50 H 86 M 50 44 V 90" stroke="rgba(255,255,255,0.35)" strokeWidth={0.8} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={6 + i * 13} y={4} width={7} height={5} fill="#0c1a38" />)}
  </g>
);
export const Dome: React.FC = () => (
  <g fill="#efe6cf">
    <path d="M 24 90 V 66 H 76 V 90 Z" /><path d="M 30 66 A 20 20 0 0 1 70 66 Z" /><rect x={48} y={38} width={4} height={10} />
    <circle cx={50} cy={37} r={2.5} />
    {[30, 40, 50, 60, 70].map((x) => <rect key={x} x={x - 1.5} y={70} width={3} height={20} fill="#b9ad8c" />)}
  </g>
);
void Img;
