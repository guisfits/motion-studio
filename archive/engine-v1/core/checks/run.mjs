// node core/checks/run.mjs <film-dir> --stage script|sheet|animatic|draft|final [--format 9x16]
// Runs the gates a stage needs, writes crew/checks-<stage>.{md,json}, exits 1 on any red.
// `script` is the fact-check alone (X1–X3), signed before any voice, sheet or manifest exists.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { normsFor } from "./norms.mjs";
import { finding, summarize, toMarkdown } from "./report.mjs";
import { checkSyncSheet } from "./sync.mjs";
import { checkOnePersonPicture } from "./scenes.mjs";
import { sampleTrace, checkTrace } from "./trace.mjs";
import { checkPicture } from "./picture.mjs";
import { deadFrames, loudness, sampleBox } from "./media.mjs";
import { checkRhythm } from "./rhythm.mjs";
import { checkCapHeight, checkContrast } from "./legibility.mjs";
import { checkCues, checkSfxFiles } from "./cues.mjs";
import { cuePre } from "../audio/sfx.mjs";
import { checkFacts } from "./facts.mjs";

const STAGES = ["script", "sheet", "animatic", "draft", "final"];
const usage = () => {
  console.error(
    `usage: node core/checks/run.mjs <film-dir> --stage ${STAGES.join("|")} [--format 9x16]`,
  );
  process.exit(2);
};
// A flag given without its value is a usage error, not the default.
const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  if (i < 0) return d;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : usage();
};
const filmArg = process.argv[2];
if (!filmArg || filmArg.startsWith("--")) usage();
const film = resolve(filmArg);
const stage = arg("stage", "sheet");
if (!STAGES.includes(stage)) usage();
const format = arg("format", "9x16");
const json = (p) => JSON.parse(readFileSync(join(film, p), "utf8"));

const f = [];
const read = (p) => (existsSync(join(film, p)) ? readFileSync(join(film, p), "utf8") : null);
const factCheck = read("crew/fact-check.json");
const facts = (sheet) =>
  checkFacts({ script: read("crew/script.md") ?? "", factCheck: factCheck && JSON.parse(factCheck), sheet });

function report() {
  mkdirSync(join(film, "crew"), { recursive: true });
  const s = summarize(f);
  writeFileSync(
    join(film, "crew", `checks-${stage}.json`),
    JSON.stringify({ stage, summary: s, findings: f }, null, 1),
  );
  writeFileSync(
    join(film, "crew", `checks-${stage}.md`),
    `# Checks — ${stage}\n\n${toMarkdown(f) || "✅ no findings"}\n`,
  );
  console.log(
    `${stage}: ${s.pass ? "PASS" : "FAIL"} — 🔴 ${s.red} 🟠 ${s.orange} 🟡 ${s.yellow}`,
  );
  process.exit(s.pass ? 0 : 1);
}

if (stage === "script") {
  f.push(...facts(null));
  report();
}

const words = json("voice/words.json");
const sheet = json("crew/sync-sheet.json");
const manifest = json("crew/manifest.json");
f.push(...checkSyncSheet(sheet, words, manifest));
// S10 needs the scene grouping; a film without crew/scenes.json is not checked for it.
const scenes = read("crew/scenes.json");
f.push(...checkOnePersonPicture(sheet, manifest, scenes && JSON.parse(scenes)));
// The fact-check gates the script (above) and the final cut, never the stages between: pictures and
// lettering still change there, so a check mid-way proves nothing (client, 2026-10-16).
if (stage === "final") f.push(...facts(sheet));
// The sheet's register (default A) picks the norms the length, rhythm and camera gates read.
const norms = normsFor(sheet.register);
const end = words.words.at(-1)?.end ?? 0;
// A film that closes on a product segment (`sheet.app.t0`, where it starts) is measured in two
// parts: the story up to t0 against norms.film, the segment after it against norms.appSegment.
const appT0 = sheet.app?.t0;
const spans = appT0
  ? [
      ["story", appT0, norms.film],
      ["app segment", end - appT0, norms.appSegment],
    ]
  : [["narration", end, norms.film]];
for (const [name, len, norm] of spans)
  if (len < norm.minS || len > norm.maxS)
    f.push(
      finding(
        "red",
        "F1",
        null,
        `${name} is ${len.toFixed(1)} s (${norm.minS}–${norm.maxS})`,
      ),
    );
const media = (kind) => {
  const p = join(film, "out", `${kind}-${format}.mp4`);
  if (!existsSync(p)) f.push(finding("red", "F2", null, `missing ${p}`));
  return p;
};
const cut = stage === "draft" || stage === "final";
const video = cut ? media(stage === "final" ? "final" : "draft") : null;
if (stage !== "sheet") {
  const trace = await sampleTrace(film, { format });
  f.push(
    ...checkTrace(trace, { manifest, norms }),
    ...checkPicture(trace, sheet, manifest, norms),
    ...checkRhythm(trace, words, { stage, norms, manifest }),
  );
  // Caption type is judged on the finished cut: T11 reads the rendered frames (F2 when missing).
  if (cut) {
    f.push(...checkCapHeight(trace));
    if (existsSync(video)) f.push(...checkContrast(trace, sampleBox(video, trace.W, trace.H)));
  }
}
if (cut) f.push(...deadFrames(video));
if (stage === "final") f.push(...loudness(media("final")).findings);
// A film may have no SFX: no cue file and no stem is no finding; a stem alone is M6. The gate reads
// the cues the stem was rendered from (out/sfx.wav.cues.json, written by core/audio/sfx.mjs) and
// goes red when that render is not of the current crew/sfx-cues.json.
const cuesPath = join(film, "crew", "sfx-cues.json");
if (stage === "final") {
  const hasCues = existsSync(cuesPath);
  const sidecarRaw = read("out/sfx.wav.cues.json");
  let sidecar = null;
  try {
    sidecar = sidecarRaw && JSON.parse(sidecarRaw);
  } catch {}
  const cueSha256 = hasCues ? createHash("sha256").update(readFileSync(cuesPath)).digest("hex") : null;
  f.push(
    ...checkSfxFiles({ hasStem: existsSync(join(film, "out", "sfx.wav")), hasCues, sidecar, cueSha256 }),
  );
  if (hasCues) f.push(...checkCues(Array.isArray(sidecar?.cues) ? sidecar.cues : json("crew/sfx-cues.json"), words, { preOf: cuePre }));
}

report();
