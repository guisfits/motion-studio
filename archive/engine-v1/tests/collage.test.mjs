import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const studio = fileURLToPath(new URL("..", import.meta.url));
const film = fileURLToPath(new URL("./fixture-collage", import.meta.url));
const out = `${film}/out`;

// [r, g, b] of one pixel of a PNG at (x, y).
const pixel = (png, x, y) => [
  ...execFileSync("ffmpeg", ["-loglevel", "error", "-i", png, "-vf", `crop=1:1:${x}:${y}`,
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]).subarray(0, 3),
];

test("slices show one source per band once they have slid in", { timeout: 120_000 }, () => {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const c of ["red", "green", "blue"])
    execFileSync("ffmpeg", ["-loglevel", "error", "-f", "lavfi", "-i", `color=${c}:s=1080x1920`,
      "-frames:v", "1", `${out}/${c}.png`]);
  execFileSync("node", [`${studio}/core/render.mjs`, film, "--stills", "0.05,1.9"], { stdio: "pipe" });
  const [early, late] = ["000-0.05s", "001-1.90s"].map((f) => `${out}/stills-9x16/${f}.png`);
  const [top, mid, bottom] = [320, 960, 1600].map((y) => pixel(late, 540, y));
  assert.ok(top[0] > 200 && top[2] < 60, `top band red, got ${top}`);
  assert.ok(mid[1] > 100 && mid[0] < 60, `middle band green, got ${mid}`);
  assert.ok(bottom[2] > 200 && bottom[0] < 60, `bottom band blue, got ${bottom}`);
  // At 0.05 s the last band has not started: its source is still off-stage.
  const [r, g, b] = pixel(early, 540, 1600);
  assert.ok(!(b > 200 && r < 60 && g < 60), `bottom band should not be in yet, got ${[r, g, b]}`);
});

test("cutout --mode paper keeps the ink and drops the paper", { timeout: 120_000 }, () => {
  mkdirSync(out, { recursive: true });
  // White paper with a black 100 px square of "ink" in the middle.
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=white:s=300x300",
    "-vf", "drawbox=x=100:y=100:w=100:h=100:color=black:t=fill", "-frames:v", "1", `${out}/print.png`]);
  execFileSync("swift", [`${studio}/core/reference/cutout.swift`, `${out}/print.png`, `${out}/piece.png`,
    "--mode", "paper"], { stdio: "pipe" });
  const size = execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height",
    "-of", "csv=p=0", `${out}/piece.png`]).toString().trim();
  assert.equal(size, "100,100", "the PNG is cropped to the ink");
});
