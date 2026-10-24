import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkMp4, judgeDuration, judgeSafeArea, writeStills } from "../mp4.mjs";

const dir = mkdtempSync(join(tmpdir(), "checks-mp4-"));
const ff = (...a) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a]);
const codes = (findings) => findings.map((f) => f.code).sort();

// 6 s of moving test picture; `filter` splices a fault into it.
const SIZE = "320x180";
function clip(name, filter, audio) {
  const out = join(dir, name);
  const args = ["-f", "lavfi", "-i", `testsrc2=s=${SIZE}:d=6:r=30`];
  if (audio) args.push("-f", "lavfi", "-i", audio);
  args.push("-vf", filter ?? "null", "-pix_fmt", "yuv420p");
  if (audio) args.push("-c:a", "aac", "-shortest");
  ff(...args, out);
  return out;
}

test("a clean moving clip passes; silent is not a fault unless sound is required", { timeout: 60_000 }, () => {
  const ok = clip("ok.mp4");
  assert.deepEqual(checkMp4(ok).findings, []);
  assert.deepEqual(codes(checkMp4(ok, { audio: true }).findings), ["V5"]);
});

test("2 s of black fails", { timeout: 60_000 }, () => {
  const black = clip("black.mp4", "drawbox=c=black:t=fill:enable='between(t,2,4.2)'");
  assert.deepEqual(codes(checkMp4(black).findings), ["V2"]);
});

test("a frozen 3 s segment fails, a 2 s one does not", { timeout: 60_000 }, () => {
  const frozen3 = clip("frozen3.mp4", "split[a][b];[a][b]freezeframes=first=30:last=135:replace=29");
  assert.ok(codes(checkMp4(frozen3).findings).includes("V3"));
  const short = clip("frozen2.mp4", "split[a][b];[a][b]freezeframes=first=60:last=110:replace=59");
  assert.ok(!codes(checkMp4(short).findings).includes("V3"));
});

test("a −20 LUFS file fails loudness; a file at −14 passes", { timeout: 60_000 }, () => {
  const quiet = clip("quiet.mp4", null, "sine=f=440:d=6,volume=-26dB");
  assert.ok(codes(checkMp4(quiet).findings).includes("M2"));
  const loud = join(dir, "loud.mp4");
  ff("-i", quiet, "-c:v", "copy", "-af", "loudnorm=I=-14:LRA=7:TP=-1", "-c:a", "aac", "-ar", "48000", loud);
  assert.ok(!codes(checkMp4(loud).findings).includes("M2"));
});

test("duration bounds", () => {
  assert.deepEqual(judgeDuration(12, { min: 10, max: 20 }), []);
  assert.equal(judgeDuration(9, { min: 10 })[0].code, "V1");
  assert.equal(judgeDuration(21, { max: 20 })[0].code, "V1");
  assert.equal(judgeDuration(NaN)[0].code, "V0");
});

test("text boxes outside the title-safe area are flagged, and stills are drawn", { timeout: 60_000 }, () => {
  const boxes = [
    { t: 1, box: [200, 200, 400, 100], label: "inside" },
    { t: 2, box: [20, 200, 400, 100], label: "edge" },
  ];
  const f = judgeSafeArea(boxes, 1920, 1080);
  assert.equal(f.length, 1);
  assert.match(f[0].msg, /edge/);
  const stills = writeStills(clip("boxes.mp4"), boxes, 1920, 1080, dir);
  assert.ok(stills.every((s) => existsSync(s)));
});

test("an unreadable file is red, never a pass", () => {
  const bad = join(dir, "bad.mp4");
  writeFileSync(bad, "not a video");
  assert.equal(checkMp4(bad).findings[0].code, "V0");
});

test("the runner exits 1 on a red file and writes the markdown", { timeout: 60_000 }, () => {
  const md = join(dir, "checks.md");
  const black = clip("runner-black.mp4", "drawbox=c=black:t=fill:enable='between(t,2,4.2)'");
  const r = spawnSync("node", ["tools/checks/run-mp4.mjs", black, "--md", md], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.ok(existsSync(md));
  assert.match(r.stdout, /V2/);
});

test("the runner refuses a bound that is not a number instead of passing every file", { timeout: 60_000 }, () => {
  const ok = clip("runner-ok.mp4");
  for (const flag of ["--min", "--max"]) {
    const r = spawnSync("node", ["tools/checks/run-mp4.mjs", ok, flag, "abc"], { encoding: "utf8" });
    assert.equal(r.status, 2, `${flag} abc: ${r.stdout}`);
    assert.match(r.stderr, new RegExp(flag));
  }
  assert.equal(spawnSync("node", ["tools/checks/run-mp4.mjs", ok, "--min", "2", "--max", "9"], { encoding: "utf8" }).status, 0);
  assert.equal(spawnSync("node", ["tools/checks/run-mp4.mjs", ok, "--min", "7"], { encoding: "utf8" }).status, 1);
});
