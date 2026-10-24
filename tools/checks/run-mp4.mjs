#!/usr/bin/env node
// Runs the mp4 checks (mp4.mjs) on one or more rendered files and prints one markdown section
// per file; exits 1 when any file has a red finding.
// Usage: node tools/checks/run-mp4.mjs <a.mp4> [b.mp4 …] [--min S] [--max S] [--audio]
//        [--boxes boxes.json] [--stills <dir>] [--md out/checks.md]
// boxes.json: [{ "t": 3.2, "box": [x, y, w, h], "label": "title" }] in frame px (one file only).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { parseArgs } from "node:util";
import { checkMp4, writeStills } from "./mp4.mjs";
import { summarize, toMarkdown } from "./report.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    min: { type: "string" },
    max: { type: "string" },
    audio: { type: "boolean", default: false },
    boxes: { type: "string" },
    stills: { type: "string" },
    md: { type: "string" },
  },
});
if (positionals.length === 0) {
  console.error("usage: run-mp4.mjs <a.mp4> [b.mp4 …] [--min S] [--max S] [--audio] [--boxes f.json] [--stills dir] [--md out.md]");
  process.exit(2);
}
if (values.boxes && positionals.length > 1) {
  console.error("--boxes applies to one file only");
  process.exit(2);
}
const num = (v) => (v === undefined ? undefined : Number(v));
const boxes = values.boxes ? JSON.parse(readFileSync(values.boxes, "utf8")) : [];

let red = 0;
const sections = positionals.map((mp4) => {
  const { probe, findings } = checkMp4(mp4, { min: num(values.min), max: num(values.max), audio: values.audio, boxes });
  const s = summarize(findings);
  red += s.red;
  if (values.stills && probe && boxes.length) {
    mkdirSync(values.stills, { recursive: true });
    writeStills(mp4, boxes, probe.W, probe.H, values.stills);
  }
  const head = probe
    ? `${probe.duration.toFixed(2)} s · ${probe.W}×${probe.H} · ${probe.audio ? `${probe.lufs} LUFS` : "silent"}`
    : "unreadable";
  return `## ${basename(mp4)} ${s.pass ? "✅" : "❌"}\n\n${head}\n\n${toMarkdown(findings) || "no findings"}\n`;
});

const md = `# mp4 checks\n\n${sections.join("\n")}`;
if (values.md) writeFileSync(values.md, md);
console.log(md);
process.exit(red > 0 ? 1 : 0);
