// What each frame of the film shows, from the same constants Film.tsx draws with (scene.ts) and
// the same pure functions its components draw from (viewAt, setDownPose, revealWord). Pure in the
// frame; the gates sample it with sampleTrace.
import {
  captionBox,
  captionItem,
  cameraTrace,
  projectBox,
  rotatedBox,
  shiftBox,
  type TraceAt,
  type TraceItem,
} from "../../../src/film";
import { viewAt } from "../../../src/camera/path";
import { setDownPose } from "../../../src/paper/set-down-pose";
import { revealWord } from "../../../src/type/reveal";
import { CAMERA_DRIFT, CAMERA_KEYS, CAPTION, CHUNKS, DURATION, FPS, H, INK, PIECES, W } from "./scene";

export const traceAt: TraceAt = (frame) => {
  const view = viewAt(CAMERA_KEYS, frame, { durationInFrames: DURATION, drift: CAMERA_DRIFT, fps: FPS });
  const items: TraceItem[] = [];

  for (const p of PIECES) {
    if (frame < p.start) continue;
    const pose = setDownPose(frame - p.start, FPS, W, H, p.carry);
    const world = rotatedBox(shiftBox(p.rest, pose.dx, pose.dy), pose.rotate);
    items.push({
      id: p.id,
      role: frame < p.heroUntil ? "hero" : "support",
      box: projectBox(world, view, W, H),
    });
  }

  for (const c of CHUNKS) {
    if (frame < c.from || frame >= c.to) continue;
    // Legible once its last word has landed: the least opaque word sets the chunk's alpha.
    const alpha = Math.min(
      ...c.words.map((w) => {
        const r = revealWord(frame, w.startMs, FPS, CAPTION.enter);
        return r.visible ? r.opacity : 0;
      }),
    );
    const box = captionBox(
      c.words.map((w) => w.text.trim()),
      CAPTION.size,
      { centerX: CAPTION.centerX, top: CAPTION.top, lineHeight: CAPTION.lineHeight, maxWidth: CAPTION.width },
    );
    items.push(captionItem(c.id, c.text, box, { size: CAPTION.size, color: INK, alpha }));
  }

  return { items, camera: cameraTrace(view) };
};
