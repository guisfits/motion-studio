import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const film = fileURLToPath(new URL("./fixture-screen", import.meta.url));
const SAFE = { left: 64, top: 220, right: 1080 - 150, bottom: 1920 - 400 };

// Rects of every word span of a caption at several times.
async function rects(times) {
  const { chromium } = await import("playwright");
  const { startServer, filmUrl } = await import("../core/server.mjs");
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto(filmUrl(server, film, "?format=9x16&render=1"));
    await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
    return await page.evaluate(async (ts) => {
      const box = (el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
      };
      const out = {};
      for (const t of ts) {
        await window.seek(t);
        const spans = (c) => [...c.box.querySelectorAll("span")];
        out[t] = {
          pinned: spans(window.PINNED).map(box),
          world: spans(window.WORLD).map(box),
          clips: spans(window.PINNED).map((s) => s.style.clipPath),
          visible: window.PINNED.box.style.visibility,
          fonts: spans(window.PINNED).map((s) => parseFloat(s.style.font.match(/(\d+(\.\d+)?)px/)[1])),
          parent: window.PINNED.box.parentElement === document.querySelector("#stage > div:last-child"),
        };
      }
      return out;
    }, times);
  } finally {
    await browser.close();
    server.close();
  }
}

test("a screen caption stays put inside the safe box while the camera rolls and zooms", { timeout: 120_000 }, async () => {
  const r = await rects([0.3, 1.2, 1.8]);
  assert.equal(r[0.3].visible, "hidden", "nothing before the line is spoken");
  for (const t of [1.2, 1.8])
    for (const b of r[t].pinned) {
      assert.ok(b.left >= SAFE.left - 0.5 && b.right <= SAFE.right + 0.5, `x ${b.left}–${b.right} at ${t}`);
      assert.ok(b.top >= SAFE.top - 0.5 && b.bottom <= SAFE.bottom + 0.5, `y ${b.top}–${b.bottom} at ${t}`);
    }
  assert.deepEqual(r[1.2].pinned, r[1.8].pinned, "pinned to the screen");
  assert.notDeepEqual(r[1.2].world, r[1.8].world, "the world caption rides the camera");
  assert.ok(r[1.8].parent, "it lives in the overlay above the table");
});

test("screen captions are still written on their spoken frames, lead words ≥ 60 px and ≥ 0.55 × key", { timeout: 120_000 }, async () => {
  const r = await rects([0.8, 1.2]);
  // "In" (0.5–0.7) is fully revealed at 0.8; "London," (from 1.0) is not yet.
  assert.match(r[0.8].clips[0], /inset\(-30% 0% -30% 0(px)?\)/);
  assert.match(r[0.8].clips[1], /inset\(-30% 100% -30% 0(px)?\)/);
  const [lead, key] = r[1.2].fonts;
  assert.ok(lead >= 60 && lead >= key * 0.55 - 0.01, `lead ${lead} px, key ${key} px`);
});
