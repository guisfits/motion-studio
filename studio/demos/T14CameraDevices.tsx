import { AbsoluteFill, Img, Sequence } from "remotion";
import { Camera, cameraAt, cutAtPeak, zoomThrough, type CamKey } from "../../src/camera";
import { SetDown } from "../../src/paper";
import ortelius from "../../assets/img/ortelius-1572-world-map.jpg";
import merian from "../../assets/img/merian-alsatiae.jpg";
import piranesi from "../../assets/img/piranesi-campo-vaccino.jpg";
import riders from "../../assets/img/durer-four-riders.jpg";
import moses from "../../assets/img/dore-moses-sinai.jpg";

// Technique 14: camera devices. A set-down sheet, then a stepped pan (12 poses/s, like paper
// slid by hand) against a smooth pan, a cut on the peak of a leg, and a zoom-through into a
// picture that lands on the next shot. One table, five sheets in a row; the camera only arrives.
export const T14_DURATION = 390; // 13 s at 30 fps

const GROUND = "#cdbfa6";
const REST_SHADOW = "drop-shadow(4px 4px 3px rgba(20,12,6,.36))";

type Sheet = { src: string; cx: number; w: number; h: number };
const CY = 540;
const SHEETS: Sheet[] = [
  { src: ortelius, cx: 960, w: 1150, h: 795 },
  { src: merian, cx: 3360, w: 1100, h: 824 },
  { src: piranesi, cx: 5760, w: 1200, h: 836 },
  { src: riders, cx: 8160, w: 600, h: 852 },
  { src: moses, cx: 12000, w: 640, h: 813 },
];
const [A, B, C, D, E] = SHEETS;

const place = (s: Sheet) => ({ position: "absolute" as const, left: s.cx - s.w / 2, top: CY - s.h / 2, width: s.w, height: s.h });

const Table: React.FC = () => (
  <>
    {SHEETS.map((s) => (
      <Img key={s.src} src={s.src} style={{ ...place(s), filter: REST_SHADOW }} />
    ))}
  </>
);

// Frames (absolute) where each beat starts.
const STEPPED_FROM = 48; // sheet A has been set down; the stepped pan starts
const SMOOTH_FROM = 130;
const CUT_FROM = 225;
const DIVE_AT = 300;

const centre = (x: number): CamKey => ({ frame: 0, x, y: CY, zoom: 1 });

// Beat 2: stepped pan A -> B (local frames).
const STEPPED: CamKey[] = [
  { ...centre(A.cx), frame: 0 },
  { ...centre(A.cx), frame: 6 },
  { ...centre(B.cx), frame: 76 },
  { ...centre(B.cx), frame: SMOOTH_FROM - STEPPED_FROM },
];

// Beat 3 onward (absolute frames, shifted into the sequence below): smooth pan B -> C, the cut on
// the peak of the C -> D leg, the dive into D landing on E.
const leg: CamKey[] = [
  { ...centre(C.cx), frame: CUT_FROM },
  { ...centre(D.cx - 1500), frame: CUT_FROM + 60 },
];
const CUT = cutAtPeak(leg, CUT_FROM, CUT_FROM + 60);
const atCut = cameraAt(leg, CUT);
const dive = zoomThrough({
  at: DIVE_AT,
  dur: 36,
  from: { x: D.cx, y: CY },
  target: { x: D.cx + 40, y: CY - 90 },
  next: { x: E.cx, y: CY },
  depth: 14,
});

const SMOOTH: CamKey[] = [
  { ...centre(B.cx), frame: SMOOTH_FROM },
  { ...centre(B.cx), frame: SMOOTH_FROM + 8 },
  { ...centre(C.cx), frame: SMOOTH_FROM + 70, ease: "glide" },
  { ...centre(C.cx), frame: CUT_FROM },
  // the cut is on the curve: the old shot ends mid-flight, the new one is already in motion
  { frame: CUT, x: atCut.x, y: CY, zoom: 1, ease: "glide" },
  { frame: CUT, x: D.cx - 700, y: CY, zoom: 1, ease: "glide" },
  { ...centre(D.cx), frame: CUT + 30 },
  { ...centre(D.cx), frame: DIVE_AT },
  ...dive.keys,
  { ...centre(E.cx), zoom: 1.06, frame: T14_DURATION - 1 },
];

const Label: React.FC<{ children: string }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      left: 56,
      bottom: 44,
      font: "500 26px 'JetBrains Mono', ui-monospace, monospace",
      letterSpacing: 2,
      color: "#3b2a18",
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

export const T14CameraDevices: React.FC = () => {
  const shifted = SMOOTH.map((k) => ({ ...k, frame: k.frame - SMOOTH_FROM }));
  return (
    <AbsoluteFill style={{ backgroundColor: GROUND }}>
      <Sequence durationInFrames={STEPPED_FROM}>
        <SetDown delay={0.1} from="top" size={[A.w, A.h]} style={place(A)}>
          <Img src={A.src} style={{ width: "100%", height: "100%" }} />
        </SetDown>
      </Sequence>
      <Sequence from={STEPPED_FROM} durationInFrames={SMOOTH_FROM - STEPPED_FROM}>
        <Camera keys={STEPPED} stepFps={12} drift={0}>
          <Table />
        </Camera>
        <Label>stepped · 12 poses / s</Label>
      </Sequence>
      <Sequence from={SMOOTH_FROM}>
        <Camera keys={shifted} blur drift={0}>
          <Table />
        </Camera>
      </Sequence>
      <Sequence from={SMOOTH_FROM + 8} durationInFrames={70}>
        <Label>smooth</Label>
      </Sequence>
      <Sequence from={CUT_FROM} durationInFrames={DIVE_AT - CUT_FROM - 8}>
        <Label>cut at the peak</Label>
      </Sequence>
      <Sequence from={DIVE_AT} durationInFrames={T14_DURATION - DIVE_AT}>
        <Label>zoom through</Label>
      </Sequence>
    </AbsoluteFill>
  );
};
