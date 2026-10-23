import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Camera, type CamKey } from "../../src/camera";
import { Multiplane } from "../../src/parallax";
import piranesi from "../../assets/img/piranesi-campo-vaccino.jpg";
import sibylPlate from "../../assets/img/schedel-tiburtine-sibyl.jpg";
import riders from "../../assets/img/durer-four-riders.jpg";
import genesis from "../../assets/img/gutenberg-genesis.jpg";
import virginPlate from "../../assets/img/durer-virgin-st-john.jpg";
import cutSibyl from "../../assets/cut/cut-sibyl.png";
import cutMoses from "../../assets/cut/cut-moses.png";

// Technique 2: depth. Part 1 is the flat-table model of the baseline film: every sheet lies at the
// same depth and differs only by shadow height (z1..z4) and a tiny drift, while the camera pushes
// and trucks. The camera then pushes into one sheet until it fills the frame; part 2 is a true
// multiplane engraving (sky, city, figure, foreground cut-out) with real parallax and depth of field.
export const T02_DURATION = 420; // 14 s at 30 fps

const TABLE_END = 220;
const JOIN = 214; // frame where the full-frame plates take over from the sheet on the table
const FADE_FROM = 200;

// Shadow height on the table: a higher sheet casts a longer, softer shadow.
const SHADOW: Record<1 | 2 | 3 | 4, string> = {
  1: "0 6px 10px rgba(20,12,4,.4), 0 1px 2px rgba(20,12,4,.4)",
  2: "0 14px 20px rgba(20,12,4,.42), 0 2px 4px rgba(20,12,4,.4)",
  3: "0 26px 36px rgba(20,12,4,.44), 0 3px 6px rgba(20,12,4,.4)",
  4: "0 44px 60px rgba(20,12,4,.46), 0 4px 8px rgba(20,12,4,.4)",
};

// Sheet that sits on the table; `drift` px per second is the barely-there float of a loose paper.
const Piece: React.FC<{
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  z: 1 | 2 | 3 | 4;
  rotate?: number;
  drift?: [number, number];
}> = ({ src, left, top, width, height, z, rotate = 0, drift = [0, 0] }) => {
  const t = useCurrentFrame() / 30;
  return (
    <Img
      src={src}
      style={{
        position: "absolute",
        left: left + drift[0] * t,
        top: top + drift[1] * t,
        width,
        height,
        transform: `rotate(${rotate}deg)`,
        boxShadow: SHADOW[z],
      }}
    />
  );
};

const TABLE_KEYS: CamKey[] = [
  { frame: 0, x: 1100, y: 700, zoom: 1 },
  { frame: 100, x: 2000, y: 900, zoom: 1.12 }, // truck + push
  { frame: 112, x: 2000, y: 900, zoom: 1.12, ease: "glide" }, // brief hold
  { frame: 196, x: 3300, y: 1200, zoom: 2 }, // push into the sheet until it fills the frame
  { frame: TABLE_END, x: 3300, y: 1200, zoom: 2 },
];

// The 4-plane scene, authored in frame pixels; the camera holds until the table hands over.
const SCENE_KEYS: CamKey[] = [
  { frame: 0, x: 960, y: 540, zoom: 1 },
  { frame: JOIN, x: 960, y: 540, zoom: 1 },
  { frame: T02_DURATION, x: 1250, y: 500, zoom: 1.3, ease: "glide" },
];

// Inner image area of the Piranesi plate in the 2000x1394 scan, inside the printed border and above the
// caption; nothing outside this box (paper margin, plate line, lettering) is ever shown.
const PLATE = { x: 360, y: 215, w: 1590, h: 895 };
const PLATE_SRC = { w: 2000, h: 1394 };
const PAPER = "#e6dfcd";

/** A rectangle of the plate image area, `cropH` source px tall, scaled so the crop is `width` px wide. */
const PlateCrop: React.FC<{
  left: number;
  top: number;
  width: number;
  cropH?: number;
  style?: React.CSSProperties;
}> = ({ left, top, width, cropH = PLATE.h, style }) => {
  const s = width / PLATE.w;
  return (
    <div style={{ position: "absolute", left, top, width, height: cropH * s, overflow: "hidden", ...style }}>
      <Img
        src={piranesi}
        style={{
          position: "absolute",
          left: -PLATE.x * s,
          top: -PLATE.y * s,
          width: PLATE_SRC.w * s,
          height: PLATE_SRC.h * s,
          maxWidth: "none",
        }}
      />
    </div>
  );
};

// Overscan: each plane covers the whole frame at every pose it can reach, with margin for blur and
// motion smear. City (depth .55) sees x -0..1950, y 0..1080 at worst; sky (depth 1) a little less.
const Scene: React.FC = () => (
  <Multiplane
    camKeys={SCENE_KEYS}
    focus={0}
    dof={5}
    layers={[
      {
        depth: 1,
        children: (
          // Far plane: clouds only, fading into plain paper below, with a touch of haze.
          <div style={{ position: "absolute", left: -330, top: -50, width: 2544, height: 1182, background: PAPER }}>
            <PlateCrop
              left={0}
              top={0}
              width={2544}
              cropH={235}
              style={{ maskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "rgba(230,223,205,.28)" }} />
          </div>
        ),
      },
      {
        depth: 0.55,
        children: (
          // The plate's own sky fades out so the far sky plane shows behind the skyline.
          <PlateCrop
            left={-50}
            top={-40}
            width={2060}
            style={{ maskImage: "linear-gradient(to bottom, transparent 22%, #000 40%)" }}
          />
        ),
      },
      {
        depth: 0,
        children: (
          <Img
            src={cutSibyl}
            style={{
              position: "absolute",
              left: 1080,
              top: 250,
              width: 380,
              height: 791,
              filter: "drop-shadow(0 14px 14px rgba(20,12,4,.4))",
            }}
          />
        ),
      },
      {
        depth: -0.9,
        blur: 9,
        children: (
          <Img
            src={cutMoses}
            style={{
              position: "absolute",
              left: 1620,
              top: -260,
              width: 800,
              height: 1591,
              filter: "drop-shadow(0 30px 24px rgba(20,12,4,.35))",
            }}
          />
        ),
      },
    ]}
  />
);

export const T02Parallax: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [FADE_FROM, JOIN], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#cdbfa6" }}>
      <Sequence durationInFrames={TABLE_END} layout="none">
        <Camera keys={TABLE_KEYS}>
          <Piece src={piranesi} left={300} top={250} width={1500} height={1045} z={1} rotate={-1} drift={[3, 1]} />
          <Piece src={riders} left={1950} top={150} width={720} height={1021} z={3} rotate={1.5} drift={[-2, 2]} />
          <Piece src={sibylPlate} left={200} top={1350} width={760} height={987} z={2} rotate={-2} drift={[2, -2]} />
          <Piece src={genesis} left={1150} top={1500} width={640} height={899} z={4} rotate={2} drift={[-3, -1]} />
          <Piece src={virginPlate} left={2400} top={1450} width={560} height={868} z={2} rotate={-1} drift={[1, 2]} />
          {/* The sheet the camera pushes into: the same scene as part 2 at half size (960x540 = frame / 2). */}
          <div
            style={{
              position: "absolute",
              left: 2820,
              top: 930,
              width: 960,
              height: 540,
              overflow: "hidden",
              boxShadow: SHADOW[2],
            }}
          >
            <div style={{ width: 1920, height: 1080, transformOrigin: "0 0", transform: "scale(0.5)" }}>
              <Scene />
            </div>
          </div>
        </Camera>
      </Sequence>
      <AbsoluteFill style={{ opacity: fade }}>
        <Scene />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
