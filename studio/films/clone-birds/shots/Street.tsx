// The street, loop f0-149 (breakdown 2-5): sky; the Capitol as the camera proxy (one scene scale
// 1.0 → 0.21 → 0.45, pan and roll from the measured dome table); signs A/B and the red-bird card
// (f0-29); the van riding the scene with 1.3x parallax; the red crowd rising f30-65 with its
// placards; a dark back tree; tiny birds. The air layers (plane, pigeon, reticle) sit above, in Air.
import { AbsoluteFill } from "remotion";
import capitolUrl from "../assets/gen/P01-capitol-west-front-cut.png";
import crowdUrl from "../assets/gen/G03-crowd-cut.png";
import skyUrl from "../assets/gen/P06-sky-plate.png";
import treeUrl from "../assets/gen/G06-tree-c-cut.png";
import vanUrl from "../assets/gen/G04-van-cut.png";
import { BRUSH_FONT, CamBird, Depth, easeInOut, easeOut, Group, K, keys, Piece, RED, Sign, useLoopFrame } from "../lib/kit";

// Dome table (breakdown 5): [frame, scale (f30 = 1), dome cx, dome top y] in reference px.
const CAM: [number, number, number, number][] = [
  [0, 0.97, 370, 0], [21, 1.02, 370, 0], [24, 0.98, 376, 0], [30, 1.0, 414, 0], [33, 0.96, 429, 18],
  [36, 0.92, 441, 42], [39, 0.88, 450, 66], [42, 0.82, 472, 102], [45, 0.66, 471, 180], [48, 0.62, 464, 225],
  [51, 0.56, 456, 267], [54, 0.48, 441, 312], [57, 0.42, 428, 351], [60, 0.34, 402, 411], [63, 0.3, 396, 429],
  [66, 0.27, 392, 444], [72, 0.25, 386, 459], [75, 0.21, 382, 474], [108, 0.22, 370, 490], [138, 0.22, 370, 490],
  [140, 0.18, 390, 480], [145, 0.36, 400, 420], [148, 0.45, 410, 380], [149, 0.45, 410, 380],
];
const col = (i: number) => CAM.map((r) => [r[0], r[i]] as [number, number]);
const S = col(1);
const CX = col(2);
const TOP = col(3);
// Dome top-centre of the Capitol cut-out at scale 1 (Piece x 417, w 4680 → dome at x 370, top ~10).
const OX = 370;
const OY = 10;

// Crowd rows back to front: heads grow toward the camera (perspective), each row shifted so no
// two tiles line up in a column (the band is one generated picture, tiled and mirrored: D42).
const CROWD_ROWS = [
  { dy: 40, w: 170, off: 0 },
  { dy: 58, w: 190, off: 120 },
  { dy: 75, w: 210, off: 73 },
  { dy: 98, w: 235, off: 180 },
  { dy: 120, w: 260, off: 31 },
  { dy: 150, w: 295, off: 230 },
  { dy: 180, w: 330, off: 140 },
  { dy: 220, w: 375, off: 10 },
  { dy: 260, w: 420, off: 55 },
  { dy: 315, w: 480, off: 300 },
  { dy: 370, w: 540, off: 210 },
  { dy: 445, w: 620, off: 20 },
  { dy: 520, w: 700, off: 90 },
];

const BIRDS: [number, number, number][] = [[90, 150, 9], [210, 90, 7], [520, 120, 11], [610, 230, 8], [300, 260, 6]];

export const Street: React.FC = () => {
  const f = useLoopFrame();
  const s = keys(f, S);
  const tx = keys(f, CX) - OX;
  const ty = keys(f, TOP);
  // Scene roll ~0 → +10 deg CW f30-63, back to ~5 deg by f75 (breakdown 5, estimate).
  const roll = keys(f, [[30, 0], [63, 10], [75, 5], [138, 5], [148, 2]], easeInOut);

  // Signs and card (f0-29), measured centres.
  const ax = keys(f, [[0, 570], [3, 518], [5, 501], [8, 483], [10, 474], [21, 477], [25, 507], [28, 560], [30, 1150]]);
  const ay = keys(f, [[0, 580], [3, 597], [5, 621], [8, 634], [10, 640], [21, 638], [25, 624], [28, 580], [30, 380]]);
  const bx = keys(f, [[0, 190], [3, 280], [5, 327], [8, 348], [10, 351], [21, 351], [23, 318], [25, 261], [28, 120], [30, -420]]);
  const by = keys(f, [[0, 840], [3, 1011], [5, 1030], [8, 1046], [10, 1048], [21, 1048], [23, 1028], [25, 1040], [28, 1080]]);
  const br = keys(f, [[0, -32], [21, -32], [25, -50], [28, -80]]);
  const cardX = keys(f, [[0, -160], [3, 40], [10, 137]], easeOut);
  const cardY = keys(f, [[0, 915], [25, 915], [30, 1100], [45, 800], [60, 760]]);
  const cardS = keys(f, [[0, 1], [30, 1], [45, 0.6], [60, 0.35]]);

  // Van: slides in on screen (f0-13), then is a world object (1.3x parallax) drifting left.
  const vanX = keys(f, [[0, 700], [3, 580], [8, 480], [13, 430], [23, 425], [29, 480], [57, 420]]);

  // Crowd top edge on screen (breakdown 3): 87 % H f40 → 52 % f60 → ~47 % after; whip-out f140-148
  // drops it back down as the scene widens.
  const T = keys(f, [[28, 1320], [40, 1114], [50, 858], [60, 666], [66, 610], [138, 600], [141, 700], [148, 640]], easeOut);
  const crowdShow = f >= 28;

  const treeX = keys(f, [[43, -120], [48, 40], [149, 40]], easeOut);

  return (
    <AbsoluteFill>
      <Piece src={skyUrl} x={360} y={640} w={720} pre="brightness(1.45) contrast(1.15)" />
      {BIRDS.map(([x, y, w], i) => (
        <svg key={i} style={{ position: "absolute", left: (x + ((f * (i + 2)) % 40)) * K, top: (y + (i % 2 ? -1 : 1) * (f % 9)) * K }} width={w * K} height={w * 0.5 * K} viewBox="0 0 10 5">
          <path d="M0 1 Q2.5 0 5 3 Q7.5 0 10 1" stroke="#00001B" strokeWidth={0.9} fill="none" />
        </svg>
      ))}
      <Group s={s} x={tx} y={ty} r={roll} ox={OX} oy={OY}>
        <Piece src={capitolUrl} x={417} y={585} w={4680} />
        {/* The reference facade under the drum sits in shadow (dark navy band): our photo is sunlit. */}
        <div style={{ position: "absolute", left: -400 * K, top: 520 * K, width: 1600 * K, height: 700 * K, background: "linear-gradient(#00001B00, #00001Bcc 18%, #00001B99 60%, #00001B00)", mixBlendMode: "multiply" }} />
        <Depth groupScale={s} ox={OX} oy={OY}>
          <Piece src={vanUrl} x={vanX} y={1060} w={470} />
          <div style={{ position: "absolute", left: (vanX - 40) * K, top: 990 * K, width: 170 * K, color: RED, fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 40 * K, lineHeight: 0.9 }}>
            BIRDS AREN'T REAL
          </div>
        </Depth>
      </Group>
      {f >= 43 && <Piece src={treeUrl} x={treeX} y={620} w={200} pre="brightness(0.35) contrast(1.3)" />}
      <div style={{ position: "absolute", left: (cardX - 137) * K, top: (cardY - 121) * K, width: 274 * K, height: 243 * K, background: f >= 28 ? "#E4E6D6" : "#B8AE86", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(-4deg) scale(${cardS})` }}>
        <CamBird size={200} />
      </div>
      {crowdShow && (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 0, right: 0, top: (T + 60) * K, bottom: 0, background: "#a3121b" }} />
          {CROWD_ROWS.map(({ dy, w, off }, r) =>
            Array.from({ length: Math.ceil(900 / (w * 0.72)) + 1 }, (_, c) => (
              <Piece
                key={`${r}-${c}`}
                src={crowdUrl}
                look="red"
                pre="brightness(1.9) contrast(1.15)"
                x={off - w / 2 + c * w * 0.72}
                y={T + dy}
                w={w}
                style={{ scale: (r + c) % 2 ? "-1 1" : undefined }}
              />
            )),
          )}
          {f >= 50 && (
            <Sign x={140} y={T + 70} w={210} h={130} rot={-22}>
              <div style={{ fontFamily: BRUSH_FONT, fontWeight: 400, fontSize: 34 * K, color: "#111", textTransform: "uppercase" }}>FEATHERS ARE</div>
              <div style={{ fontFamily: BRUSH_FONT, fontWeight: 400, fontSize: 58 * K, color: "#111" }}>FAKE</div>
            </Sign>
          )}
          {f >= 58 && (
            <Sign x={560} y={T + 50} w={120} h={100} rot={8}>
              <div style={{ fontSize: 26 * K, color: "#222" }}>BIRDS</div>
              <div style={{ fontSize: 26 * K, color: "#222" }}>AREN'T</div>
              <div style={{ fontSize: 26 * K, color: "#222" }}>REAL</div>
            </Sign>
          )}
          {f >= 58 && (
            <div style={{ position: "absolute", left: 420 * K, top: (T + 10) * K, width: 80 * K, height: 70 * K, background: "#E4E6D6", display: "flex", justifyContent: "center", alignItems: "center", transform: "rotate(-6deg)" }}>
              <CamBird size={60} />
            </div>
          )}
          {f >= 66 && (
            <Sign x={110} y={T + 270} w={130} h={120} rot={-4}>
              <div style={{ fontSize: 30 * K }}>BIRDS ARE</div>
              <div style={{ fontSize: 50 * K }}>SPIES</div>
            </Sign>
          )}
        </AbsoluteFill>
      )}
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
