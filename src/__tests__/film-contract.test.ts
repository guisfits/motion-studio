import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  captionBox,
  projectBox,
  rotatedBox,
  sampleTrace,
  shotAt,
  type Sheet,
  type TraceAt,
  type TraceItem,
} from "../film";
import { checkFilm, stageFromEnv, writeChecks, type CheckFilmInput } from "../film/gate";
import { traceAt as exampleTraceAt } from "../../studio/films/example/trace";
import film from "../../studio/films/example/film.json";

const sheet = film.sheet as Sheet;
const OPTS = { format: "9x16", durationInFrames: film.durationInFrames, fps: film.fps } as const;

// The example film is the fixture: a trace known to pass, mutated one way at a time.
const mutate = (fn: (items: TraceItem[], frame: number) => TraceItem[]): TraceAt => (frame) => {
  const f = exampleTraceAt(frame);
  return { ...f, items: fn(f.items, frame) };
};

const run = (traceAt: TraceAt, extra: Partial<CheckFilmInput> = {}) =>
  checkFilm({
    stage: "draft",
    sheet,
    manifest: film.manifest,
    words: film.words,
    length: film.length,
    trace: sampleTrace(traceAt, OPTS),
    ...extra,
  });
const codes = (fs: { severity: string; code: string }[], severity: string) =>
  fs.filter((f) => f.severity === severity).map((f) => f.code);

describe("sampleTrace", () => {
  it("samples every frame at t = frame / fps in the format's frame, with its safe box", () => {
    const tr = sampleTrace(exampleTraceAt, OPTS);
    expect(tr.frames).toHaveLength(180);
    expect(tr.frames[45].t).toBeCloseTo(1.5);
    expect([tr.W, tr.H, tr.dur, tr.fps]).toEqual([1080, 1920, 6, 30]);
    expect(tr.safe).toEqual([70, 220, 845, 1300]);
    expect(tr.house).toBeUndefined();
    expect(sampleTrace(exampleTraceAt, { ...OPTS, house: [5, 6] }).house).toEqual([5, 6]);
  });

  it("refuses a traceAt that is not pure in the frame", () => {
    let calls = 0;
    const impure: TraceAt = () => ({ items: [{ id: "a", role: "hero", box: [0, 0, 10, 10], alpha: calls++ % 2 }] });
    expect(() => sampleTrace(impure, OPTS)).toThrow(/not pure/);
  });

  it("refuses a duration that is not a positive whole number of frames", () => {
    expect(() => sampleTrace(exampleTraceAt, { ...OPTS, durationInFrames: 0 })).toThrow(/durationInFrames/);
    expect(() => sampleTrace(exampleTraceAt, { ...OPTS, durationInFrames: 2.5 })).toThrow(/durationInFrames/);
  });
});

describe("geometry", () => {
  it("rotates a box about its centre and projects it through the camera", () => {
    expect(rotatedBox([0, 0, 100, 50], 0)).toEqual([0, 0, 100, 50]);
    const [x, y, w, h] = rotatedBox([0, 0, 100, 50], 90);
    expect([x, y, w, h].map(Math.round)).toEqual([25, -25, 50, 100]);
    // Identity camera: the world is the frame.
    expect(projectBox([10, 20, 30, 40], { x: 540, y: 960, zoom: 1, rotate: 0 }, 1080, 1920)).toEqual([10, 20, 30, 40]);
    // Zoom 2 on a point: a box centred on the camera doubles about the frame centre.
    expect(projectBox([490, 910, 100, 100], { x: 540, y: 960, zoom: 2, rotate: 0 }, 1080, 1920)).toEqual([440, 860, 200, 200]);
  });

  it("sizes a mono caption from its metrics and counts hard cuts", () => {
    const [x, , w, h] = captionBox(["ab", "cd"], 100, { centerX: 500, top: 0 });
    expect(w).toBeCloseTo(2 * 2 * 0.6 * 100 + 0.3 * 100);
    expect(x).toBeCloseTo(500 - w / 2);
    expect(h).toBeCloseTo(130);
    expect(shotAt([30, 90], 29)).toBe(0);
    expect(shotAt([30, 90], 30)).toBe(1);
    expect(shotAt([30, 90], 120)).toBe(2);
  });
});

describe("checkFilm", () => {
  it("passes the example film at sheet and draft with nothing above yellow", () => {
    for (const stage of ["sheet", "draft"] as const) {
      const fs = run(exampleTraceAt, { stage });
      expect([stage, codes(fs, "red"), codes(fs, "orange")]).toEqual([stage, [], []]);
    }
  });

  it("adds R3 (spoken words per event) at animatic: the example speaks too slowly for it", () => {
    const fs = run(exampleTraceAt, { stage: "animatic" });
    expect([codes(fs, "red"), codes(fs, "orange")]).toEqual([[], ["R3"]]);
  });

  it("runs only the paper at `sheet`, and needs a trace from `animatic` on", () => {
    expect(run(exampleTraceAt, { stage: "sheet", trace: undefined })).not.toContainEqual(expect.objectContaining({ severity: "red" }));
    expect(codes(run(exampleTraceAt, { stage: "draft", trace: undefined }), "red")).toEqual(["T0"]);
  });

  it("reads the fact-check at `script` alone and at `final`", () => {
    expect(codes(checkFilm({ stage: "script", sheet, manifest: film.manifest, words: film.words }), "red")).toEqual(["X1"]);
    expect(codes(run(exampleTraceAt, { stage: "final" }), "red")).toContain("X1");
    expect(codes(run(exampleTraceAt, { stage: "draft" }), "red")).not.toContain("X1");
  });

  it("holds the film to the register's length unless film.json overrides it, and says so", () => {
    expect(codes(run(exampleTraceAt, { length: undefined }), "red")).toEqual(["F1"]);
    expect(run(exampleTraceAt)).toContainEqual(expect.objectContaining({ severity: "yellow", code: "F1" }));
  });

  it("says contrast was not read when there is no render, and reads the pixels when there is", () => {
    expect(run(exampleTraceAt)).toContainEqual(expect.objectContaining({ severity: "yellow", code: "T11" }));
    const paper = Buffer.from(Array.from({ length: 30 }, () => [236, 228, 212]).flat());
    const ink = Buffer.from(Array.from({ length: 30 }, () => [29, 26, 22]).flat());
    expect(codes(run(exampleTraceAt, { sampler: () => paper }), "red")).toEqual([]);
    // The caption's own colour behind it: nothing to read.
    expect(codes(run(exampleTraceAt, { sampler: () => ink }), "red")).toEqual(["T11", "T11", "T11", "T11"]);
  });

  // Mutation proofs: each break of the trace turns exactly the gate that guards it red.
  describe("goes red when the trace is broken", () => {
    it("caption cap height too small (T10)", () => {
      const fs = run(mutate((items) => items.map((i) => (i.role === "caption" ? { ...i, cap: i.cap! * 0.5 } : i))));
      expect(codes(fs, "red")).toContain("T10");
    });

    it("hero late: the picture is not up by its key word (H1)", () => {
      // The map is withdrawn until 0.1 s after "world" is spoken.
      const late = Math.round(4.65 * 30) + 3;
      const fs = run(mutate((items, f) => (f < late ? items.filter((i) => i.id !== "map") : items)));
      expect(codes(fs, "red")).toContain("H1");
    });

    it("caption never fully legible (T2)", () => {
      const fs = run(mutate((items) => items.map((i) => (i.role === "caption" ? { ...i, alpha: 0.5 } : i))));
      expect(codes(fs, "red")).toContain("T2");
    });

    it("caption crossing the frame edge (T4)", () => {
      const fs = run(mutate((items) => items.map((i) => (i.role === "caption" ? { ...i, box: [-40, i.box[1], i.box[2], i.box[3]] } : i))));
      expect(codes(fs, "red")).toContain("T4");
    });

    it("pieces cover almost nothing (T5)", () => {
      const fs = run(mutate((items) => items.map((i) => (i.role === "caption" ? i : { ...i, box: [500, 900, 20, 20] }))));
      expect(codes(fs, "red")).toContain("T5");
    });

    it("a picture that is not a licensed manifest asset (P1)", () => {
      const fs = run(mutate((items) => items.map((i) => (i.id === "map" ? { ...i, id: "placeholder" } : i))));
      expect(codes(fs, "red")).toContain("P1");
    });

    it("a sheet that pops in place instead of being set down (T12, orange)", () => {
      const fs = run(mutate((items, f) => items.map((i) => (i.id === "map" && f >= 90 ? { ...i, box: [160, 608, 760, 525] } : i))));
      expect(codes(fs, "orange")).toContain("T12");
    });

    it("a malformed item cannot slip past the gates (T0)", () => {
      const fs = run(mutate((items) => items.map((i) => (i.id === "moses" ? { ...i, box: [0, 0, NaN, 10] } : i))));
      expect(codes(fs, "red")).toEqual(["T0"]);
    });
  });
});

describe("the report", () => {
  it("writes crew/checks-<stage>.md and .json, the same every time", () => {
    const dir = mkdtempSync(join(tmpdir(), "film-"));
    try {
      const fs = run(exampleTraceAt);
      const md = writeChecks(dir, "draft", fs);
      const again = writeChecks(dir, "draft", fs);
      expect(again).toBe(md);
      expect(readFileSync(join(dir, "crew", "checks-draft.md"), "utf8")).toBe(md);
      expect(md).toMatch(/^# Checks — draft\n\nPASS — 🔴 0 🟠 0 🟡 2\n/);
      expect(JSON.parse(readFileSync(join(dir, "crew", "checks-draft.json"), "utf8")).summary.pass).toBe(true);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  it("reads the stage from FILM_STAGE and stops on an unknown one", () => {
    expect(stageFromEnv("draft", {})).toBe("draft");
    expect(stageFromEnv("draft", { FILM_STAGE: "final" })).toBe("final");
    expect(() => stageFromEnv("draft", { FILM_STAGE: "drafts" })).toThrow(/FILM_STAGE/);
  });
});
