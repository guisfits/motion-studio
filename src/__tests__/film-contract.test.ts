import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  captionBox,
  projectBox,
  rotatedBox,
  sampleTrace,
  shotAt,
  type TraceAt,
  type TraceItem,
} from "../film";
import { checkFilm, lengthReason, loadFilm, runFilmGate, runStageGate, stageFromEnv, writeChecks, type CheckFilmInput, type SfxCue, type SoundInput } from "../film/gate";
import { traceAt as exampleTraceAt } from "../../studio/films/example/trace";
const exampleDir = fileURLToPath(new URL("../../studio/films/example", import.meta.url));
const film = loadFilm(exampleDir);
const sheet = film.sheet;
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
    lengthReason: "a test film",
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
    // RevealWords wraps a line wider than its box: a one-line trace box would then describe a
    // caption nobody sees, so captionBox refuses it.
    const long = "porque Deus amou o mundo".split(" ");
    expect(() => captionBox(long, 68, { centerX: 540, top: 0, maxWidth: 845 })).toThrow(/wrap/);
    expect(captionBox(["The", "law"], 68, { centerX: 540, top: 0, maxWidth: 845 })[2]).toBeLessThan(845);
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

  it("makes a length override orange until crew/animation-notes.md gives the reason", () => {
    const f1 = (extra: Partial<CheckFilmInput>) => run(exampleTraceAt, { stage: "sheet", ...extra }).filter((f) => f.code === "F1");
    expect(f1({ lengthReason: undefined })).toEqual([expect.objectContaining({ severity: "orange", msg: expect.stringContaining("animation-notes.md") })]);
    expect(f1({ lengthReason: "  " })).toEqual([expect.objectContaining({ severity: "orange" })]);
    expect(f1({ lengthReason: "a 6 s test film" })).toEqual([expect.objectContaining({ severity: "yellow" })]);
  });

  it("reads the reason from the first `length:` line of animation-notes.md", () => {
    expect(lengthReason("# Notes\nlength: a 6 s spot\nF1: other")).toBe("a 6 s spot");
    expect(lengthReason("Length:   spot  ")).toBe("spot");
    expect(lengthReason("length:\nF1: length override")).toBeUndefined();
    expect(lengthReason("F1: length: not at the line start")).toBeUndefined();
    expect(lengthReason(null)).toBeUndefined();
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

// The final stage's sound gates (M2–M6), ported from the old run.mjs. The example speaks "law" over
// 0.5–0.95 s and "came" over 1.4–1.7 s; 1.1 s is a gap, 0.7 s is inside a word.
describe("final sound gates", () => {
  const sha = (cues: SfxCue[]) => createHash("sha256").update(JSON.stringify(cues)).digest("hex");
  const inGap: SfxCue = { t: 1.1, type: "click", gain: 1, len: 0.1 };
  const onWord: SfxCue = { t: 0.7, type: "click", gain: 1, len: 0.1 };
  const IN_RANGE = { I: -14, LRA: 1 };
  // A stem rendered from `cues` (sidecar hashed from them) and a mix inside the norms.
  const sound = (cues: SfxCue[] | null, over: Partial<SoundInput> = {}): SoundInput => ({
    cues,
    cueSha256: cues && sha(cues),
    hasStem: !!cues,
    sidecar: cues && { sha256: sha(cues), cues },
    loudness: IN_RANGE,
    ...over,
  });
  const final = (s?: SoundInput) => run(exampleTraceAt, { stage: "final", sound: s });
  // The sound gates only: the example has no signed fact-check, which is X1 at final.
  const soundCodes = (fs: ReturnType<typeof final>, severity: string) => codes(fs, severity).filter((c) => /^M/.test(c));

  it("is clean for a cue in a gap with a traceable stem and a mix at -14 LUFS", () => {
    const fs = final(sound([inGap]));
    expect(soundCodes(fs, "red")).toEqual([]);
    expect(soundCodes(fs, "orange")).toEqual([]);
    expect(soundCodes(fs, "yellow")).toEqual([]);
  });

  it("is clean for a film with no SFX at all", () => {
    expect(soundCodes(final(sound(null)), "red")).toEqual([]);
  });

  it("does not run before `final`", () => {
    const fs = run(exampleTraceAt, { stage: "draft", sound: sound([onWord], { loudness: { I: -30, LRA: 9 } }) });
    expect(fs.filter((f) => /^M/.test(f.code))).toEqual([]);
  });

  it("M5 orange: a cue sounding over a spoken word", () => {
    const fs = final(sound([onWord]));
    expect(soundCodes(fs, "orange")).toEqual(["M5"]);
    expect(soundCodes(fs, "red")).toEqual([]);
    expect(fs).toContainEqual(expect.objectContaining({ code: "M5", t: 0.7, msg: expect.stringContaining('"law"') }));
  });

  it("M5 reads the lead-in of the recording (preOf) and judges the sidecar's thinned list", () => {
    const early: SfxCue = { t: 1.3, type: "whoosh", len: 0 };
    expect(soundCodes(final(sound([early])), "orange")).toEqual([]);
    expect(soundCodes(final(sound([early], { preOf: () => 0.4 })), "orange")).toEqual(["M5"]);
    // thinning dropped the cue on the word from the stem: the sidecar is what was mixed
    const kept = [inGap];
    const crew = [onWord, inGap];
    expect(soundCodes(final(sound(crew, { sidecar: { sha256: sha(crew), cues: kept } })), "orange")).toEqual([]);
  });

  it("M4 red: more cues in a 4 s window than the cap", () => {
    const cues: SfxCue[] = [1.0, 1.1, 1.2].map((t) => ({ t, type: "click", len: 0 }));
    expect(soundCodes(final(sound(cues)), "red")).toContain("M4");
  });

  it("M6 red: a stem without its cue list, without a sidecar, or from another list", () => {
    expect(soundCodes(final(sound(null, { hasStem: true })), "red")).toEqual(["M6"]);
    expect(soundCodes(final(sound([inGap], { sidecar: null })), "red")).toEqual(["M6"]);
    expect(soundCodes(final(sound([inGap], { sidecar: { sha256: "stale", cues: [inGap] } })), "red")).toEqual(["M6"]);
  });

  it("M2 red / M3 orange: loudness outside the norms, judged separately", () => {
    expect(soundCodes(final(sound([inGap], { loudness: { I: -20, LRA: 1 } })), "red")).toEqual(["M2"]);
    expect(soundCodes(final(sound([inGap], { loudness: { I: -12.5, LRA: 1 } })), "red")).toEqual(["M2"]);
    expect(soundCodes(final(sound([inGap], { loudness: { I: -14, LRA: 4 } })), "orange")).toEqual(["M3"]);
    expect(soundCodes(final(sound([inGap], { loudness: { I: -14, LRA: 4 } })), "red")).toEqual([]);
    // a reading that could not be parsed is a finding, never a pass
    expect(soundCodes(final(sound([inGap], { loudness: { I: NaN, LRA: NaN } })), "red")).toEqual(["M2"]);
  });

  it("says so (yellow) when there is no mixed file or no sound input to read", () => {
    expect(final(sound([inGap], { loudness: undefined }))).toContainEqual(expect.objectContaining({ severity: "yellow", code: "M2" }));
    expect(final(undefined)).toContainEqual(expect.objectContaining({ severity: "yellow", code: "M2" }));
  });

  describe("runFilmGate reads the files", () => {
    const tone = (path: string, volume: number) => {
      const r = spawnSync(
        "ffmpeg",
        ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc=d=6:s=64x64:r=30", "-f", "lavfi", "-i", `sine=f=440:d=6,volume=${volume}`, "-shortest", "-pix_fmt", "yuv420p", "-c:a", "aac", path],
        { encoding: "utf8" },
      );
      if (r.status !== 0) throw new Error(r.stderr);
    };
    // A copy of the example film folder holding only film.json, so each case adds its own files.
    const withFilm = (fn: (dir: string) => void) => {
      const dir = mkdtempSync(join(tmpdir(), "film-final-"));
      try {
        writeFileSync(join(dir, "film.json"), JSON.stringify(film));
        mkdirSync(join(dir, "crew"));
        mkdirSync(join(dir, "out"));
        fn(dir);
      } finally {
        rmSync(dir, { recursive: true });
      }
    };
    const gate = (dir: string) => runFilmGate({ dir, traceAt: exampleTraceAt, stage: "final", write: false });
    const sound_ = (r: ReturnType<typeof gate>, severity: string) => r.findings.filter((f) => f.severity === severity && (/^M/.test(f.code) || (f.code === "F2" && f.msg.includes("final")))).map((f) => f.code);

    it("a missing mixed cut is red F2, named after the format", () => {
      withFilm((dir) => {
        const r = gate(dir);
        expect(r.findings).toContainEqual(expect.objectContaining({ severity: "red", code: "F2", msg: "missing out/final-9x16.mp4" }));
      });
    });

    it("measures the mixed cut: -14 LUFS passes, a quiet one is M2", () => {
      withFilm((dir) => {
        tone(join(dir, "out", "final-9x16.mp4"), 2.45);
        expect(sound_(gate(dir), "red")).toEqual([]);
        tone(join(dir, "out", "final-9x16.mp4"), 0.5);
        expect(sound_(gate(dir), "red")).toEqual(["M2"]);
      });
    });

    it("accepts out/final.mp4 when there is no format-named file", () => {
      withFilm((dir) => {
        tone(join(dir, "out", "final.mp4"), 2.45);
        expect(sound_(gate(dir), "red")).toEqual([]);
      });
    });

    it("reads the silent render as out/silent-<format>.mp4, the name the crew skills write", () => {
      withFilm((dir) => {
        const silentF2 = () => gate(dir).findings.filter((f) => f.code === "F2" && f.msg.includes("silent"));
        expect(silentF2()).not.toEqual([]);
        tone(join(dir, "out", "silent-9x16.mp4"), 2.45);
        expect(silentF2()).toEqual([]);
      });
    });

    // The draft gate judges the draft render (picture lock), not the silent master rendered after it.
    it("reads the draft render at `draft`: out/draft-<format>.mp4, else out/draft.mp4, never the silent master", () => {
      withFilm((dir) => {
        const draft = (requireRender = false) => runFilmGate({ dir, traceAt: exampleTraceAt, stage: "draft", write: false, requireRender });
        const f2 = () => draft().findings.filter((f) => f.code === "F2");
        tone(join(dir, "out", "silent-9x16.mp4"), 2.45);
        expect(f2()).toEqual([expect.objectContaining({ severity: "yellow", msg: expect.stringContaining("out/draft-9x16.mp4") })]);
        // Under the gate command (FILM_STAGE=draft) the same missing render is red.
        const gated = draft(true);
        expect(gated.findings.filter((f) => f.code === "F2")).toEqual([expect.objectContaining({ severity: "red", msg: "missing out/draft-9x16.mp4" })]);
        expect(gated.summary.pass).toBe(false);
        tone(join(dir, "out", "draft.mp4"), 2.45);
        expect(f2()).toEqual([]);
        rmSync(join(dir, "out", "draft.mp4"));
        tone(join(dir, "out", "draft-9x16.mp4"), 2.45);
        expect(f2()).toEqual([]);
      });
    });

    it("reads crew/sfx-cues.json, out/sfx.wav and its sidecar: stale hash is M6, a cue on a word is M5", () => {
      withFilm((dir) => {
        tone(join(dir, "out", "final-9x16.mp4"), 2.45);
        const cues = [onWord];
        const bytes = JSON.stringify(cues);
        writeFileSync(join(dir, "crew", "sfx-cues.json"), bytes);
        writeFileSync(join(dir, "out", "sfx.wav"), "");
        const sha256 = createHash("sha256").update(bytes).digest("hex");
        writeFileSync(join(dir, "out", "sfx.wav.cues.json"), JSON.stringify({ sha256, cues }));
        let r = gate(dir);
        expect(sound_(r, "orange")).toEqual(["M5"]);
        expect(sound_(r, "red")).toEqual([]);
        writeFileSync(join(dir, "out", "sfx.wav.cues.json"), JSON.stringify({ sha256: "stale", cues }));
        expect(sound_(gate(dir), "red")).toEqual(["M6"]);
        writeFileSync(join(dir, "out", "sfx.wav.cues.json"), "not json");
        expect(sound_(gate(dir), "red")).toEqual(["M6"]);
        rmSync(join(dir, "crew", "sfx-cues.json"));
        r = gate(dir);
        expect(sound_(r, "red")).toEqual(["M6"]);
      });
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

describe("the stage gate on any folder", () => {
  // A folder outside the repo holding only the crew's files: no film.json, no film.test.ts.
  const crewOnly = (fn: (dir: string) => void | Promise<void>) => async () => {
    const dir = mkdtempSync(join(tmpdir(), "film-crew-"));
    try {
      mkdirSync(join(dir, "crew"));
      mkdirSync(join(dir, "voice"));
      writeFileSync(join(dir, "crew", "sync-sheet.json"), JSON.stringify(film.sheet));
      writeFileSync(join(dir, "crew", "manifest.json"), JSON.stringify(film.manifest));
      writeFileSync(join(dir, "voice", "words.json"), JSON.stringify(film.words));
      await fn(dir);
    } finally {
      rmSync(dir, { recursive: true });
    }
  };
  const reds = (r: { findings: { severity: string; code: string }[] }) => codes(r.findings, "red");

  it("runs `sheet` on crew/sync-sheet.json + manifest + words alone and writes crew/checks-sheet.md", crewOnly(async (dir) => {
    const r = await runStageGate({ dir, stage: "sheet" });
    expect(readFileSync(join(dir, "crew", "checks-sheet.md"), "utf8")).toBe(r.markdown);
    // The example's six seconds are short of the register's norm; nothing else is wrong with its paper.
    expect(reds(r)).toEqual(["F1"]);
    writeFileSync(join(dir, "film.json"), JSON.stringify({ id: "X", format: "9x16", fps: 30, durationInFrames: 180, length: film.length }));
    expect((await runStageGate({ dir, stage: "sheet" })).summary.pass).toBe(true);
  }));

  it("goes red on a bad sheet: a hero that is not in the manifest (S2)", crewOnly(async (dir) => {
    writeFileSync(join(dir, "crew", "manifest.json"), JSON.stringify({ assets: [] }));
    const r = await runStageGate({ dir, stage: "sheet" });
    expect(reds(r)).toContain("S2");
    expect(readFileSync(join(dir, "crew", "checks-sheet.md"), "utf8")).toContain("S2");
  }));

  it("takes FILM_DIR relative to the working directory and the stage from FILM_STAGE", crewOnly(async (dir) => {
    const r = await runStageGate({ env: { FILM_DIR: relative(process.cwd(), dir), FILM_STAGE: "sheet" } });
    expect(r.stage).toBe("sheet");
    await expect(runStageGate({ env: { FILM_DIR: dir } })).rejects.toThrow(/FILM_STAGE/);
    await expect(runStageGate({ env: { FILM_STAGE: "sheet" } })).rejects.toThrow(/FILM_DIR/);
    await expect(runStageGate({ env: { FILM_DIR: join(dir, "nope"), FILM_STAGE: "sheet" } })).rejects.toThrow(/does not exist/);
  }));

  it("names the paper a stage cannot read: red F0, and `script` needs none of it", crewOnly(async (dir) => {
    rmSync(join(dir, "crew", "manifest.json"));
    const r = await runStageGate({ dir, stage: "sheet" });
    expect(r.findings).toEqual([expect.objectContaining({ severity: "red", code: "F0", msg: expect.stringContaining("crew/manifest.json") })]);
    expect(reds(await runStageGate({ dir, stage: "script" }))).toEqual(["X1"]);
    expect(reds(await runStageGate({ dir, stage: "animatic" }))).toEqual(["F0", "F0"]);
  }));

  it("refuses a sheet held twice: inline in film.json and again in crew/sync-sheet.json", crewOnly(async (dir) => {
    writeFileSync(join(dir, "film.json"), JSON.stringify({ id: "X", format: "9x16", fps: 30, durationInFrames: 180, length: film.length, sheet: film.sheet }));
    const r = await runStageGate({ dir, stage: "sheet" });
    expect(r.findings).toEqual([expect.objectContaining({ severity: "red", code: "F0", msg: expect.stringContaining("keep one copy") })]);
  }));

  it("refuses a sheet held twice under another path: film.json points elsewhere while the crew file exists", crewOnly(async (dir) => {
    writeFileSync(join(dir, "stale-sheet.json"), JSON.stringify(film.sheet));
    writeFileSync(join(dir, "film.json"), JSON.stringify({ id: "X", format: "9x16", fps: 30, durationInFrames: 180, length: film.length, sheet: "stale-sheet.json" }));
    const r = await runStageGate({ dir, stage: "sheet" });
    expect(r.findings).toEqual([expect.objectContaining({ severity: "red", code: "F0", msg: expect.stringContaining("keep one copy") })]);
    writeFileSync(join(dir, "film.json"), JSON.stringify({ id: "X", format: "9x16", fps: 30, durationInFrames: 180, length: film.length, sheet: "./crew/sync-sheet.json" }));
    expect((await runStageGate({ dir, stage: "sheet" })).summary.pass).toBe(true);
  }));

  it("names the clock a trace stage needs but film.json leaves out, instead of defaulting it", crewOnly(async (dir) => {
    writeFileSync(join(dir, "film.json"), JSON.stringify({ id: "X", fps: 30, length: film.length }));
    const r = await runStageGate({ dir, stage: "animatic", traceAt: exampleTraceAt });
    expect(r.findings).toEqual([
      expect.objectContaining({ severity: "red", code: "F0", msg: expect.stringContaining("film.json format") }),
      expect.objectContaining({ severity: "red", code: "F0", msg: expect.stringContaining("film.json durationInFrames") }),
    ]);
    // `sheet` has no use for the clock.
    expect((await runStageGate({ dir, stage: "sheet" })).summary.pass).toBe(true);
  }));

  it("imports <dir>/trace.ts for a trace stage, and is red T0 without it", crewOnly(async (dir) => {
    writeFileSync(join(dir, "film.json"), JSON.stringify({ id: "X", format: "9x16", fps: 30, durationInFrames: 180, length: film.length }));
    expect(reds(await runStageGate({ dir, stage: "animatic" }))).toEqual(["T0"]);
    writeFileSync(join(dir, "trace.ts"), "export const traceAt = (frame: number) => ({ items: [] as never[], frame });\n");
    const r = await runStageGate({ dir, stage: "animatic" });
    expect(reds(r)).not.toContain("T0");
    expect(reds(r)).toContain("T5");
  }));

  it("reads the gate command from FILM_STAGE: red F2 at draft with it, yellow in a plain run", crewOnly((dir) => {
    writeFileSync(join(dir, "film.json"), JSON.stringify({ id: "X", format: "9x16", fps: 30, durationInFrames: 180, length: film.length }));
    const f2 = () => runFilmGate({ dir, traceAt: exampleTraceAt, stage: "draft" }).findings.filter((f) => f.code === "F2");
    vi.stubEnv("FILM_STAGE", "");
    expect(f2()).toEqual([expect.objectContaining({ severity: "yellow" })]);
    vi.stubEnv("FILM_STAGE", "draft");
    try {
      expect(f2()).toEqual([expect.objectContaining({ severity: "red", msg: "missing out/draft-9x16.mp4" })]);
    } finally {
      vi.unstubAllEnvs();
    }
  }));

  it("is red F2 at draft without a render under the gate command", crewOnly(async (dir) => {
    writeFileSync(join(dir, "film.json"), JSON.stringify({ id: "X", format: "9x16", fps: 30, durationInFrames: 180, length: film.length }));
    const r = await runStageGate({ dir, stage: "draft", traceAt: exampleTraceAt });
    expect(r.findings).toContainEqual(expect.objectContaining({ severity: "red", code: "F2", msg: "missing out/draft-9x16.mp4" }));
  }));
});
