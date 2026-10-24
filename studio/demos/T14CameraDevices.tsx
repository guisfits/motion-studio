import { AbsoluteFill, Img, Sequence } from "remotion";
import { Camera, cameraAt, cutAtPeak, zoomThrough, type CamKey } from "../../src/camera";
import { SetDown } from "../../src/paper";
import ortelius from "../../assets/img/ortelius-1572-world-map.jpg";
import merian from "../../assets/img/merian-alsatiae.jpg";
import piranesi from "../../assets/img/piranesi-campo-vaccino.jpg";
import riders from "../../assets/img/durer-four-riders.jpg";
import moses from "../../assets/img/dore-moses-sinai.jpg";
import virgin from "../../assets/img/durer-virgin-st-john.jpg";

// Technique 14: camera devices. A set-down sheet, then a stepped pan (12 poses/s) against a
// smooth pan, a cut on the peak of a leg, and two zoom-throughs into a picture that land on
// the next shot. One table, six sheets in a row; the camera only arrives.
export const T14_DURATION = 390; // 13 s at 30 fps

const GROUND = "#cdbfa6";
const REST_SHADOW = "drop-shadow(4px 4px 3px rgba(20,12,6,.36))";

type Sheet = { src: string; cx: number; w: number; h: number };
const CY = 540;
const SHEETS: Sheet[] = [
  { src: ortelius, cx: 960, w: 1500, h: 1037 },
  { src: merian, cx: 3560, w: 1300, h: 974 },
  { src: piranesi, cx: 6300, w: 1450, h: 1010 },
  { src: riders, cx: 8900, w: 705, h: 1000 },
  { src: moses, cx: 12500, w: 786, h: 1000 },
  { src: virgin, cx: 16000, w: 645, h: 1000 },
];
const [A, B, C, D, E, F] = SHEETS;

const place = (s: Sheet) => ({ position: "absolute" as const, left: s.cx - s.w / 2, top: CY - s.h / 2, width: s.w, height: s.h });

const Table: React.FC = () => (
  <>
    {SHEETS.map((s) => (
      <Img key={s.src} src={s.src} style={{ ...place(s), filter: REST_SHADOW }} />
    ))}
  </>
);

// Frames (absolute) where each beat starts.
const STEPPED_FROM = 24; // sheet A has been set down; the stepped pan starts
const SMOOTH_FROM = 100;
const CUT_FROM = 190;
const DIVE_AT = 262;
const DIVE2_AT = 322;

const centre = (x: number, frame: number, zoom = 1): CamKey => ({ frame, x, y: CY, zoom });

// Beat 2: stepped pan A -> B (local frames).
const STEPPED: CamKey[] = [centre(A.cx, 0), centre(A.cx, 4), centre(B.cx, 52), centre(B.cx, SMOOTH_FROM - STEPPED_FROM)];

// Beat 3 onward (absolute frames, shifted into the sequence below): smooth pan B -> C, the cut on
// the peak of the C -> D leg, the dive into D landing on E, a slow push, a second dive onto F.
const leg: CamKey[] = [centre(C.cx, CUT_FROM), centre(D.cx - 1500, CUT_FROM + 60)];
const CUT = cutAtPeak(leg, CUT_FROM, CUT_FROM + 60);
const atCut = cameraAt(leg, CUT);
const dive = zoomThrough({
  at: DIVE_AT,
  dur: 33,
  from: { x: D.cx, y: CY },
  target: { x: D.cx + 40, y: CY - 90 },
  next: { x: E.cx, y: CY },
  depth: 14,
});
const dive2 = zoomThrough({
  at: DIVE2_AT,
  dur: 30,
  from: { x: E.cx, y: CY, zoom: 1.12 },
  target: { x: E.cx + 60, y: CY - 130 },
  next: { x: F.cx, y: CY },
  depth: 14,
});

const SMOOTH: CamKey[] = [
  centre(B.cx, SMOOTH_FROM),
  centre(B.cx, SMOOTH_FROM + 16),
  { ...centre(C.cx, SMOOTH_FROM + 72), ease: "glide" },
  centre(C.cx, CUT_FROM),
  // the cut is on the curve: the old shot ends mid-flight, the new one is already in motion
  { frame: CUT, x: atCut.x, y: CY, zoom: 1, ease: "glide" },
  { frame: CUT, x: D.cx - 700, y: CY, zoom: 1, ease: "glide" },
  centre(D.cx, CUT + 30),
  ...dive.keys,
  ...dive2.keys,
  centre(F.cx, T14_DURATION - 1, 1.18),
];

export const T14CameraDevices: React.FC = () => {
  const shifted = SMOOTH.map((k) => ({ ...k, frame: k.frame - SMOOTH_FROM }));
  return (
    <AbsoluteFill style={{ backgroundColor: GROUND }}>
      <Sequence durationInFrames={STEPPED_FROM}>
        <SetDown delay={-0.2} from="top" size={[A.w, A.h]} style={place(A)}>
          <Img src={A.src} style={{ width: "100%", height: "100%" }} />
        </SetDown>
      </Sequence>
      <Sequence from={STEPPED_FROM} durationInFrames={SMOOTH_FROM - STEPPED_FROM}>
        <Camera keys={STEPPED} stepFps={12} drift={0}>
          <Table />
        </Camera>
      </Sequence>
      <Sequence from={SMOOTH_FROM}>
        <Camera keys={shifted} blur drift={0}>
          <Table />
        </Camera>
      </Sequence>
    </AbsoluteFill>
  );
};
