// The film board: the feed model (order, AGORA), the approvals and tracker readers, the CLI and a
// build on films with and without updates. The page is a stack: title, AGORA, the feed.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { approvalKey, readApprovals, readTracker } from "../core/board/tracker.mjs";
import { readScenes } from "../core/board/scenes.mjs";
import { feedOf, logCards, nowOf, readUpdates } from "../core/board/updates.mjs";
import { resolveMedia } from "../core/board/publish.mjs";
import { build, CAPABILITIES_LINE, parseArgs } from "../core/board/build.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const BOARD = path.join(here, "..", "core", "board");

const line = (o) => JSON.stringify(o);
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

// A film folder with the given crew files and media files (name → content).
function film({ crew = {}, files = {} } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "board-feed-"));
  const dir = path.join(root, "feed-film");
  const put = (rel, content) => {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), content);
  };
  fs.mkdirSync(dir);
  for (const [name, content] of Object.entries(crew)) put(`crew/${name}`, content);
  for (const [rel, content] of Object.entries(files)) put(rel, content);
  return { root, dir, out: path.join(root, "out") };
}

test("readUpdates drops bad lines and repeated ids, keeps the rest", () => {
  const r = readUpdates(
    [
      line({ id: "u1", t: "2026-10-15T20:00:00-03:00", title: "Um" }),
      "not json",
      line({ id: "u2", t: "yesterday", title: "Bad time" }),
      line({ id: "", t: "2026-10-15T21:00:00-03:00", title: "No id" }),
      line({ id: "u1", t: "2026-10-15T22:00:00-03:00", title: "Repeated" }),
      "",
      line({ id: "u3", t: "2026-10-15T22:00:00-03:00", title: "Três", media: ["a.png", 7, ""], needs: "Dê uma nota" }),
    ].join("\n"),
  );
  assert.deepEqual(r.items.map((x) => x.id), ["u1", "u3"]);
  assert.equal(r.dropped.length, 4);
  assert.deepEqual(r.items[1].media, ["a.png", "7"]);
  assert.equal(readUpdates(null), null);
});

test("feed order: t descending, equal times keep the later line first; the log is the fallback", () => {
  const u = readUpdates(
    [
      line({ id: "a", t: "2026-10-15T10:00:00-03:00", title: "A" }),
      line({ id: "c", t: "2026-10-15T12:00:00-03:00", title: "C" }),
      line({ id: "b1", t: "2026-10-15T11:00:00-03:00", title: "B1" }),
      line({ id: "b2", t: "2026-10-15T11:00:00-03:00", title: "B2" }),
      line({ id: "z", t: "2026-10-15T08:00:00-05:00", title: "Same instant as a" }),
    ].join("\n"),
  );
  assert.deepEqual(feedOf(u, "- 2026-10-16 — ignored when updates exist").map((c) => c.id), ["c", "b2", "b1", "z", "a"]);
  const log = "# Log\n\n- 2026-10-15 — newer line\n- 2026-10-14 — older line\n- no date here\n- 2026-10-15 — second of the day\n";
  assert.deepEqual(feedOf(null, log).map((c) => c.title), ["newer line", "second of the day", "older line"]);
  assert.ok(logCards(log).every((c) => c.kind === "log" && !c.media.length));
});

test("AGORA is the newest update with needs; none when no update asks", () => {
  const u = readUpdates(
    [
      line({ id: "u1", t: "2026-10-15T10:00:00-03:00", title: "Old ask", needs: "Veja o 1" }),
      line({ id: "u2", t: "2026-10-15T11:00:00-03:00", title: "Newest ask", needs: "Veja o 2" }),
      line({ id: "u3", t: "2026-10-15T12:00:00-03:00", title: "Just news" }),
    ].join("\n"),
  );
  assert.equal(nowOf(feedOf(u, null)).id, "u2");
  assert.equal(nowOf(feedOf(readUpdates(line({ id: "x", t: "2026-10-15T10:00:00-03:00", title: "No ask" })), null)), null);
  assert.equal(nowOf([]), null);
});

test("readScenes: film order, words from the sheet rows, status defaults to todo, bad items dropped", () => {
  const sheet = { beats: [{ id: "b01", says: "Um.", world: "A" }, { id: "b02", says: "Dois." }, { id: "b03", says: "Três.", world: "C" }] };
  const s = readScenes(
    [
      { n: 2, rows: ["b03"], title: "Segunda", status: "waiting", media: "out/x.png" },
      { n: 1, rows: ["b01", "b02"], title: "Primeira", status: "approved" },
      { n: 3, rows: ["b09"], title: "Sem linha", status: "weird", world: "C" },
      { n: 1, title: "Repetida" },
      { n: 0, title: "Zero" },
      { n: 4 },
    ],
    sheet,
  );
  assert.deepEqual(s.map((x) => [x.n, x.status, x.world, x.says]), [[1, "approved", "A", "Um. Dois."], [2, "waiting", "C", "Três."], [3, "todo", "C", ""]]);
  assert.deepEqual(s[1].media, ["out/x.png"]);
  assert.deepEqual(s[0].media, []);
  assert.equal(readScenes(null, sheet), null);
  assert.equal(readScenes({}, sheet), null);
});

test("resolveMedia: a path outside the film, a missing file or an unknown type is a problem", () => {
  const f = film({ files: { "out/a.png": PNG, "out/a.txt": "x" } });
  const r = resolveMedia(f.dir, ["out/a.png", "out/a.png", "../secret.png", "out/missing.png", "out/a.txt"]);
  assert.deepEqual(r.files.map((x) => x.rel), ["out/a.png"]);
  assert.equal(r.problems.length, 3);
  fs.rmSync(f.root, { recursive: true, force: true });
});

test("tracker: only the first next steps survive; null or non-object input is absent", () => {
  const t = readTracker({ now: [{ what: "a" }], next: [{ what: "b", who: "x" }, { who: "no what" }, "junk"], done: [] });
  assert.deepEqual(t, { next: [{ what: "b", who: "x" }] });
  assert.equal(readTracker(null), null);
  assert.equal(readTracker([]), null);
});

test("approvals: null for a missing or non-array file; closed items kept, status defaults to open", () => {
  assert.equal(readApprovals(null), null);
  assert.equal(readApprovals({ id: "x" }), null);
  const a = readApprovals([
    { id: "animatic", title: "Animatic", what: "ritmo", status: "open" },
    { id: "brief", status: "closed" },
    { id: "", title: "no id" },
    { id: "animatic", title: "duplicate" },
    { id: "cut" },
  ]);
  assert.deepEqual(a.map((x) => [x.id, x.status]), [["animatic", "open"], ["brief", "closed"], ["cut", "open"]]);
  assert.equal(a[1].title, "brief");
});

test("approval keys are safe db path segments", () => {
  assert.equal(approvalKey("animatic"), "animatic");
  assert.equal(approvalKey("a/b c"), "a-b-c");
  assert.equal(approvalKey(".."), "-");
  assert.ok(approvalKey("x".repeat(300)).length <= 120);
});

test("parseArgs: flags in both forms, film required, unknown options refused", () => {
  assert.deepEqual(parseArgs(["film", "--lang", "en", "--out=/tmp/x"]), {
    film: "film",
    lang: "en",
    theme: null,
    out: "/tmp/x",
  });
  assert.equal(parseArgs(["film"]).lang, "pt-BR");
  assert.throws(() => parseArgs(["--lang", "en"]), /film folder is required/);
  assert.throws(() => parseArgs(["film", "--bogus"]), /unknown option/);
  assert.throws(() => parseArgs(["film", "--theme"]), /needs a value/);
});

test("theme: dark tokens exist in both blocks and the sheets keep the light paper", () => {
  const css = fs.readFileSync(path.join(BOARD, "theme.css"), "utf8");
  const mediaDark = css.match(/@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme="light"\]\) \{([^}]*)\}/);
  const attrDark = css.match(/:root\[data-theme="dark"\] \{([^}]*)\}/);
  const light = css.match(/:root \{([^}]*)\}/);
  assert.ok(mediaDark, "prefers-color-scheme dark block");
  assert.ok(attrDark, "data-theme dark block");
  assert.ok(light, "light block");
  for (const block of [mediaDark[1], attrDark[1]]) assert.match(block, /--desk:\s*#1b1712/);
  const paper = (b) => b.match(/--paper:\s*(#[0-9a-f]{6})/i)?.[1] ?? null;
  assert.equal(paper(light[1]), "#f3eee2");
  assert.equal(paper(mediaDark[1]), null);
  assert.equal(paper(attrDark[1]), null);
});

test("CLI refuses a missing film folder with exit 1 and a usage error with exit 2", () => {
  const cli = path.join(BOARD, "build.mjs");
  const missing = spawnSync(process.execPath, [cli, path.join(os.tmpdir(), "no-such-film-" + process.pid)], {
    encoding: "utf8",
  });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /film folder not found/);
  const usage = spawnSync(process.execPath, [cli], { encoding: "utf8" });
  assert.equal(usage.status, 2);
  assert.match(usage.stderr, /usage:/);
});


const html = async (f, lang = "pt-BR") => fs.readFileSync((await build({ film: f.dir, lang, out: f.out })).index, "utf8");
const headings = (h) => [...h.matchAll(/<h([23])[^>]*>(.*?)<\/h\1>/gs)].map((m) => m[2].replace(/<[^>]+>/g, "").trim());

test("build on an empty film: title, AGORA with nothing to do, an empty feed, nothing else", async () => {
  const f = film();
  const r = await build({ film: f.dir, lang: "en", out: f.out });
  const h = fs.readFileSync(r.index, "utf8");
  assert.ok(h.startsWith("<title>Feed Film Board</title>"), "starts with the title");
  assert.doesNotMatch(h, /<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i);
  assert.ok(h.includes("Nothing needs you right now."));
  assert.ok(h.includes("Nothing published yet."));
  assert.doesNotMatch(h, /<details|<table|class="track"|id="gates"|id="log"|id="tracker"|id="scenes"/);
  assert.ok(r.bytes < 14 * 1024 * 1024);
  fs.rmSync(f.root, { recursive: true, force: true });
});

test("the page is header, AGORA, then the feed newest first; media sits inside its card", async () => {
  const f = film({
    crew: {
      "updates.jsonl": [
        line({ id: "u1", t: "2026-10-15T20:00:00-03:00", title: "Primeiro", note: "o começo", media: ["out/a.png"] }),
        line({ id: "u2", t: "2026-10-15T21:00:00-03:00", title: "Teste de movimento", media: ["out/m.mp4"] }),
        line({ id: "u3", t: "2026-10-15T21:30:00-03:00", title: "Voz", media: ["out/v.mp3"] }),
        line({ id: "u4", t: "2026-10-15T22:00:00-03:00", title: "Board 1", note: "veja", media: ["out/b.png"], needs: "Dê uma nota ao board 1" }),
        line({ id: "u5", t: "2026-10-15T22:10:00-03:00", title: "Só texto" }),
      ].join("\n"),
    },
    files: { "out/a.png": PNG, "out/b.png": PNG, "out/m.mp4": "video bytes", "out/v.mp3": "audio bytes" },
  });
  const h = await html(f);
  const at = (s) => h.indexOf(s);
  assert.ok(at('id="top"') < at('id="now"') && at('id="now"') < at('id="feed"'), "header, AGORA, feed");
  const order = [...h.matchAll(/<article class="post" id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(order, ["u5", "u4", "u3", "u2", "u1"]);
  assert.match(h, /<time class="num" datetime="2026-10-15T21:00:00-03:00">2026-10-15 21:00<\/time>/);
  const card = (id) => {
    const start = at(`<article class="post" id="${id}"`);
    return h.slice(start, h.indexOf("</article>", start));
  };
  assert.match(card("u1"), /<a href="media\/[^"]+"><img src="media\/[^"]+"/);
  assert.match(card("u2"), /<video controls[^>]*src="media\/[^"]+\.mp4"/);
  assert.match(card("u3"), /<audio controls[^>]*src="media\/[^"]+\.mp3"/);
  assert.doesNotMatch(card("u5"), /<img|<video|<audio/, "a text-only card");
  // AGORA: the newest update that asks, with the ask, its picture and the decision buttons.
  const now = h.slice(at('id="now"'), at('id="feed"'));
  assert.match(now, /data-approval="upd-u4"/);
  assert.ok(now.includes("Dê uma nota ao board 1") && /<img src="media\//.test(now));
  assert.match(now, /data-ap="approve" disabled>Aprovar</);
  assert.ok(now.indexOf("<img") < now.indexOf('data-ap="approve"'), "the picture above the buttons");
  assert.doesNotMatch(now, /Nada precisa|Nothing needs/);
  assert.equal([...h.matchAll(/data-approval=/g)].length, 1);
  // Every card carries its own comment target.
  assert.equal([...h.matchAll(/<article class="post"[^>]*data-comment-target/g)].length, 5);
  fs.rmSync(f.root, { recursive: true, force: true });
});

test("CENAS lists every scene in film order between AGORA and the feed, with status chips and no fake pictures", async () => {
  const f = film({
    crew: {
      "sync-sheet.json": JSON.stringify({ beats: [{ id: "b01", says: "A primeira", world: "A" }, { id: "b02", says: "da vida.", world: "A" }, { id: "b03", says: "Uma palavra", world: "C" }] }),
      "scenes.json": JSON.stringify([
        { n: 3, rows: ["b03"], title: "Terceira", status: "todo" },
        { n: 1, rows: ["b01", "b02"], title: "Primeira", status: "approved", media: "out/c1.png" },
        { n: 2, rows: ["b03"], title: "Segunda", world: "C", status: "waiting", media: "out/c2.png" },
      ]),
      "updates.jsonl": line({ id: "u1", t: "2026-10-15T20:00:00-03:00", title: "Cena 2 de 3" }),
    },
    files: { "out/c1.png": PNG, "out/c2.png": PNG },
  });
  const h = await html(f);
  assert.ok(h.indexOf('id="now"') < h.indexOf('id="scenes"') && h.indexOf('id="scenes"') < h.indexOf('id="feed"'), "AGORA, CENAS, feed");
  assert.match(h, /<h2 class="kicker" id="scenes-h">Cenas<\/h2>/);
  const order = [...h.matchAll(/<li class="scene" id="cena-(\d+)"/g)].map((m) => m[1]);
  assert.deepEqual(order, ["1", "2", "3"], "film order, scene 1 first");
  const sc = (n) => {
    const start = h.indexOf(`id="cena-${n}"`);
    return h.slice(start, h.indexOf("</li>", start));
  };
  assert.ok(sc(1).includes("A primeira da vida.") && sc(1).includes("Mundo A · vermelho"), "words joined from the rows, world labelled");
  assert.match(sc(1), /chip--ok">Aprovada</);
  assert.match(sc(2), /chip--bad">Aguardando nota</);
  assert.match(sc(3), /chip--muted">A fazer</);
  assert.match(sc(1), /<img src="media\//);
  assert.match(sc(2), /<img src="media\//);
  assert.doesNotMatch(sc(3), /<img/, "no picture yet: an empty paper");
  assert.match(sc(3), /class="pic blank"[^>]*>a fazer</);
  fs.rmSync(f.root, { recursive: true, force: true });
});

test("AGORA says nothing is needed when no update asks, even with a stale approvals file", async () => {
  const f = film({
    crew: {
      "updates.jsonl": line({ id: "u1", t: "2026-10-15T20:00:00-03:00", title: "Só uma novidade" }),
      "approvals.json": JSON.stringify([{ id: "brief", title: "Brief", status: "closed" }]),
    },
  });
  const h = await html(f);
  assert.match(h, /Nada precisa de você agora\./);
  assert.doesNotMatch(h, /data-approval=/);
  fs.rmSync(f.root, { recursive: true, force: true });
});

test("open approvals and the tracker's next step show inside AGORA", async () => {
  const f = film({
    crew: {
      "updates.jsonl": line({ id: "u1", t: "2026-10-15T20:00:00-03:00", title: "Novidade" }),
      "approvals.json": JSON.stringify([{ id: "animatic", title: "Animatic", what: "ritmo", status: "open" }, { id: "brief", status: "closed" }]),
      "tracker.json": JSON.stringify({ next: [{ what: "Board 2", who: "diretor" }, { what: "Animatic" }] }),
    },
  });
  const h = await html(f);
  const now = h.slice(h.indexOf('id="now"'), h.indexOf('id="feed"'));
  assert.match(now, /data-approval="animatic"/);
  assert.doesNotMatch(now, /data-approval="brief"/);
  assert.match(now, /A seguir: Board 2/);
  assert.doesNotMatch(now, /Animatic<\/p>/, "only the first next step");
  fs.rmSync(f.root, { recursive: true, force: true });
});

test("a film without updates.jsonl shows its log lines as text-only cards", async () => {
  const f = film({ crew: { "board-log.md": "# Registro\n\n- 2026-10-15 — Brief aprovado.\n- 2026-10-14 — Começou.\n" } });
  const h = await html(f, "en");
  const order = [...h.matchAll(/<article class="post"[^>]*>.*?<h3>(.*?)<\/h3>/gs)].map((m) => m[1]);
  assert.deepEqual(order, ["Brief aprovado.", "Começou."]);
  fs.rmSync(f.root, { recursive: true, force: true });
});

test("nothing from the old template is on the page and no heading repeats", async () => {
  const f = film({
    crew: {
      "updates.jsonl": [
        line({ id: "u1", t: "2026-10-15T20:00:00-03:00", title: "Board 1", needs: "Dê uma nota" }),
        line({ id: "u2", t: "2026-10-15T21:00:00-03:00", title: "Board 2" }),
      ].join("\n"),
      "brief.md": "# Brief: x\n\n**Question the film answers:** Why?\n",
      "script.md": "# Feed Film (feed-film)\n\n## Lines\n\n| id | text | beat | stress |\n|---|---|---|---|\n| L01 | Olá | b01 | - |\n",
      "board-log.md": "- 2026-10-15 — registro antigo\n",
      "tracker.json": JSON.stringify({ done: [{ what: "algo feito" }] }),
    },
  });
  const h = await html(f);
  assert.doesNotMatch(h, /<details|<table|<summary|Arquivo|Registro|Andamento|Etapas|Verificações|Onde o filme está|Ainda sem material|registro antigo|algo feito/);
  const hs = headings(h);
  assert.equal(new Set(hs).size, hs.length, `a heading is repeated: ${hs.join(" | ")}`);
  assert.match(h, /<h1>Feed Film<\/h1>/);
  fs.rmSync(f.root, { recursive: true, force: true });
});

test("media outside the film, missing or too big is left out and reported, never a crash", async () => {
  const f = film({
    crew: { "updates.jsonl": line({ id: "u1", t: "2026-10-15T20:00:00-03:00", title: "Com mídia", media: ["../x.png", "out/none.png", "out/ok.png"] }) },
    files: { "out/ok.png": PNG },
  });
  const r = await build({ film: f.dir, lang: "pt-BR", out: f.out });
  const h = fs.readFileSync(r.index, "utf8");
  assert.equal([...h.matchAll(/<img /g)].length, 1);
  assert.equal(r.data.errors.length, 2);
  assert.match(h, /outside the film folder/);
  fs.rmSync(f.root, { recursive: true, force: true });
});

test("the CLI prints the capabilities line", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "board-cli-"));
  const film = path.join(root, "cli-film");
  fs.mkdirSync(film);
  const r = spawnSync(process.execPath, [path.join(BOARD, "build.mjs"), film, "--out", path.join(root, "out")], {
    encoding: "utf8",
  });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.split("\n").includes(CAPABILITIES_LINE));
  assert.ok(fs.existsSync(path.join(root, "out", "index.html")));
  fs.rmSync(root, { recursive: true, force: true });
});

// The host takes up to 15 MB per binary file and 64 MB per publish: a board is capped per file,
// not by an old 13 MB page total, so a full draft video still goes on it.
test("board media: a file up to 15 MB is kept, a bigger one is left out, the total is not 13 MB", async () => {
  const { Media, FILE_MAX_BYTES } = await import("../core/board/media.mjs");
  const { publish, TOO_BIG } = await import("../core/board/publish.mjs");
  assert.equal(FILE_MAX_BYTES, 15 * 1024 * 1024);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "board-media-"));
  const big = (name, mb) => {
    const p = path.join(root, name);
    fs.writeFileSync(p, "");
    fs.truncateSync(p, Math.round(mb * 1024 * 1024));
    return { rel: name, abs: p, kind: "video", size: fs.statSync(p).size };
  };
  const media = new Media(path.join(root, "out"));
  const { published, skipped } = await publish([big("a.mp4", 14.5), big("b.mp4", 9), big("c.mp4", 16)], media);
  assert.deepEqual([...published.keys()], ["a.mp4", "b.mp4"]);
  assert.ok(media.used > 13 * 1024 * 1024);
  assert.deepEqual(skipped, [{ rel: "c.mp4", reason: TOO_BIG }]);
  fs.rmSync(root, { recursive: true, force: true });
});
