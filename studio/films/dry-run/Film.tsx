import { useEffect, useState } from "react";
import { AbsoluteFill, Img, Sequence, continueRender, delayRender, useCurrentFrame } from "remotion";
import { Camera } from "../../../src/camera";
import { SetDown } from "../../../src/paper";
import { FONT_MONO, RevealWords, loadFace } from "../../../src/type";
import monoUrl from "../../../assets/fonts/JetBrainsMono-VF.ttf";
import mapUrl from "../../../assets/img/ortelius-1572-world-map.jpg";
import townUrl from "../../../assets/img/merian-alsatiae.jpg";
import pageUrl from "../../../assets/img/gutenberg-genesis.jpg";
import printUrl from "../../../assets/img/durer-four-riders.jpg";
import {
  CAMERA_DRIFT, CAMERA_KEYS, CAPTION, CHUNKS, GROUND, INK, PIECES, PLATE, PLATE_FROM, PLATE_TO, SHEET_PAD, SHEET_PAPER,
  type Chunk, type Piece,
} from "./scene";

const IMAGES: Record<string, string> = {
  "map-ortelius-1572": mapUrl,
  "town-merian-1644": townUrl,
  "page-gutenberg-1455": pageUrl,
  "print-durer-1498": printUrl,
};

const Sheet: React.FC<{ piece: Piece }> = ({ piece }) => {
  const [x, y, w, h] = piece.rest;
  return (
    <Sequence from={piece.start} layout="none">
      <SetDown {...piece.carry} shadow={piece.shadow} style={{ left: x, top: y, width: w, height: h }}>
        <div style={{ width: "100%", height: "100%", boxSizing: "border-box", padding: SHEET_PAD, background: SHEET_PAPER }}>
          <Img src={IMAGES[piece.id]} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      </SetDown>
    </Sequence>
  );
};

export const Film: React.FC = () => {
  const [handle] = useState(() => delayRender("DryRun fonts"));
  useEffect(() => {
    loadFace(FONT_MONO, monoUrl, "100 800")
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: GROUND }}>
      <Camera keys={CAMERA_KEYS} drift={CAMERA_DRIFT}>
        {PIECES.map((p) => (
          <Sheet key={p.id} piece={p} />
        ))}
      </Camera>
      {frame >= PLATE_FROM && frame < PLATE_TO && (
        <div
          style={{
            position: "absolute",
            left: PLATE[0],
            top: PLATE[1],
            width: PLATE[2],
            height: PLATE[3],
            background: SHEET_PAPER,
            boxShadow: "4px 6px 14px rgba(20,12,6,0.35)",
          }}
        />
      )}
      {CHUNKS.map((c) => (
        <ChunkText key={c.id} chunk={c} />
      ))}
    </AbsoluteFill>
  );
};

const ChunkText: React.FC<{ chunk: Chunk }> = ({ chunk }) => {
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
