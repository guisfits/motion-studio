import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { scriptHash } from "../core/checks/facts.mjs";

const runPath = fileURLToPath(
  new URL("../core/checks/run.mjs", import.meta.url),
);
const fixture = fileURLToPath(new URL("./fixture-trace", import.meta.url));
const dir = fileURLToPath(new URL("./.tmp-films/checks-run", import.meta.url));
const run = (...args) =>
  spawnSync(process.execPath, [runPath, ...args], { encoding: "utf8" });

// A film on paper: narration of `end` seconds, one beat over all of it, one ready licensed hero.
function paperFilm(end, app, register) {
  rmSync(dir, { recursive: true, force: true });
  cpSync(fixture, dir, { recursive: true });
  mkdirSync(`${dir}/voice`, { recursive: true });
  mkdirSync(`${dir}/crew`, { recursive: true });
  const json = (p, v) => writeFileSync(`${dir}/${p}`, JSON.stringify(v));
  json("voice/words.json", {
    words: [
      { w: "Lutero", start: 1, end: 1.4 },
      { w: "fim", start: end - 0.4, end },
    ],
  });
  json("crew/manifest.json", {
    assets: [{ id: "luther", source: "https://x", licence: "PD", status: "ready" }],
  });
  const script = "L1 Lutero.\n";
  writeFileSync(`${dir}/crew/script.md`, script);
  json("crew/fact-check.json", {
    checker: "film-fact-checker",
    script: scriptHash(script),
    verdict: "PASS",
    claims: [{ id: "C01", line: "L1", verdict: "confirmed" }],
    lettering: [],
    pictures: [{ asset: "luther", verdict: "confirmed" }],
  });
  json("crew/sync-sheet.json", {
    beats: [
      {
        id: "b1",
        t: [1, end],
        says: "Lutero fim",
        key: [{ word: "Lutero", t: 1 }],
        hero: { asset: "luther" },
        lettering: [],
      },
    ],
    ...(app ? { app } : {}),
    ...(register ? { register } : {}),
  });
}
const findings = (stage) =>
  JSON.parse(
    readFileSync(`${dir}/crew/checks-${stage}.json`, "utf8"),
  ).findings.map((f) => f.code);

test("an unknown or missing stage, or no film, is a usage error", () => {
  paperFilm(50);
  for (const args of [
    [dir, "--stage", "bogus"],
    [dir, "--stage"],
    [dir, "--stage", "--format"],
    [],
    ["--stage", "sheet"],
  ]) {
    const r = run(...args);
    assert.equal(r.status, 2, args.join(" "));
    assert.match(r.stderr, /usage: node core\/checks\/run\.mjs/);
  }
  rmSync(dir, { recursive: true, force: true });
});

test("the sheet stage passes a clean paper film and fails a short narration", () => {
  paperFilm(50);
  const ok = run(dir, "--stage", "sheet");
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /sheet: PASS/);
  paperFilm(20);
  const short = run(dir, "--stage", "sheet");
  assert.equal(short.status, 1);
  assert.deepEqual(findings("sheet"), ["F1"]);
  rmSync(dir, { recursive: true, force: true });
});

test("a film with an app segment measures the story and the app part apart", () => {
  paperFilm(118, { t0: 88 });
  const ok = run(dir, "--stage", "sheet");
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  // A story over NORMS.film.maxS (120 s) is red even when the app part is fine.
  paperFilm(155, { t0: 125 });
  assert.equal(run(dir, "--stage", "sheet").status, 1);
  assert.deepEqual(findings("sheet"), ["F1"]);
  paperFilm(130, { t0: 70 });
  assert.equal(run(dir, "--stage", "sheet").status, 1);
  assert.deepEqual(findings("sheet"), ["F1"]);
  rmSync(dir, { recursive: true, force: true });
});

test("a sheet's register picks the film length it is graded by", () => {
  // 50 s passes register A (45-90 s) and fails the instructive floor (60 s).
  paperFilm(50);
  assert.equal(run(dir, "--stage", "sheet").status, 0);
  paperFilm(50, undefined, "instructive");
  assert.equal(run(dir, "--stage", "sheet").status, 1);
  assert.deepEqual(findings("sheet"), ["F1"]);
  paperFilm(70, undefined, "instructive");
  assert.equal(run(dir, "--stage", "sheet").status, 0);
  // A 22 s app segment passes the instructive 15-30 s; a 36 s one fails it.
  paperFilm(110, { t0: 88 }, "instructive");
  assert.equal(run(dir, "--stage", "sheet").status, 0);
  paperFilm(120, { t0: 84 }, "instructive");
  assert.equal(run(dir, "--stage", "sheet").status, 1);
  assert.deepEqual(findings("sheet"), ["F1"]);
  paperFilm(70, undefined, "bogus");
  assert.notEqual(run(dir, "--stage", "sheet").status, 0);
  rmSync(dir, { recursive: true, force: true });
});

// Two beats over the film, each its own scene unless `continues` joins them; `second` is the
// manifest row of the picture the second beat reuses.
function reuseFilm({ continues, second, subject = "Luther (portrait)" }) {
  paperFilm(50);
  const json = (p, v) => writeFileSync(`${dir}/${p}`, JSON.stringify(v));
  const sheet = JSON.parse(readFileSync(`${dir}/crew/sync-sheet.json`, "utf8"));
  const [b1] = sheet.beats;
  sheet.beats = [
    { ...b1, t: [1, 25], says: "Lutero" },
    { ...b1, id: "b2", t: [25, 50], hero: { asset: second.id }, key: [{ word: "fim", t: 49.6 }], says: "fim", lettering: [] },
  ];
  json("crew/sync-sheet.json", sheet);
  const manifest = JSON.parse(readFileSync(`${dir}/crew/manifest.json`, "utf8"));
  manifest.assets[0] = { ...manifest.assets[0], kind: "hero", subject };
  if (second.id !== "luther") manifest.assets.push({ ...manifest.assets[0], ...second });
  json("crew/manifest.json", manifest);
  json("crew/scenes.json", [
    { n: 1, rows: ["b1"] },
    { n: 2, rows: ["b2"], ...(continues ? { continues: 1 } : {}) },
  ]);
}

test("S10: the same portrait in two scenes is red; a scene that continues the first is not", () => {
  reuseFilm({ second: { id: "luther" } });
  assert.equal(run(dir, "--stage", "sheet").status, 1);
  assert.deepEqual(findings("sheet"), ["S10"]);
  const msg = JSON.parse(readFileSync(`${dir}/crew/checks-sheet.json`, "utf8")).findings[0].msg;
  assert.match(msg, /luther.*scenes 1, 2/);
  reuseFilm({ continues: true, second: { id: "luther" } });
  const ok = run(dir, "--stage", "sheet");
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  rmSync(dir, { recursive: true, force: true });
});

test("S10: a texture or a document reused across scenes is not a finding, and no scenes.json skips the check", () => {
  reuseFilm({ second: { id: "grain", kind: "texture", subject: "grain (texture)" } });
  assert.equal(run(dir, "--stage", "sheet").status, 0);
  reuseFilm({ second: { id: "luther" }, subject: "Luther's letter (page)" });
  assert.equal(run(dir, "--stage", "sheet").status, 0);
  reuseFilm({ second: { id: "luther" } });
  rmSync(`${dir}/crew/scenes.json`);
  assert.equal(run(dir, "--stage", "sheet").status, 0);
  rmSync(dir, { recursive: true, force: true });
});

test("the script stage signs the fact-check before any voice, sheet or manifest exists", () => {
  paperFilm(50);
  for (const p of ["voice/words.json", "crew/sync-sheet.json", "crew/manifest.json"]) rmSync(`${dir}/${p}`);
  const ok = run(dir, "--stage", "script");
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /script: PASS/);
  writeFileSync(`${dir}/crew/script.md`, "L1 Lutero mudou.\n");
  const stale = run(dir, "--stage", "script");
  assert.equal(stale.status, 1);
  assert.deepEqual(findings("script"), ["X2"]);
  rmSync(dir, { recursive: true, force: true });
});

test("the fact-check gates the script and the final cut only, never the stages between (X1)", () => {
  paperFilm(50);
  rmSync(`${dir}/crew/fact-check.json`);
  const mid = run(dir, "--stage", "sheet");
  assert.equal(mid.status, 0, mid.stdout + mid.stderr);
  assert.equal(run(dir, "--stage", "script").status, 1);
  assert.deepEqual(findings("script"), ["X1"]);
  run(dir, "--stage", "final");
  assert.ok(findings("final").includes("X1"));
  rmSync(dir, { recursive: true, force: true });
});

test(
  "the draft stage checks the picture and reports missing media",
  { timeout: 120_000 },
  () => {
    paperFilm(50);
    const r = run(dir, "--stage", "draft");
    assert.equal(r.status, 1, r.stdout + r.stderr);
    const codes = findings("draft");
    assert.ok(codes.includes("F2"), codes.join(" "));
    // The fixture's hero is traced as "hero", not the manifest's "luther".
    assert.ok(codes.includes("H1"), codes.join(" "));
    assert.ok(codes.includes("P1"), codes.join(" "));
    // One event (the caption) in 3 s is off register A's rhythm; the caption has no cap height.
    assert.ok(codes.includes("R1"), codes.join(" "));
    assert.ok(codes.includes("T10"), codes.join(" "));
    // No video, no contrast reading: F2 says why.
    assert.ok(!codes.includes("T11"), codes.join(" "));
    // With the draft rendered, T11 reads it: the fixture's caption registers no text colour.
    mkdirSync(`${dir}/out`, { recursive: true });
    const ff = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i",
      "color=c=white:s=108x192:d=3:r=30", "-pix_fmt", "yuv420p", `${dir}/out/draft-9x16.mp4`]);
    assert.equal(ff.status, 0, String(ff.stderr));
    run(dir, "--stage", "draft");
    const rendered = findings("draft");
    assert.ok(rendered.includes("T11") && !rendered.includes("F2"), rendered.join(" "));
    rmSync(dir, { recursive: true, force: true });
  },
);

test(
  "the animatic stage runs the rhythm gates with the voice, not the caption type",
  { timeout: 120_000 },
  () => {
    paperFilm(50);
    const r = run(dir, "--stage", "animatic");
    assert.equal(r.status, 1, r.stdout + r.stderr);
    const codes = findings("animatic");
    // 2 spoken words over 1 event: under register A's words per event.
    assert.ok(codes.includes("R3"), codes.join(" "));
    assert.ok(!codes.some((c) => ["T10", "T11", "R4", "F2"].includes(c)), codes.join(" "));
    rmSync(dir, { recursive: true, force: true });
  },
);

test(
  "the final stage runs the SFX cue gate only when crew/sfx-cues.json exists",
  { timeout: 240_000 },
  () => {
    paperFilm(50);
    run(dir, "--stage", "final");
    const without = findings("final");
    assert.ok(
      !without.some((c) => c === "M4" || c === "M5" || c === "M6"),
      without.join(" "),
    );
    // An SFX stem with no cue file cannot be gated: red M6.
    mkdirSync(`${dir}/out`, { recursive: true });
    writeFileSync(`${dir}/out/sfx.wav`, "");
    run(dir, "--stage", "final");
    assert.ok(findings("final").includes("M6"), findings("final").join(" "));
    // Three cues 0.1 s apart over the word "Lutero" (1–1.4 s): density red, word orange.
    writeFileSync(
      `${dir}/crew/sfx-cues.json`,
      JSON.stringify([
        { t: 1.1, type: "click", gain: 1, len: 0.2 },
        { t: 1.2, type: "click", gain: 1, len: 0.2 },
        { t: 1.3, type: "click", gain: 1, len: 0.2 },
      ]),
    );
    // The stem was not rendered by sfx.mjs (no sidecar): the gate cannot vouch for the mix.
    run(dir, "--stage", "final");
    assert.ok(findings("final").includes("M6"), findings("final").join(" "));
    // A sidecar hashed from another cue file: the stem is stale.
    const cueBytes = readFileSync(`${dir}/crew/sfx-cues.json`);
    const sidecar = (sha256, cues) =>
      writeFileSync(`${dir}/out/sfx.wav.cues.json`, JSON.stringify({ source: "crew/sfx-cues.json", sha256, cues }));
    const list = JSON.parse(cueBytes);
    sidecar("0".repeat(64), list);
    run(dir, "--stage", "final");
    assert.ok(findings("final").includes("M6"), findings("final").join(" "));
    // A matching sidecar: M6 is gone, and M4/M5 read the cues the stem was rendered from.
    const sha = createHash("sha256").update(cueBytes).digest("hex");
    sidecar(sha, list);
    run(dir, "--stage", "final");
    const withCues = findings("final");
    assert.ok(withCues.includes("M4"), withCues.join(" "));
    assert.ok(withCues.includes("M5"), withCues.join(" "));
    assert.ok(!withCues.includes("M6"), withCues.join(" "));
    // The gate audits what was rendered: a thinned sidecar list clears M4/M5 although the file is dense.
    sidecar(sha, [{ t: 2.5, type: "click", gain: 1, len: 0.1 }]);
    run(dir, "--stage", "final");
    const thinned = findings("final");
    assert.ok(!thinned.some((c) => c === "M4" || c === "M5" || c === "M6"), thinned.join(" "));
    // The gate belongs to the final stage alone.
    run(dir, "--stage", "sheet");
    assert.ok(!findings("sheet").some((c) => c === "M4" || c === "M5"));
    rmSync(dir, { recursive: true, force: true });
  },
);
