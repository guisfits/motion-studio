import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { blurFor, BLUR_FLOOR, BLUR_MAX } from "../core/lib/table.js";

const studio = fileURLToPath(new URL("..", import.meta.url));
const film = fileURLToPath(new URL("./fixture-blur", import.meta.url));
const out = `${film}/out`;

// One row of a PNG as grey levels (0..255).
const row = (png, y) => {
  const px = execFileSync("ffmpeg", ["-loglevel", "error", "-i", png, "-vf", `crop=1080:1:0:${y}`,
    "-f", "rawvideo", "-pix_fmt", "gray", "-"]);
  return [...px];
};

async function inPage(fn, query = "") {
  const { chromium } = await import("playwright");
  const { startServer, filmUrl } = await import("../core/server.mjs");
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto(filmUrl(server, film, `?format=9x16&render=1${query}`));
    await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
    return await page.evaluate(fn);
  } finally {
    await browser.close();
    server.close();
  }
}

test("blurFor: nothing under the floor, along the travel above it, capped", () => {
  assert.deepEqual(blurFor({ vx: BLUR_FLOOR - 1, vy: 0 }).sx, 0);
  const b = blurFor({ vx: 0, vy: 60 });
  assert.ok(b.sx > 15 && b.sy === 0, `vertical travel smears along it (${b.sx}, ${b.sy})`);
  assert.equal(Math.round(b.angle), 90);
  assert.equal(blurFor({ vx: 5000, vy: 0 }).sx, BLUR_MAX);
  assert.equal(blurFor({ vx: 60, vy: 0 }, 0).sx, 0, "gain 0 turns it off");
});

test("the table measures its own speed: zero at rest, a leftward smear during the whip", { timeout: 120_000 }, async () => {
  const [rest, whip, landed] = await inPage(() => [0.5, 1.1, 2.5].map((t) => window.TABLE.blurAt(t)));
  assert.equal(rest.sx, 0);
  assert.equal(landed.sx, 0);
  assert.ok(whip.sx > 40, `the whip smears (${whip.sx})`);
  assert.ok(Math.abs(Math.abs(whip.angle) - 180) < 1, `content travels left (${whip.angle})`);
});

test("a whip frame is a smear, not stacked sharp copies; the same frame without blur is sharp", { timeout: 120_000 }, () => {
  rmSync(out, { recursive: true, force: true });
  execFileSync("node", [`${studio}/core/render.mjs`, film, "--stills", "1.25"], { stdio: "pipe" });
  const smeared = row(`${out}/stills-9x16/000-1.25s.png`, 960);
  // Sharp reference: the fixture with blur off, same instant.
  return import("../core/server.mjs").then(async ({ startServer, filmUrl }) => {
    const { chromium } = await import("playwright");
    const server = await startServer();
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
      await page.goto(filmUrl(server, film, "?format=9x16&render=1&blur=0"));
      await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
      await page.evaluate(() => window.seek(1.25));
      await page.screenshot({ path: `${out}/sharp-1.25.png`, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    } finally {
      await browser.close();
      server.close();
    }
    const sharp = row(`${out}/sharp-1.25.png`, 960);
    const black = (r) => r.filter((v) => v < 40).length;
    const mid = (r) => r.filter((v) => v >= 40 && v <= 250).length;
    assert.ok(black(sharp) > 30, `the unblurred bars are solid black (${black(sharp)})`);
    assert.equal(black(smeared), 0, "no solid bar survives the smear");
    assert.ok(mid(smeared) > 500, `most of the row is a grey gradient (${mid(smeared)} px)`);
    // Smooth, not stepped: neighbouring pixels never jump by more than a few levels.
    const jump = Math.max(...smeared.slice(1).map((v, i) => Math.abs(v - smeared[i])));
    assert.ok(jump <= 6, `a continuous smear (max step ${jump})`);
  });
});
