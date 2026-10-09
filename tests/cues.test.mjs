import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const studio = fileURLToPath(new URL("..", import.meta.url));
const film = fileURLToPath(new URL("./fixture-cues", import.meta.url));
const out = `${film}/out`;

test("render writes out/cues.auto.json from window.CUES, sorted by time", { timeout: 120_000 }, () => {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  execFileSync("ffmpeg", ["-loglevel", "error", "-f", "lavfi", "-i", "color=white:s=300x200",
    "-frames:v", "1", `${out}/pic.png`]);
  execFileSync("node", [`${studio}/core/render.mjs`, film, "--stills", "0.1"], { stdio: "pipe" });

  const file = `${out}/cues.auto.json`;
  assert.ok(existsSync(file), "cues.auto.json is written when the film sets window.CUES");
  const cues = JSON.parse(readFileSync(file, "utf8"));
  const times = cues.map((c) => c.t);
  assert.deepEqual(times, [...times].sort((a, b) => a - b), "sorted by t");

  const count = (type) => cues.filter((c) => c.type === type).length;
  assert.equal(count("key"), 3, "A, B and C strike; the space does not");
  assert.equal(count("ding"), 1);
  assert.equal(count("paper-place"), 1, "no tOut, so no paper-slide");
  assert.equal(count("paper-slide"), 0);
  assert.equal(cues.length, 5);

  // Typewriter at 10 cps from 0.5 s: character i is on screen from 0.5 + (i + 1) / 10, and its key is
  // heard then (not when the line starts): "AB C" strikes A at 0.6, B at 0.7, C at 0.9; bell at 0.95.
  const keys = cues.filter((c) => c.type === "key").map((c) => c.t);
  assert.deepEqual(keys.map((t) => Number(t.toFixed(3))), [0.6, 0.7, 0.9]);
  assert.equal(cues.find((c) => c.type === "ding").t.toFixed(3), "0.950");
  // The piece enters at 0.2 s by the snappy spring on a 12 fps hand-stepped clock: it lands (95%) on
  // the first step at or after 0.2 + 0.202 s, i.e. 0.2 + 3/12, and that is when it is heard.
  assert.equal(cues.find((c) => c.type === "paper-place").t, 0.45);
});
