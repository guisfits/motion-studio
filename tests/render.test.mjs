import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const studio = fileURLToPath(new URL("..", import.meta.url));
const film = fileURLToPath(new URL("./fixture-film", import.meta.url));
const out = `${film}/out`;
const render = (...args) => execFileSync("node", [`${studio}/core/render.mjs`, film, ...args], { stdio: "pipe" });
// Hash of the decoded frames, not the file: proves the pictures are identical.
const frameHash = (file) =>
  execFileSync("ffmpeg", ["-loglevel", "error", "-i", file, "-f", "md5", "-"]).toString().trim();

test("rendering the same range twice gives identical frames", { timeout: 120_000 }, () => {
  rmSync(out, { recursive: true, force: true });
  render("--draft", "--from", "0", "--to", "0.5");
  const a = frameHash(`${out}/draft-9x16-0-0.5.mp4`);
  render("--draft", "--from", "0", "--to", "0.5");
  assert.equal(frameHash(`${out}/draft-9x16-0-0.5.mp4`), a);
});

test("final render blends subframes into the requested fps", { timeout: 120_000 }, () => {
  render("--format", "16x9", "--fps", "30", "--sub", "2", "--to", "0.5");
  const probe = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v", "-count_frames",
    "-show_entries", "stream=width,height,nb_read_frames,r_frame_rate", "-of", "csv=p=0",
    `${out}/silent-16x9-0-0.5.mp4`]).toString().trim();
  assert.equal(probe, "1920,1080,30/1,15");
});

test("stills writes one PNG per moment plus a labelled sheet", { timeout: 120_000 }, () => {
  render("--stills", "0.1,0.4,0.9");
  assert.equal(readdirSync(`${out}/stills-9x16`).filter((f) => f.endsWith(".png")).length, 3);
  assert.ok(existsSync(`${out}/stills-9x16.png`));
});

test("a format the film does not declare is refused", { timeout: 60_000 }, () => {
  assert.throws(() => render("--format", "1x1", "--stills", "0.1"), /format/);
});

test("critique sheets cover contact, phone, strips and loop for any MP4", { timeout: 120_000 }, async () => {
  const { sheets } = await import("../core/critique/sheets.mjs");
  const made = await sheets(`${out}/draft-9x16-0-0.5.mp4`, { out, strips: [0.2], loop: true });
  for (const f of ["contact.png", "phone.png", "strip-0.2.png", "loop_check.mp4"]) {
    assert.ok(made.includes(`${out}/${f}`) && existsSync(`${out}/${f}`), `${f} missing`);
  }
});

test("a new film from the template previews and renders stills on its beat grid", { timeout: 120_000 }, () => {
  const slug = "zz-template-smoke";
  const dir = fileURLToPath(new URL(`./.tmp-films/${slug}`, import.meta.url));
  rmSync(dir, { recursive: true, force: true });
  try {
    execFileSync("node", [`${studio}/core/new-film.mjs`, dir, "--dur", "6"], { stdio: "pipe" });
    execFileSync("node", [`${studio}/core/audio/score.mjs`, `${dir}/score.json`], { stdio: "pipe" });
    execFileSync("node", [`${studio}/core/render.mjs`, dir, "--stills", "downbeats"], { stdio: "pipe" });
    assert.ok(existsSync(`${dir}/out/stills-9x16.png`));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
