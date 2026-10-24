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

export function mixRemotion({ video, voice, music, cues, out }) {
  const dur = durationOf(video);
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
