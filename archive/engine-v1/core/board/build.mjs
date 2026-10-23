#!/usr/bin/env node
// The film board: one page per film, the director's feed for the client. The page is a stack:
// the film's title, AGORA (what the client must do now), CENAS (the scenes in film order) and the
// updates, newest first.
//
//   node core/board/build.mjs <film> [--lang pt-BR|en] [--theme <css>] [--out <dir>]
//
// Writes <film>/out/board/index.html (or <dir>/index.html) and its media next to it.
//
// The feed is <film>/crew/updates.jsonl, one JSON object per line, appended by the crew when a
// step lands (one line per landed step; the first steps come last on the page):
//
//   {"id":"u012","t":"2026-10-15T22:00:00-03:00","title":"Board 1 de 34","note":"one to three lines",
//    "media":["out/storyboard/c6-board-01.png"],"needs":"Dê uma nota ao board 1"}
//
// `id`, `t` (ISO with offset) and `title` are required. `media` are paths relative to the film
// (image, mp4, mp3/wav); the build copies them next to the page, scaled down. `needs`, when set,
// says in one line what the client must do: the newest update with `needs` is the AGORA card,
// with the approve / ask-for-changes / reject buttons (db doc `approvals/upd-<id>`). A film
// without updates.jsonl shows crew/board-log.md lines as text-only cards. crew/approvals.json
// (open items) adds approval cards to AGORA; crew/tracker.json's first `next` is one quiet line.
//
// CENAS lists the film's scenes in film order from <film>/crew/scenes.json:
//
//   [{"n":1,"rows":["b01","b02"],"title":"Lutero, 95, indulgências","world":"A","status":"approved",
//     "media":"out/storyboard/c6-cena-01.png"}]
//
// `n` and `title` are required. `rows` are beat ids of crew/sync-sheet.json; their `says` become
// the words of the scene. `status` is approved | waiting | todo. `media` is the scene's board
// picture, absent until it exists (the card then shows an empty paper marked "a fazer").
// Every input is optional: a missing file leaves its part in the "nothing yet" state.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collect } from "./collect.mjs";
import { Media, PUBLISH_MAX_BYTES, hasFfmpeg } from "./media.mjs";
import { pageHtml } from "./page.mjs";
import { publish, resolveMedia } from "./publish.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));

export const LANGS = Object.freeze({ "pt-BR": "labels.pt-BR.json", en: "labels.en.json" });
// The runtime the page declares; the publishing step passes the same object as `capabilities`.
export const CAPABILITIES = Object.freeze({ db: {}, user: {}, comments: { composer_only: true } });
export const CAPABILITIES_LINE = "capabilities: { db: {}, user: {}, comments: { composer_only: true } }";

const pad = (n) => String(n).padStart(2, "0");
// Local time with its offset, so the page's "updated" stamp reads in the director's clock.
export function localIso(d = new Date()) {
  const off = -d.getTimezoneOffset();
  const a = Math.abs(off);
  const sign = off >= 0 ? "+" : "-";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}

// The theme: the engine's tokens, then the project's file (if any) after them, so its tokens win.
export function themeCss(theme) {
  const base = fs.readFileSync(path.join(here, "theme.css"), "utf8");
  return theme ? `${base}\n${fs.readFileSync(path.resolve(theme), "utf8")}` : base;
}

function dirSize(dir) {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    n += e.isDirectory() ? dirSize(p) : fs.statSync(p).size;
  }
  return n;
}

// Copies every file the scenes and the feed point at next to the page and hangs the result on each card as
// `files: [{ rel, kind, src | null, reason }]`. Returns what could not be used, for the build log.
async function publishFeed(film, feed, media, errors) {
  const { files, problems } = resolveMedia(film, feed.flatMap((c) => c.media));
  errors.push(...problems.map((p) => `media ${p}`));
  const { published, skipped } = await publish(files, media);
  const reasons = new Map(skipped.map((s) => [s.rel, s.reason]));
  const bad = new Set(problems.map((p) => p.split(":")[0]));
  for (const card of feed)
    card.files = card.media
      .filter((rel) => !bad.has(rel))
      .map((rel) => ({ rel, kind: published.get(rel)?.kind ?? null, src: published.get(rel)?.src ?? null, reason: reasons.get(rel) ?? null }));
  return skipped;
}

// The page's parts as short words, for the build output.
export function sectionSummary(d) {
  const open = (d.approvals ?? []).filter((a) => a.status === "open").length;
  const now = d.feed.find((c) => c.needs);
  return [
    ["now", now ? now.id : open ? `${open} approvals` : "none"],
    ["scenes", d.scenes ? `${d.scenes.length} scenes` : "not yet"],
    ["feed", d.feed.length ? `${d.feed.length} cards` : "not yet"],
  ];
}

// Builds the board for `film`. Returns the output paths and sizes; throws only for a film folder
// that does not exist, an unknown language, or a theme file that cannot be read.
export async function build({ film, lang = "pt-BR", theme, out } = {}) {
  if (!film) throw new Error("film folder is required");
  const filmDir = path.resolve(film);
  if (!fs.existsSync(filmDir) || !fs.statSync(filmDir).isDirectory()) throw new Error(`film folder not found: ${filmDir}`);
  if (!LANGS[lang]) throw new Error(`unknown --lang "${lang}" (use pt-BR or en)`);
  const L = JSON.parse(fs.readFileSync(path.join(here, LANGS[lang]), "utf8"));

  const css = themeCss(theme);
  const data = collect(filmDir);
  data.lang = L.lang;
  data.builtAt = localIso();

  const outDir = out ? path.resolve(out) : path.join(filmDir, "out", "board");
  fs.mkdirSync(outDir, { recursive: true });
  const media = new Media(outDir);
  const skipped = await publishFeed(filmDir, [...(data.scenes ?? []), ...data.feed], media, data.errors);

  const index = path.join(outDir, "index.html");
  fs.writeFileSync(index, pageHtml(data, L, { css }));

  const total = dirSize(outDir);
  if (total > PUBLISH_MAX_BYTES) throw new Error(`board is ${total} bytes, over the 64 MB publish limit`);
  return {
    index,
    outDir,
    bytes: total,
    mediaBytes: media.used,
    skipped,
    data,
    ffmpeg: hasFfmpeg(),
    mediaFiles: fs.readdirSync(media.dir).sort().map((f) => `media/${f}`),
  };
}

const USAGE = "usage: node core/board/build.mjs <film> [--lang pt-BR|en] [--theme <css>] [--out <dir>]";

// `--key value` or `--key=value`; the first bare word is the film folder.
export function parseArgs(argv) {
  const opts = { film: null, lang: "pt-BR", theme: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const m = a.match(/^--(lang|theme|out)(?:=(.*))?$/);
    if (m) {
      const v = m[2] ?? argv[++i];
      if (v == null || v === "") throw new Error(`--${m[1]} needs a value`);
      opts[m[1]] = v;
    } else if (a.startsWith("--")) throw new Error(`unknown option ${a}`);
    else if (!opts.film) opts.film = a;
    else throw new Error(`unexpected argument ${a}`);
  }
  if (!opts.film) throw new Error("film folder is required");
  return opts;
}

async function main(argv) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    console.error(`${e.message}\n${USAGE}`);
    return 2;
  }
  try {
    const r = await build(opts);
    const mb = (n) => `${(n / (1024 * 1024)).toFixed(2)} MB`;
    console.log(`board: ${r.index}`);
    console.log(`size: ${mb(r.bytes)} total, ${mb(r.mediaBytes)} media`);
    console.log(CAPABILITIES_LINE);
    console.log(`sections: ${sectionSummary(r.data).map(([k, v]) => `${k}=${v}`).join(" ")}`);
    console.log(`media files (pass in \`files\`): ${r.mediaFiles.join(" ") || "none"}`);
    for (const s of r.skipped) console.log(`media skipped: ${s.rel} (${s.reason})`);
    if (!r.ffmpeg) console.log("ffmpeg not found: pictures are copied as they are, wav audio skipped");
    if (r.data.errors.length) console.log(`read errors: ${r.data.errors.join("; ")}`);
    return 0;
  } catch (e) {
    console.error(`board: ${e.message}`);
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
