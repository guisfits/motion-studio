import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const engine = fileURLToPath(new URL("..", import.meta.url));
const film = fileURLToPath(new URL("./fixture-scenes", import.meta.url));

// [r, g, b] of one pixel of a PNG at (x, y).
const pixel = (png, x, y) => [
  ...execFileSync("ffmpeg", ["-loglevel", "error", "-i", png, "-vf", `crop=1:1:${x}:${y}`,
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]).subarray(0, 3),
];

test("rays take the theme's glow, and a lockup needs the project's words", { timeout: 120_000 }, async () => {
  rmSync(`${film}/out`, { recursive: true, force: true });
  execFileSync("node", [`${engine}/core/render.mjs`, film, "--stills", "1.5"], { stdio: "pipe" });
  const png = `${film}/out/stills-9x16/000-1.50s.png`;
  // On the vertical ray above the centre the night ground is lit yellow (the overridden glow).
  const [r, g, b] = pixel(png, 540, 200);
  assert.ok(r > 40 && g > 30 && r - b > 20, `glow-tinted, got ${[r, g, b]}`);

  const { chromium } = await import("playwright");
  const { startServer, filmUrl } = await import("../core/server.mjs");
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto(filmUrl(server, film, "?format=9x16&render=1"));
    await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
    const { error, cues } = await page.evaluate(() => ({ error: window.LOCKUP_ERROR, cues: window.LOCKUP_CUES }));
    assert.match(error, /mark/);
    assert.deepEqual(cues.map((c) => c.type), ["stamp", "bell"]);
  } finally {
    await browser.close();
    server.close();
  }
});
