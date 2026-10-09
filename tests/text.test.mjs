import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The counter is DOM code: render a tiny film that prints what each column shows.
const studio = fileURLToPath(new URL("..", import.meta.url));
const film = fileURLToPath(new URL("./fixture-counter", import.meta.url));

test("odometer reads resting values exactly and hides leading zeros", { timeout: 60_000 }, () => {
  rmSync(film, { recursive: true, force: true });
  mkdirSync(film, { recursive: true });
  writeFileSync(`${film}/index.html`, `<!doctype html><meta charset="utf-8"><script type="module">
    import { createStage } from "../../core/lib/stage.js";
    import { makeCounter } from "../../styles/motion-graphics/lib/text.js";
    const stage = await createStage({ dur: 1, formats: ["9x16"] });
    const c = makeCounter(stage.dom, { css: { fontFamily: "monospace", fontSize: "100px" } });
    const read = () => [...c.el.children].map((w) => {
      const y = -parseFloat(w.firstChild.style.transform.match(/-?[\\d.]+/)[0]) / 1.15;
      return Number(w.style.opacity) > 0.5 ? String(Math.round(y) % 10) : "";
    }).join("");
    window.readings = [354, 1483, 2026, 10].map((v) => { c.set(v); return read(); });
    stage.run(() => {});
  </script>`);
  try {
    const out = execFileSync("node", ["-e", `
      import("${studio}/node_modules/playwright/index.mjs").then(async ({ chromium }) => {
        const { startServer, filmUrl } = await import("${studio}/core/server.mjs");
        const s = await startServer(); const b = await chromium.launch(); const p = await b.newPage();
        await p.goto(filmUrl(s, "${film}", "?render=1")); await p.waitForFunction(() => window.ready === true);
        console.log(JSON.stringify(await p.evaluate(() => window.readings))); await b.close(); s.close();
      });`]).toString().trim();
    assert.deepEqual(JSON.parse(out), ["354", "1483", "2026", "10"]);
  } finally {
    rmSync(film, { recursive: true, force: true });
  }
});
