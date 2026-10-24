import { NORMS } from "../../tools/checks/norms.mjs";
import { layoutOf, type FilmFormat } from "./format";
import type { Trace, TraceAt, TraceFrame } from "./types";

export type SampleOptions = {
  format: FilmFormat;
  durationInFrames: number;
  fps?: number;
  /** [t0, t1] seconds: a closing house outro that puts nothing in the trace. */
  house?: [number, number];
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Walks `traceAt` over every frame and returns the trace the gates read. Boxes are in the
 * format's frame pixels. A `traceAt` that is not pure in the frame (it reads a clock, a random
 * number, or state carried from an earlier call) is refused: three frames are asked a second time,
 * out of order, and must answer the same.
 */
export function sampleTrace(traceAt: TraceAt, { format, durationInFrames, fps = NORMS.fps, house }: SampleOptions): Trace {
  if (!Number.isInteger(durationInFrames) || durationInFrames <= 0)
    throw new Error(`durationInFrames must be a positive integer, got ${durationInFrames}`);
  const { W, H, safe } = layoutOf(format);
  const frames: TraceFrame[] = [];
  for (let i = 0; i < durationInFrames; i++) {
    const f = traceAt(i);
    frames.push({ t: i / fps, items: f?.items as TraceFrame["items"], camera: f?.camera ?? null });
  }
  for (const i of [durationInFrames - 1, Math.floor(durationInFrames / 2), 0]) {
    const again = traceAt(i);
    const first = frames[i];
    if (!same({ items: again?.items, camera: again?.camera ?? null }, { items: first.items, camera: first.camera }))
      throw new Error(`traceAt is not pure: frame ${i} answered differently the second time`);
  }
  const trace: Trace = { W, H, dur: durationInFrames / fps, fps, safe, frames };
  if (house) trace.house = house;
  return trace;
}
