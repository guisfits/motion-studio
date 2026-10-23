// Labelled contact sheets. Each cell is a frame with its timestamp under it, so a critique can
// name the exact second of a problem. Built with Playwright (this ffmpeg has no drawtext).
import { chromium } from "playwright";
import { rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

// cells: [{ file, label }]; opts: { title, cols, cellW }
export async function makeSheet(cells, out, opts = {}) {
  if (!cells.length) throw new Error("makeSheet: no frames");
  const cols = opts.cols ?? Math.min(6, cells.length);
  const cellW = opts.cellW ?? 270;
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#1b1b1a;color:#e8e6df;font:13px ui-monospace,Menlo,monospace}
    h1{font-size:14px;font-weight:400;margin:0;padding:10px 12px;color:#bdbab0}
    .g{display:grid;grid-template-columns:repeat(${cols},${cellW}px);gap:8px;padding:0 12px 12px}
    figure{margin:0} img{width:${cellW}px;display:block;background:${opts.cellBg ?? "#000"}}
    figcaption{padding:3px 0 0;color:#d9d6cc}
  </style><h1>${esc(opts.title ?? "")}</h1><div class="g">${cells
    .map(
      (c) =>
        `<figure><img src="${pathToFileURL(c.file).href}"><figcaption>${esc(c.label)}</figcaption></figure>`,
    )
    .join("")}</div>`;
  const page = join(dirname(out), `.sheet-${Date.now()}.html`);
  writeFileSync(page, html);
  const browser = await chromium.launch();
  try {
    const p = await browser.newPage({
      viewport: { width: cols * (cellW + 8) + 16, height: 400 },
    });
    await p.goto(pathToFileURL(page).href);
    await p.evaluate(() =>
      Promise.all([...document.images].map((i) => i.decode().catch(() => {}))),
    );
    await p.screenshot({ path: out, fullPage: true });
  } finally {
    await browser.close();
    rmSync(page, { force: true });
  }
  return out;
}
