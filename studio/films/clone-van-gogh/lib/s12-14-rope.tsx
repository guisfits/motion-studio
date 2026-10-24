import { drift } from "../../../../src/physics";

// Velvet rope between two brass stanchions, hung as a real catenary y = a*cosh((x-cx)/a) (+ const) between
// two hook points. A small impulse at local 0 (the pillar sweep just slammed past) rings down as a lateral
// pendulum swing of the lowest point plus a faint breathing sag; `drift` adds the idle sway.
const FPS = 16;
const SPAN = 860;
const SAG = 370;

/** Catenary parameter a with a(cosh(span/2a) - 1) = sag (Newton, fine for this range). */
const catenaryA = (): number => {
  let a = 400;
  for (let i = 0; i < 20; i++) {
    const fx = a * (Math.cosh(SPAN / 2 / a) - 1) - SAG;
    const dfx = Math.cosh(SPAN / 2 / a) - 1 - (SPAN / 2 / a) * Math.sinh(SPAN / 2 / a);
    a -= fx / dfx;
  }
  return a;
};
const A = catenaryA();

export const Rope: React.FC<{ frame: number; cx: number; hookY: number }> = ({ frame, cx, hookY }) => {
  const t = frame / FPS;
  const swing = 15 * Math.exp(-1.3 * t) * Math.sin(2 * Math.PI * 0.9 * t) + drift(frame, FPS, "s14-rope", { amp: 3, hz: 0.5 }).x;
  const sag = SAG * (1 + 0.012 * Math.exp(-1.3 * t) * Math.cos(2 * Math.PI * 1.8 * t));
  const a = (() => {
    let aa = A;
    for (let i = 0; i < 12; i++) {
      const fx = aa * (Math.cosh(SPAN / 2 / aa) - 1) - sag;
      const dfx = Math.cosh(SPAN / 2 / aa) - 1 - (SPAN / 2 / aa) * Math.sinh(SPAN / 2 / aa);
      aa -= fx / dfx;
    }
    return aa;
  })();
  const pts: string[] = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = -SPAN / 2 + u * SPAN;
    const y = sag - a * (Math.cosh(x / a) - 1);
    // the swing displaces the middle sideways (zero at the hooks)
    const dx = swing * Math.sin(Math.PI * u) ** 1.2;
    pts.push(`${(cx + x + dx).toFixed(1)},${(hookY + y).toFixed(1)}`);
  }
  const d = "M" + pts.join(" L");
  const x0 = cx - SPAN / 2;
  const x1 = cx + SPAN / 2;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="brass" x1="0" x2="1">
          <stop offset="0" stopColor="#6b4a14" />
          <stop offset="0.35" stopColor="#e2b45a" />
          <stop offset="0.6" stopColor="#b98a32" />
          <stop offset="1" stopColor="#5a3d10" />
        </linearGradient>
        <radialGradient id="ball" cx="0.35" cy="0.3">
          <stop offset="0" stopColor="#f6dc9a" />
          <stop offset="0.6" stopColor="#b98a32" />
          <stop offset="1" stopColor="#5a3d10" />
        </radialGradient>
      </defs>
      {/* stanchions, hung off the frame edges like the reference's */}
      {[22, 1022].map((x, i) => (
        <g key={i}>
          <rect x={x - 26} y={hookY - 140} width={52} height={1100} fill="url(#brass)" />
          <circle cx={x} cy={hookY - 140} r={32} fill="url(#ball)" />
        </g>
      ))}
      <path d={d} transform="translate(10,18)" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={26} strokeLinecap="round" style={{ filter: "blur(8px)" }} />
      <path d={d} fill="none" stroke="#5a0b12" strokeWidth={38} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#b4131f" strokeWidth={30} strokeLinecap="round" />
      <path d={d} transform="translate(0,-6)" fill="none" stroke="#ec4b57" strokeWidth={7} strokeLinecap="round" opacity={0.75} />
      {[x0, x1].map((x, i) => (
        <g key={i}>
          <rect x={x - (i ? 4 : 20)} y={hookY - 14} width={24} height={28} rx={6} fill="url(#brass)" />
        </g>
      ))}
    </svg>
  );
};
