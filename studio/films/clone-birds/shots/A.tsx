// Beats A-B-C1 (loop f0-29, breakdown 2): Capitol full frame; sign A "BIRDS AREN'T REAL", sign B
// "AVIAN SURVEILLANCE" and the red-bird card ease in (no overshoot) and hold; the van slides in
// from the right; at f21+ the signs leave and the Capitol starts its pan right.
import { AbsoluteFill } from "remotion";
import capitolUrl from "../assets/gen/P01-capitol-west-front-cut.png";
import skyUrl from "../assets/gen/P06-sky-plate.png";
import vanUrl from "../assets/gen/G04-van-cut.png";
import { CamBird, easeInOut, easeOut, Group, K, keys, Piece, RED, Sign, useLoopFrame } from "../lib/kit";

export const A: React.FC = () => {
  const f = useLoopFrame();
  // Camera proxy (breakdown 5): ~1.0 with a slight swell f10-21, pan right f24-30 (dome cx 370 → 414).
  const s = keys(f, [[0, 0.97], [21, 1.02], [29, 1.0]]);
  const panX = keys(f, [[0, 0], [23, 0], [29, 40]], easeInOut);
  // Sign A (measured centres): in f0-10, hold to f21, out up-right by f30.
  const ax = keys(f, [[0, 570], [3, 518], [5, 501], [8, 483], [10, 474], [21, 477], [25, 507], [28, 560], [30, 640]]);
  const ay = keys(f, [[0, 580], [3, 597], [5, 621], [8, 634], [10, 640], [21, 638], [25, 624], [28, 580], [30, 540]]);
  // Sign B: in from lower left, hold, rotate-slide out left.
  const bx = keys(f, [[0, 190], [3, 280], [5, 327], [8, 348], [10, 351], [21, 351], [23, 318], [25, 261], [28, 120], [30, -60]]);
  const by = keys(f, [[0, 840], [3, 1011], [5, 1030], [8, 1046], [10, 1048], [21, 1048], [23, 1028], [25, 1040], [28, 1080]]);
  const br = keys(f, [[0, -32], [21, -32], [25, -50], [28, -80]]);
  const vanX = keys(f, [[0, 700], [3, 580], [8, 480], [13, 430], [23, 425], [29, 480]]);
  const cardX = keys(f, [[0, -160], [3, 40], [10, 137]], easeOut);
  return (
    <AbsoluteFill>
      <Piece src={skyUrl} x={360} y={640} w={720} pre="brightness(1.45) contrast(1.15)" />
      <Group s={s} x={panX} ox={370} oy={300}>
        <Piece src={capitolUrl} x={417} y={585} w={4680} />
        {/* The reference facade under the drum sits in shadow (dark navy band): our photo is sunlit. */}
        <div style={{ position: "absolute", left: -400 * K, top: 520 * K, width: 1600 * K, height: 700 * K, background: "linear-gradient(#00001B00, #00001Bcc 18%, #00001B99 60%, #00001B00)", mixBlendMode: "multiply" }} />
      </Group>
      <Piece src={vanUrl} x={vanX} y={1060} w={470} />
      <div style={{ position: "absolute", left: (vanX - 40) * K, top: 990 * K, width: 170 * K, color: RED, fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 40 * K, lineHeight: 0.9 }}>
        BIRDS AREN'T REAL
      </div>
      <div style={{ position: "absolute", left: (cardX - 137) * K, top: 794 * K, width: 274 * K, height: 243 * K, background: "#B8AE86", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-4deg)" }}>
        <CamBird size={200} />
      </div>
      <Sign x={bx} y={by} w={480} h={300} rot={br}>
        <div style={{ fontSize: 140 * K }}>AVIAN</div>
        <div style={{ fontSize: 50 * K }}>SURVEILLANCE</div>
      </Sign>
      <Sign x={ax} y={ay} w={340} h={340} rot={-30} frame>
        <div style={{ fontSize: 88 * K }}>BIRDS</div>
        <div style={{ fontSize: 88 * K }}>AREN'T</div>
        <div style={{ fontSize: 88 * K }}>REAL</div>
      </Sign>
    </AbsoluteFill>
  );
};
