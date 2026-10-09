import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { springReach } from "../core/lib/motion.js";
import { EASE } from "../core/lib/table.js";

const studio = fileURLToPath(new URL("..", import.meta.url));
const film = fileURLToPath(new URL("./fixture-table", import.meta.url));
const out = `${film}/out`;
const stills = (...ts) =>
  execFileSync("node", [`${studio}/core/render.mjs`, film, "--stills", ts.join(",")], { stdio: "pipe" });
const still = (i, t) => `${out}/stills-9x16/${String(i).padStart(3, "0")}-${t.toFixed(2)}s.png`;

// [r, g, b] of one pixel of a PNG at (x, y).
const pixel = (png, x, y) => [
  ...execFileSync("ffmpeg", ["-loglevel", "error", "-i", png, "-vf", `crop=1:1:${x}:${y}`,
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]).subarray(0, 3),
];
const near = (got, want, tol = 8) => got.every((c, i) => Math.abs(c - want[i]) <= tol);
const RED = [0xcc, 0x22, 0x22];
const BLUE = [0x22, 0x55, 0xcc];
const GREEN = [0x22, 0xaa, 0x44];

// Cues come from the page itself: the same table the film builds, read after the camera keys.
async function pageValue(expr) {
  const { chromium } = await import("playwright");
  const { startServer, filmUrl } = await import("../core/server.mjs");
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto(filmUrl(server, film, "?format=9x16&render=1"));
    await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
    return await page.evaluate(expr);
  } finally {
    await browser.close();
    server.close();
  }
}

test("the camera moves the world: the frame centre becomes the far surface", { timeout: 120_000 }, () => {
  rmSync(out, { recursive: true, force: true });
  stills(0.05, 2.5);
  const start = pixel(still(0, 0.05), 540, 960);
  const arrived = pixel(still(1, 2.5), 540, 960);
  assert.ok(near(start, RED), `at t=0.05 the centre is the sheet, got ${start}`);
  assert.ok(!near(start, GREEN), "the island is not under the camera at the start");
  assert.ok(near(arrived, GREEN), `at t=2.5 the centre is the island at (2000,2000), got ${arrived}`);
});

test("the same still rendered twice is byte-identical", { timeout: 120_000 }, () => {
  stills(1.7);
  const a = createHash("sha256").update(readFileSync(still(0, 1.7))).digest("hex");
  stills(1.7);
  const b = createHash("sha256").update(readFileSync(still(0, 1.7))).digest("hex");
  assert.equal(b, a);
});

const cueChecks = (cues) => {
  assert.deepEqual(cues.filter((c) => c.type === "swish" || c.type === "whoosh").map((c) => c.type),
    ["swish", "whoosh"]);
  const [swish, whoosh] = cues;
  // A camera whoosh peaks halfway along the move's spring (where the picture moves fastest), not at
  // the key that starts it: key + springReach(k, d, 0.5) of the move's ease (both keys: "move").
  const half = springReach(EASE.move.k, EASE.move.d, 0.5);
  assert.ok(Math.abs(swish.t - (1.2 + half)) < 1e-9 && Math.abs(whoosh.t - (3.0 + half)) < 1e-9,
    `cues sit at the middle of each move (${swish.t}, ${whoosh.t})`);
  assert.ok(swish.gain > whoosh.gain && swish.gain <= 1, "a longer move is louder, capped at 1");
  const tearCue = cues.find((c) => c.type === "tear");
  assert.ok(tearCue, "the tear child contributes its own cue");
  assert.equal(tearCue.t, 0.5);
};

// Move 1: (540,960) -> (2000,2000) is ~1792 px (> 1400); move 2: 600 px (250..1400).
test("cues(): a long move is a swish, a short one a whoosh, and children add theirs (keys with z)", { timeout: 120_000 }, async () => {
  const cues = await pageValue(() => {
    window.TABLE.camera([
      [0, { x: 540, y: 960, z: 1 }],
      [1.2, { x: 2000, y: 2000, z: 1 }],
      [3.0, { x: 2000, y: 2600, z: 1 }],
    ]);
    return window.TABLE.cues();
  });
  cueChecks(cues);
});

// The header of makeTable says missing fields keep the first key's value, but cues() subtracts
// an undefined z from the first key and gets NaN, so camera keys without z are never heard.
test("cues(): camera keys without z still produce whoosh/swish",
  { timeout: 120_000 }, async () => {
  cueChecks(await pageValue(() => window.TABLE_CUES()));
});

test("camera.at() reports the keyed positions once settled", { timeout: 120_000 }, async () => {
  const [home, far] = await pageValue(() => [window.CAMERA_AT(0), window.CAMERA_AT(2.8)]);
  // Handheld drift stays within ~25 px.
  assert.ok(Math.abs(home.x - 540) < 25 && Math.abs(home.y - 960) < 25, `home ${home.x},${home.y}`);
  assert.ok(Math.abs(far.x - 2000) < 25 && Math.abs(far.y - 2000) < 40, `far ${far.x},${far.y}`);
});

test("a torn sheet reveals what lies beneath once it opens", { timeout: 120_000 }, () => {
  stills(0.2, 1.0);
  // (540,500) is far from the ragged seam at mid-height, so it is the sheet before and the
  // under-surface after, never a blend of the halves' edges.
  const before = pixel(still(0, 0.2), 540, 500);
  const after = pixel(still(1, 1.0), 540, 500);
  assert.ok(near(before, RED), `before the tear: sheet colour, got ${before}`);
  assert.ok(near(after, BLUE), `after the tear: the surface beneath, got ${after}`);
  const lower = pixel(still(1, 1.0), 540, 1500);
  assert.ok(near(lower, BLUE), `the lower half opened too, got ${lower}`);
});
