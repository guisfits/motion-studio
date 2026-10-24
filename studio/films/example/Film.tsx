import { useEffect, useState } from "react";
import { AbsoluteFill, Img, Sequence, continueRender, delayRender, useCurrentFrame } from "remotion";
import { Camera } from "../../../src/camera";
import { SetDown } from "../../../src/paper";
import { FONT_MONO, RevealWords, loadFace } from "../../../src/type";
import monoUrl from "../../../assets/fonts/JetBrainsMono-VF.ttf";
import mosesUrl from "../../../assets/img/dore-moses-sinai.jpg";
import mapUrl from "../../../assets/img/ortelius-1572-world-map.jpg";
import { CAMERA_DRIFT, CAMERA_KEYS, CAPTION, CHUNKS, GROUND, INK, PIECES, SHEET_PAD, SHEET_PAPER, type Chunk, type Piece } from "./scene";

export const EXAMPLE_FRAMES = 180;

const IMAGES: Record<string, string> = { moses: mosesUrl, map: mapUrl };

const Sheet: React.FC<{ piece: Piece }> = ({ piece }) => {
  const [x, y, w, h] = piece.rest;
  return (
    <Sequence from={piece.start} layout="none">
      <SetDown {...piece.carry} style={{ left: x, top: y, width: w, height: h }}>
        <div style={{ width: "100%", height: "100%", boxSizing: "border-box", padding: SHEET_PAD, background: SHEET_PAPER }}>
          <Img src={IMAGES[piece.id]} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      </SetDown>
    </Sequence>
  );
};

// A film is data (film.json) and constants (scene.ts) drawn by the technique components; trace.ts
// reports the same frames to the gates.
export const Film: React.FC = () => {
  const [handle] = useState(() => delayRender("Example fonts"));
  useEffect(() => {
    loadFace(FONT_MONO, monoUrl, "100 800")
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: GROUND }}>
      <Camera keys={CAMERA_KEYS} drift={CAMERA_DRIFT}>
        {PIECES.map((p) => (
          <Sheet key={p.id} piece={p} />
        ))}
      </Camera>
      {CHUNKS.map((c) => (
        <Chunk key={c.id} chunk={c} />
      ))}
    </AbsoluteFill>
  );
};

// Shown from its first word's travel until the next chunk; RevealWords reads the absolute frame, so
// the chunk is gated by the frame, not mounted in a Sequence.
const Chunk: React.FC<{ chunk: Chunk }> = ({ chunk }) => {
  const frame = useCurrentFrame();
  if (frame < chunk.from || frame >= chunk.to) return null;
  return (
    <RevealWords
      captions={chunk.words}
      size={CAPTION.size}
      enter={CAPTION.enter}
      style={{
        position: "absolute",
        left: CAPTION.centerX - CAPTION.width / 2,
        width: CAPTION.width,
        top: CAPTION.top,
        justifyContent: "center",
        fontSize: CAPTION.size,
        lineHeight: CAPTION.lineHeight,
        fontFamily: `"${FONT_MONO}", monospace`,
        fontWeight: CAPTION.weight,
        color: INK,
      }}
    />
  );
};
