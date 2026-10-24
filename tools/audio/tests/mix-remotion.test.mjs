import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loudness } from "../../checks/media.mjs";
import { mixRemotion, validateCues } from "../mix-remotion.mjs";

const studio = fileURLToPath(new URL("../../..", import.meta.url));
const vo = join(studio, "assets/audio/vo-01.wav");
const dir = mkdtempSync(join(tmpdir(), "mix-remotion-"));
const ff = (...a) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a]);

// Mean RMS (dB) of `file` between from and to s, after an audio filter that isolates one stem.
function rmsDb(file, filter, from, to) {
  const r = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-ss", String(from), "-to", String(to), "-i", file, "-af", `${filter},astats=metadata=0:reset=0`, "-f", "null", "-"],
    { encoding: "utf8" },
  );
  return Number([...r.stderr.matchAll(/RMS level dB: (-?[\d.]+|-inf)/g)].at(-1)[1]);
}

test(
  "a silent render + VO + music + cues mixes to −14 ± 1 LUFS, music ≥ 8 dB under the voice",
  { timeout: 120_000, skip: existsSync(vo) ? false : "run tools/assets/make-vo.sh first" },
  () => {
    const silent = join(dir, "silent.mp4");
    ff("-f", "lavfi", "-i", "testsrc2=s=320x180:d=6:r=30", "-pix_fmt", "yuv420p", silent);
    // The bed is a 55 Hz tone: a band-pass at 55 Hz then reads the music alone, a high-pass at
    // 200 Hz the voice alone (the macOS voice carries next to nothing at 55 Hz).
    const music = join(dir, "music.wav");
    ff("-f", "lavfi", "-i", "sine=f=55:d=6", "-ac", "2", "-ar", "48000", music);
    const cues = join(dir, "cues.json");
    writeFileSync(cues, JSON.stringify([{ at: 1, sfx: "paper-place" }, { at: 3, sfx: "tape", gain: 0.8 }]));
    const out = join(dir, "mixed.mp4");
    const r = spawnSync("node", ["tools/audio/mix-remotion.mjs", silent, vo, music, cues, out], { cwd: studio, encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);

    const { I } = loudness(out);
    assert.ok(Math.abs(I - -14) <= 1, `integrated ${I} LUFS`);
    const voice = rmsDb(out, "highpass=f=200,highpass=f=200", 0.5, 2.5);
    const bed = rmsDb(out, "bandpass=f=55:width_type=h:w=10,bandpass=f=55:width_type=h:w=10", 0.5, 2.5);
    assert.ok(voice - bed >= 8, `voice ${voice} dB, music ${bed} dB`);
  },
);

test("refuses missing arguments", () => {
  const r = spawnSync("node", ["tools/audio/mix-remotion.mjs"], { cwd: studio, encoding: "utf8" });
  assert.equal(r.status, 2);
});

test("validateCues accepts a good list and an empty one", () => {
  validateCues([{ at: 0, sfx: "tape" }, { at: 2.5, sfx: "paper-place", gain: 0.5 }], 6);
  validateCues([], 6);
});

test("validateCues rejects what the mix would drop or misplace", () => {
  assert.throws(() => validateCues({}), /array/);
  assert.throws(() => validateCues([{ at: -1, sfx: "tape" }]), /"at"/);
  assert.throws(() => validateCues([{ at: null, sfx: "tape" }]), /"at"/);
  assert.throws(() => validateCues([{ at: "1", sfx: "tape" }]), /"at"/);
  assert.throws(() => validateCues([{ at: 1 }]), /"sfx"/);
  assert.throws(() => validateCues([{ at: 1, sfx: "tape", gain: "loud" }]), /"gain"/);
  assert.throws(() => validateCues([{ at: 7, sfx: "tape" }], 6), /past the end/);
});

test("an unknown SFX name fails the mix instead of passing silently", { timeout: 60_000 }, () => {
  const silent = join(dir, "silent-unknown.mp4");
  ff("-f", "lavfi", "-i", "testsrc2=s=320x180:d=3:r=30", "-pix_fmt", "yuv420p", silent);
  assert.throws(
    () => mixRemotion({ video: silent, voice: undefined, music: undefined, cues: [{ at: 1, sfx: "no-such-sound" }], out: join(dir, "x.mp4") }),
    /unknown sfx type "no-such-sound"/,
  );
  assert.throws(
    () => mixRemotion({ video: silent, voice: undefined, music: undefined, cues: [{ at: 9, sfx: "tape" }], out: join(dir, "x.mp4") }),
    /past the end/,
  );
});

test("a cue is audible in the mix at its time and nowhere else", { timeout: 60_000 }, () => {
  const silent = join(dir, "silent-sfx.mp4");
  ff("-f", "lavfi", "-i", "testsrc2=s=320x180:d=6:r=30", "-pix_fmt", "yuv420p", silent);
  const music = join(dir, "music-sfx.wav");
  ff("-f", "lavfi", "-i", "sine=f=55:d=6", "-ac", "2", "-ar", "48000", music);
  const out = join(dir, "sfx-only.mp4");
  mixRemotion({ video: silent, voice: undefined, music, cues: [{ at: 2, sfx: "paper-place" }], out });
  // The 55 Hz bed has nothing above 400 Hz: what a high-pass hears is the SFX.
  const at = rmsDb(out, "highpass=f=400,highpass=f=400", 1.9, 2.5);
  const away = rmsDb(out, "highpass=f=400,highpass=f=400", 4, 5);
  assert.ok(at - away >= 20, `at the cue ${at} dB, away from it ${away} dB`);
});
