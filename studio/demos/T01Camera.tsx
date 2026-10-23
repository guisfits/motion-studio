import { AbsoluteFill, Img } from "remotion";
import { Camera, type CamKey } from "../../src/camera";
import ortelius from "../../assets/img/ortelius-1572-world-map.jpg";
import merian from "../../assets/img/merian-alsatiae.jpg";

// Technique 1: the infinite table. Two public-domain maps lie side by side on a plain ground
// far bigger than the frame; the camera travels between them. Nothing enters the frame from
// nowhere: everything is already on the table and the camera simply arrives.
export const T01_DURATION = 450; // 15 s at 30 fps

const SHEET_SHADOW = "0 22px 30px rgba(20,12,4,.45), 0 3px 6px rgba(20,12,4,.4)";

// World px on the table; the frame is 1920x1080 of it at zoom 1.
const KEYS: CamKey[] = [
  { frame: 0, x: 900, y: 640, zoom: 1 }, // open on the left map
  { frame: 105, x: 2300, y: 1000, zoom: 1 }, // pan across it (glide)
  { frame: 120, x: 2300, y: 1000, zoom: 1, ease: "glide" }, // brief hold
  { frame: 210, x: 2700, y: 1150, zoom: 1.14 }, // push-in
  { frame: 240, x: 2700, y: 1150, zoom: 1.14, ease: "whip" }, // hold, then whip
  { frame: 258, x: 5260, y: 1220, zoom: 1.14 }, // lands on the second map
  { frame: 300, x: 5260, y: 1220, zoom: 1.14, ease: "glide" }, // hold
  { frame: 450, x: 3500, y: 1300, zoom: 0.55 }, // pull-back to see both
];

export const T01Camera: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#cdbfa6" }}>
    <Camera keys={KEYS} blur>
      <Img
        src={ortelius}
        style={{ position: "absolute", left: 0, top: 0, width: 3600, height: 2488, boxShadow: SHEET_SHADOW }}
      />
      <Img
        src={merian}
        style={{ position: "absolute", left: 3900, top: 200, width: 2720, height: 2038, boxShadow: SHEET_SHADOW }}
      />
    </Camera>
  </AbsoluteFill>
);
