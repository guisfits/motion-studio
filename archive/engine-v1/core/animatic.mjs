// The animatic: a real, low-rate render of the film's own draw(t) with the narration muxed in,
// so the client sees every caption chunk, lettering and mark when it lands, before any full render.
// It runs to the voice end, or through the house outro window to its t1 when the film declares
// FILM.house. Beside it a contact sheet: one labelled still per beat, at the beat's first key word.
//
//   node core/animatic.mjs <film-dir> [--format 9x16] [--fps N]
//
// Reads crew/sync-sheet.json and voice/voice.wav; writes out/animatic-<format>.mp4 and a contact
// sheet out/animatic-<format>.png labelled with the beat ids. The picture is render.mjs --draft at
// NORMS.animatic (12 fps, 540 wide, no subframes, no blur); the sheet stills come from
// render.mjs --stills at full size. The gates' animatic stage (core/checks/run.mjs) does not read
// this file: it samples the trace and camera from the film page.
import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { makeSheet } from "./critique/sheet.mjs";
import { NORMS } from "./checks/norms.mjs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const filmArg = process.argv[2];
if (!filmArg || filmArg.startsWith("--")) {
  console.error("usage: node core/animatic.mjs <film-dir> [--format 9x16] [--fps N]");
  process.exit(2);
}
const film = resolve(filmArg);
const format = arg("format", "9x16");
const fps = Number(arg("fps", NORMS.animatic.fps));
if (!(fps > 0)) {
  console.error(`--fps must be a positive number, got ${arg("fps")}`);
  process.exit(2);
}
const renderPath = fileURLToPath(new URL("./render.mjs", import.meta.url));
const render = (...args) =>
  execFileSync(process.execPath, [renderPath, film, "--format", format, ...args], { stdio: "inherit" });
const probe = (file) =>
  Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file])
      .toString()
      .trim(),
  );

const { beats } = JSON.parse(readFileSync(join(film, "crew", "sync-sheet.json"), "utf8"));
// A beat is shown on the sheet at its first key word (where the picture must already land), else at its start.
const times = beats.map((b) => b.key?.[0]?.t ?? b.t[0]);
const voice = join(film, "voice", "voice.wav");
const voiceS = probe(voice);
const late = beats.findIndex((b) => !(b.t[0] < voiceS));
if (late >= 0)
  throw new Error(`beat ${beats[late].id} starts at ${beats[late].t[0]} s, after the voice ends (${voiceS} s)`);

// The contact sheet: render.mjs names stills NNN-<t>s.png, so name order is beat order.
render("--stills", times.join(","));
const stillsDir = join(film, "out", `stills-${format}`);
const stills = readdirSync(stillsDir)
  .filter((f) => f.endsWith(".png"))
  .sort()
  .map((f) => join(stillsDir, f));
if (stills.length !== beats.length)
  throw new Error(`expected ${beats.length} stills, render made ${stills.length}`);

// The picture: draw(t) every 1/fps s from 0. One extra frame so it never ends before the narration;
// --through-house extends it to the house window's t1 when the film declares one.
const out = join(film, "out");
mkdirSync(out, { recursive: true });
const silent = join(out, `animatic-silent-${format}.mp4`);
render(
  "--draft", "--fps", String(fps), "--sub", "1", "--width", String(NORMS.animatic.width),
  "--to", (voiceS + 1 / fps).toFixed(3), "--through-house", "--out", silent,
);

// The narration over the picture. The picture sets the length (a house window outlasts the voice,
// so the voice is padded with silence there); -t cuts the audio at the picture's end otherwise.
const mp4 = join(out, `animatic-${format}.mp4`);
execFileSync(
  "ffmpeg",
  ["-y", "-loglevel", "error", "-i", silent, "-i", voice, "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-af", "apad", "-c:a", "aac", "-t", probe(silent).toFixed(3),
    "-movflags", "+faststart", mp4],
  { stdio: "inherit" },
);
rmSync(silent, { force: true });

await makeSheet(
  beats.map((b, i) => ({ file: stills[i], label: b.id })),
  join(out, `animatic-${format}.png`),
  { title: `${format} · animatic · ${beats.length} beats` },
);
console.log(`animatic: ${mp4}`);
