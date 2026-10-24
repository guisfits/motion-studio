// What each frame shows, from scene.ts constants and the same pure functions Film.tsx draws with.
import {
  captionBox,
  captionItem,
  cameraTrace,
  projectBox,
  rotatedBox,
  shiftBox,
  shotAt,
  type TraceAt,
  type TraceItem,
} from "../../../src/film";
import { viewAt } from "../../../src/camera/path";
import { setDownPose } from "../../../src/paper/set-down-pose";
import { revealWord } from "../../../src/type/reveal";
import {
  CAMERA_DRIFT, CAMERA_KEYS, CAPTION, CHUNKS, CUT_FRAMES, DURATION, FPS, GROUND_BOX, H, INK, PARTS, PIECES, PLATE,
  PLATE_FROM, PLATE_TO, W,
} from "./scene";
import sheet from "./crew/sync-sheet.json";

const TARGET_ROW = sheet.beats[1];
const TARGET_FROM = Math.round(TARGET_ROW.key[0].t * FPS);
const TARGET_BOX = PARTS[TARGET_ROW.zoom?.target ?? ""];
if (!TARGET_BOX) throw new Error(`dry-run: beat ${TARGET_ROW.id} has no zoom target in PARTS`);

export const traceAt: TraceAt = (frame) => {
  const view = viewAt(CAMERA_KEYS, frame, { durationInFrames: DURATION, drift: CAMERA_DRIFT });
  const items: TraceItem[] = [{ id: "ground-1", role: "ground", box: GROUND_BOX }];

  for (const p of PIECES) {
    if (frame < p.start) continue;
    const pose = setDownPose(frame - p.start, FPS, W, H, p.carry);
    const world = rotatedBox(shiftBox(p.rest, pose.dx, pose.dy), pose.rotate);
    const role = frame >= p.heroFrom && frame < p.heroUntil ? "hero" : "support";
    items.push({ id: p.id, role, box: projectBox(world, view, W, H) });
  }

  if (frame >= TARGET_FROM) {
    items.push({ id: `${TARGET_ROW.id}-target`, role: "target", box: projectBox(TARGET_BOX, view, W, H) });
  }

  if (frame >= PLATE_FROM && frame < PLATE_TO) items.push({ id: "ground-plate", role: "ground", box: PLATE });

  for (const c of CHUNKS) {
    if (frame < c.from || frame >= c.to) continue;
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

  return { items, camera: cameraTrace(view, shotAt(CUT_FRAMES, frame)) };
};
