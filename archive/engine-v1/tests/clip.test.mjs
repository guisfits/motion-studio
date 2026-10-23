import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const studio = fileURLToPath(new URL("..", import.meta.url));
const film = fileURLToPath(new URL("./fixture-clip", import.meta.url));
const rec = `${film}/out/rec.mp4`;
const clipDir = `${film}/out/clip-red-blue`;

// Centre pixel of a PNG as [r, g, b].
const centre = (png) => {
  const raw = execFileSync("ffmpeg", ["-loglevel", "error", "-i", png, "-vf", "crop=1:1:iw/2:ih/2",
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]);
  return [...raw.subarray(0, 3)];
};

test("a screen recording plays frame-exactly inside the film", { timeout: 120_000 }, () => {
  rmSync(`${film}/out`, { recursive: true, force: true });
  execFileSync("mkdir", ["-p", `${film}/out`]);
  // A 1 s "recording": red for 0.5 s, then blue.
  execFileSync("ffmpeg", ["-loglevel", "error", "-f", "lavfi", "-i", "color=red:s=120x260:d=0.5:r=30",
    "-f", "lavfi", "-i", "color=blue:s=120x260:d=0.5:r=30", "-filter_complex", "[0][1]concat=n=2:v=1",
    "-pix_fmt", "yuv420p", rec]);
  execFileSync("node", [`${studio}/core/reference/clip.mjs`, rec, clipDir, "--fps", "30"], { stdio: "pipe" });
  const meta = JSON.parse(readFileSync(`${clipDir}/clip.json`, "utf8"));
  assert.equal(meta.fps, 30);
  assert.equal(meta.count, 30);
  execFileSync("node", [`${studio}/core/render.mjs`, film, "--stills", "0.25,0.75"], { stdio: "pipe" });
  const [a, b] = ["000-0.25s", "001-0.75s"].map((f) => `${film}/out/stills-9x16/${f}.png`);
  assert.ok(existsSync(a) && existsSync(b));
  const [ra, , ba] = centre(a);
  const [rb, , bb] = centre(b);
  assert.ok(ra > 200 && ba < 60, `0.25 s should be red, got ${centre(a)}`);
  assert.ok(bb > 200 && rb < 60, `0.75 s should be blue, got ${centre(b)}`);
});
