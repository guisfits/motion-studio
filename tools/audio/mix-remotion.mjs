#!/usr/bin/env node
// Lays sound under a silent Remotion render: the composition's cues (src/audio/cues.ts, `Cue[]`
// as JSON) become an SFX stem through sfx.mjs, then mix.mjs balances SFX, voice and music around
// the voice, ducks the bed under it and normalises the whole to -14 LUFS.
//
//   node tools/audio/mix-remotion.mjs <silent.mp4> <vo.wav> <music.wav> <cues.json> <out.mp4>
//
// cues.json: [{ "at": 1.2, "sfx": "paper-place", "gain": 0.8 }] in composition seconds.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { mix } from "./mix.mjs";
import { renderSfx } from "./sfx.mjs";
import { writeWav } from "./wav.mjs";

// The render's length in seconds (the SFX stem is cut to it).
function durationOf(mp4) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4], {
    encoding: "utf8",
  });
  const d = Number(r.stdout);
  if (r.status !== 0 || !Number.isFinite(d)) throw new Error(`ffprobe could not read ${mp4}`);
  return d;
}

// Cue[] -> the {t, type, gain?} list sfx.mjs renders (same mapping as toSfxCues in cues.ts).
export const toSfxCues = (cues) =>
  cues.map(({ at, sfx, gain }) => (gain === undefined ? { t: at, type: sfx } : { t: at, type: sfx, gain }));

// Throws on a cue list the mix would silently drop or misplace: not an array, a cue without a
// finite non-negative `at` or a non-empty `sfx` name, a non-finite `gain`, or an `at` past `dur`
// (when given). An empty list is valid (a bed and voice only).
export function validateCues(cues, dur = Infinity) {
  if (!Array.isArray(cues)) throw new Error("cues must be an array of { at, sfx, gain? }");
  cues.forEach((c, i) => {
    const where = `cue ${i}${c && typeof c.sfx === "string" ? ` ("${c.sfx}")` : ""}`;
    if (!c || typeof c !== "object") throw new Error(`${where} is not an object`);
    if (typeof c.at !== "number" || !Number.isFinite(c.at) || c.at < 0) throw new Error(`${where}: "at" must be a finite number of seconds >= 0, got ${JSON.stringify(c.at)}`);
    if (typeof c.sfx !== "string" || !c.sfx) throw new Error(`${where}: "sfx" must be a sound name`);
    if (c.gain !== undefined && !(typeof c.gain === "number" && Number.isFinite(c.gain))) throw new Error(`${where}: "gain" must be a finite number`);
    if (c.at > dur) throw new Error(`${where} at ${c.at} s is past the end of the render (${dur.toFixed(2)} s)`);
  });
}

// Lays SFX (from `cues`), voice and music under the silent `video` and writes the mix to `out`.
export function mixRemotion({ video, voice, music, cues, out }) {
  const dur = durationOf(video);
  validateCues(cues, dur);
  const tmp = mkdtempSync(join(tmpdir(), "mix-remotion-"));
  try {
    let sfx;
    if (cues.length) {
      sfx = join(tmp, "sfx.wav");
      writeWav(sfx, [renderSfx(toSfxCues(cues), dur)]);
    }
    return mix({ video, out, voice, music, sfx });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [video, voice, music, cuesPath, out] = process.argv.slice(2);
  if (!out) {
    console.error("usage: mix-remotion.mjs <silent.mp4> <vo.wav> <music.wav> <cues.json> <out.mp4>");
    process.exit(2);
  }
  try {
    mixRemotion({ video, voice, music, cues: JSON.parse(readFileSync(cuesPath, "utf8")), out });
    console.log(`mix → ${out}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
