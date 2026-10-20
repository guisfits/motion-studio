// node skills/film-writer/scripts/take-metrics.mjs <film-dir | words.json> [--hook-s 3] [--app-t0 73.7]
// Measures a voice take from its word times: F1 length, speech speed, pauses, the opening line,
// and the caption reading load the animator will meet (NORMS.caption.*). Read-only; prints a report.
// A film that closes on a product segment is measured in two parts, like run.mjs F1: the story up to
// the segment's start against NORMS.film, the segment against NORMS.appSegment. The start is
// `--app-t0 <s>` (the first word of the segment's first line), else the film's sheet `app.t0`.
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const { NORMS } = await import(
  pathToFileURL(resolve(here, "../../../core/checks/norms.mjs")).href
);

const target = process.argv[2];
if (!target || target.startsWith("--")) {
  console.error("usage: take-metrics.mjs <film-dir | words.json> [--hook-s 3] [--app-t0 73.7]");
  process.exit(2);
}
const hookIdx = process.argv.indexOf("--hook-s");
const hookS = hookIdx > 0 ? Number(process.argv[hookIdx + 1]) : 3;
const appIdx = process.argv.indexOf("--app-t0");
const appArg = appIdx > 0 ? Number(process.argv[appIdx + 1]) : undefined;
const p = resolve(target);
const isFilm = statSync(p).isDirectory();
const file = isFilm ? join(p, "voice/words.json") : p;
if (!existsSync(file)) {
  console.error(`missing ${file}`);
  process.exit(2);
}
const { words } = JSON.parse(readFileSync(file, "utf8"));
if (!words?.length) {
  console.error("words.json has no words");
  process.exit(2);
}

const first = words[0].start;
const last = words.at(-1).end;
const speech = last - first;
const rate = words.length / speech;
const sheetFile = isFilm ? join(p, "crew/sync-sheet.json") : undefined;
const appT0 = Number.isFinite(appArg)
  ? appArg
  : sheetFile && existsSync(sheetFile)
    ? JSON.parse(readFileSync(sheetFile, "utf8")).app?.t0
    : undefined;
const within = (s, n) => s >= n.minS && s <= n.maxS;
const parts =
  appT0 !== undefined
    ? [
        ["story", appT0, NORMS.film],
        ["app segment", last - appT0, NORMS.appSegment],
      ]
    : [["narration", last, NORMS.film]];
const f1 = parts.every(([, s, n]) => within(s, n));
const out = [];
out.push(`file: ${file}`);
out.push(
  `words: ${words.length}  first start: ${first.toFixed(2)} s  last end: ${last.toFixed(2)} s ` +
    `(F1 ${parts
      .map(([name, s, n]) => `${name} ${s.toFixed(1)} s in ${n.minS}-${n.maxS}: ${within(s, n) ? "ok" : "RED"}`)
      .join("; ")})`,
);
out.push(
  `lead slack ${first.toFixed(2)} s, NORMS.sync.coverSlackS ${NORMS.sync.coverSlackS}: ${
    first <= NORMS.sync.coverSlackS ? "ok" : "trim leading silence"
  }`,
);
out.push(
  `speech speed: ${rate.toFixed(2)} words/s over ${speech.toFixed(1)} s ` +
    `(register A: median 3.0, p10-p90 2.3-3.4, grammar section 10)`,
);

// Pauses between consecutive words.
const gaps = [];
for (let i = 1; i < words.length; i++) {
  const g = words[i].start - words[i - 1].end;
  if (g > 0.4) gaps.push({ at: words[i - 1].end, g, after: words[i - 1].w });
}
out.push(
  gaps.length
    ? `pauses over 0.4 s (${gaps.length}); keep only the deliberate ones (turn, breath card):\n` +
        gaps.map((x) => `  ${x.at.toFixed(2)} s  ${x.g.toFixed(2)} s after "${x.after}"`).join("\n")
    : "pauses over 0.4 s: none",
);

// Opening line: first sentence end (word ending in . ! ? ) or the first 12 words.
const sentEnd = words.findIndex((w) => /[.!?…]["')\]]*$/.test(w.w));
const hookEnd = words[sentEnd >= 0 ? sentEnd : Math.min(11, words.length - 1)].end;
out.push(
  `opening line ends at ${hookEnd.toFixed(2)} s (target <= ${hookS} s, craft 2.8, inferred): ${
    hookEnd <= hookS ? "ok" : "LATE"
  }`,
);

// Caption reading load: greedy chunks of NORMS.caption.maxWords; a chunk may stay up until the next starts.
const chunks = [];
for (let i = 0; i < words.length; i += NORMS.caption.maxWords) {
  const c = words.slice(i, i + NORMS.caption.maxWords);
  chunks.push({ text: c.map((w) => w.w).join(" "), start: c[0].start, end: c.at(-1).end });
}
const rows = chunks.map((c, i) => {
  const until = i + 1 < chunks.length ? chunks[i + 1].start : c.end + 1;
  const win = Math.max(until - c.start, NORMS.caption.minLegibleS);
  return { ...c, cps: c.text.length / win, win };
});
const hot = rows.filter((r) => r.cps > NORMS.caption.maxCps);
out.push(
  `caption load (chunks of ${NORMS.caption.maxWords} words, cps limit ${NORMS.caption.maxCps}): ` +
    `${hot.length} of ${rows.length} chunks over; worst ${Math.max(...rows.map((r) => r.cps)).toFixed(1)} cps`,
);
for (const r of hot.slice(0, 8))
  out.push(`  ${r.start.toFixed(2)} s  ${r.cps.toFixed(1)} cps  "${r.text}"`);

// Per-line speed when words.json carries line ids.
if (words.some((w) => w.line)) {
  const by = new Map();
  for (const w of words) {
    const l = by.get(w.line) ?? { n: 0, s: w.start, e: w.end };
    l.n++;
    l.e = w.end;
    by.set(w.line, l);
  }
  out.push("per line (words/s):");
  for (const [id, l] of by)
    out.push(`  ${String(id).padEnd(10)} ${String(l.n).padStart(3)} w  ${(l.n / (l.e - l.s)).toFixed(2)}`);
}
console.log(out.join("\n"));
process.exit(f1 ? 0 : 1);
