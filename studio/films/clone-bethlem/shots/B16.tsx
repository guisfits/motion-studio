import { AbsoluteFill, Img } from "remotion";
import { H, W, ramp, useRefFrame } from "../lib/kit";
import { YearsCard } from "../lib/b13-16-years";
import coverUrl from "../assets/pd/P24-lunacy-report-1852-title-wellcome.jpg";

// Shot 16 (reference f1139-1209, 47.4-50.3 s): the report cover (real scan, own warm paper) peels in
// over the years card as a diagonal wipe from lower-right to upper-left with a curled cream reverse
// (f1139-1146, 8 f), then pulls out 1.5 -> 1.0 to the end (breakdown 6.4). It draws over B15's last
// frames. The reference shows the scan stretched ~1.6x sideways (text spans the frame): so do we.

const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

export const B16: React.FC = () => {
  const t = useRefFrame();
  const p = easeInOut(Math.min(1, Math.max(0, t / 8)));
  // Front line x/W*0.8 + y/H*0.6 = c, c sweeping from the lower-right corner (1.4) to the upper-left (0).
  const c = 1.45 - 1.5 * p;
  const rect = [[0, 0], [W, 0], [W, H], [0, H]];
  const edge = (x: number, y: number) => (x / W) * 0.8 + (y / H) * 0.6 - c;
  // Clip the frame rectangle to edge >= off (Sutherland-Hodgman on one half-plane).
  const halfPlane = (off: number): string => {
    const out: number[][] = [];
    for (let i = 0; i < 4; i++) {
      const a = rect[i], b = rect[(i + 1) % 4];
      const ea = edge(a[0], a[1]) - off, eb = edge(b[0], b[1]) - off;
      if (ea >= 0) out.push(a);
      if (ea >= 0 !== eb >= 0) {
        const k = ea / (ea - eb);
        out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
      }
    }
    return out.length >= 3 ? `polygon(${out.map(([x, y]) => `${x}px ${y}px`).join(",")})` : "polygon(0 0,0 0,0 0)";
  };
  const clip = halfPlane(0);
  // Curled cream reverse: a band just beyond the front, widest mid-peel.
  const flapD = 0.13 * Math.sin(Math.PI * p);
  return (
    <AbsoluteFill>
      {/* B15 ends at f1140 but the peel starts at f1139: paint its last state underneath (B16 t0 = B15 t50). */}
      <YearsCard t={t + 50} />
      {flapD > 0.002 ? (
        <AbsoluteFill style={{ clipPath: halfPlane(-flapD), background: "linear-gradient(135deg, #D8CFAA 0%, #F2EBD2 55%, #E4DBB8 100%)" }} />
      ) : null}
      <AbsoluteFill style={{ clipPath: clip }}>
        <AbsoluteFill style={{ transform: `scale(${ramp(t, 0, 71, 2.2, 1.0, "out")})`, transformOrigin: "17% 4%" }}>
          <Img src={coverUrl} style={{ position: "absolute", width: W / 0.98, height: H * 0.965, left: -10, top: 0, filter: "sepia(0.08) contrast(1.02)" }} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
