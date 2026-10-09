import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const studio = fileURLToPath(new URL("..", import.meta.url));
const film = fileURLToPath(new URL("./fixture-voice", import.meta.url));
const out = `${film}/out`;

// lib/voice.js has no DOM dependency at import time; loadVoice only needs fetch, so a stub that
// serves the fixture's words.json is enough to test it in node.
const { loadVoice } = await import("../core/lib/voice.js");
const realFetch = globalThis.fetch;
globalThis.fetch = async (path) => {
  try {
    const body = readFileSync(`${film}/${path}`, "utf8");
    return { ok: true, json: async () => JSON.parse(body) };
  } catch {
    return { ok: false };
  }
};
const V = await loadVoice("voice/words.json");
globalThis.fetch = realFetch;

test("at() returns when a word is said, ignoring case and punctuation", () => {
  assert.equal(V.at("in"), 0.5);
  assert.equal(V.at("LONDON"), 1.0, "first match, trailing comma ignored");
  assert.equal(V.at("London", { end: true }), 1.4);
  assert.equal(V.at("London", { nth: 1 }), 1.6);
  assert.equal(V.at("London", { line: "uno", nth: 1 }), 1.6);
});

test("at() throws naming the word when it is not in the narration", () => {
  assert.throws(() => V.at("Geneva"), /"Geneva" is not in the narration/);
  assert.throws(() => V.at("Paris", { line: "uno" }), /"Paris" in uno is not in the narration/);
  assert.throws(() => V.at("London", { nth: 5 }), /not in the narration/);
});

test("line() and words() read the lines of the script", () => {
  assert.deepEqual(V.line("dos"), { id: "dos", text: "London Paris", start: 2.5, end: 3.5 });
  assert.throws(() => V.line("tres"), /no line "tres"/);
  assert.deepEqual(V.words("dos").map((w) => w.w), ["Paris"]);
});

test("loadVoice fails loudly when words.json is missing", async () => {
  globalThis.fetch = async () => ({ ok: false });
  try {
    await assert.rejects(loadVoice("voice/nope.json"), /voice\/nope\.json missing/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

// Number of dark (ink) pixels in a PNG; the stage is the light ground, so any ink is the caption.
const ink = (png) => {
  const raw = execFileSync("ffmpeg", ["-loglevel", "error", "-i", png, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    { maxBuffer: 1 << 28 });
  let n = 0;
  for (let i = 0; i < raw.length; i += 3) if (raw[i] + raw[i + 1] + raw[i + 2] < 240) n++;
  return n;
};

test("a word is invisible before it is spoken and visible after", { timeout: 120_000 }, () => {
  rmSync(out, { recursive: true, force: true });
  // Before the line starts, between "In" and the key word "London", and after the key word.
  execFileSync("node", [`${studio}/core/render.mjs`, film, "--stills", "0.2,0.8,1.3"], { stdio: "pipe" });
  const [none, small, big] = ["000-0.20s", "001-0.80s", "002-1.30s"].map((f) => ink(`${out}/stills-9x16/${f}.png`));
  assert.equal(none, 0, "nothing on screen before the line starts");
  assert.ok(small > 0, "the small word 'Em' is on screen once said");
  assert.ok(big > small * 5, `the big key word adds a lot of ink after its start (${small} -> ${big})`);
});

// Raw RGB of a PNG: { w, h, px }.
const raw = (png) => {
  const px = execFileSync("ffmpeg", ["-loglevel", "error", "-i", png, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    { maxBuffer: 1 << 28 });
  const w = 1080;
  return { w, h: px.length / 3 / w, px };
};
const rgb = ({ w, px }, x, y) => [px[(y * w + x) * 3], px[(y * w + x) * 3 + 1], px[(y * w + x) * 3 + 2]];
// Count pixels of a band (x0..x1, y0..y1) that satisfy `pred(r, g, b)`; also the rows they hit.
const scan = (img, [x0, x1, y0, y1], pred) => {
  let n = 0;
  let top = Infinity;
  let bottom = -Infinity;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const [r, g, b] = rgb(img, x, y);
      if (pred(r, g, b)) {
        n++;
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  return { n, top, bottom };
};

const MARK_TIMES = [4.4, 4.65, 4.95, 5.9, 6.2, 6.8];
const marks = {};
test("hand marks: highlight behind the word, strike through it after it ends", { timeout: 120_000 }, () => {
  rmSync(out, { recursive: true, force: true });
  execFileSync("node", [`${studio}/core/render.mjs`, film, "--stills", MARK_TIMES.join(",")], { stdio: "pipe" });
  MARK_TIMES.forEach((t, i) => {
    marks[t] = raw(`${out}/stills-9x16/${String(i).padStart(3, "0")}-${t.toFixed(2)}s.png`);
  });

  // "Caété" (line hl, said 4.5 to 5.0) carries a highlight from the voice data. Its band:
  const hl = [50, 480, 940, 1090];
  const area = (hl[1] - hl[0]) * (hl[3] - hl[2]);
  const bg = rgb(marks[4.4], 540, 100);
  // Pixels that are neither paper nor ink: light but off the paper colour = the wash.
  const wash = (r, g, b) => r + g + b > 650 && Math.max(Math.abs(r - bg[0]), Math.abs(g - bg[1]), Math.abs(b - bg[2])) >= 5;
  const before = scan(marks[4.4], hl, wash).n;
  const mid = scan(marks[4.65], hl, wash).n;
  const after = scan(marks[4.95], hl, wash).n;
  assert.equal(before, 0, "paper only before the word starts");
  assert.ok(mid > 0 && mid < after, `the highlight is sweeping at 4.65 s (${mid} < ${after})`);
  assert.ok(after > area * 0.4, `the wash sits behind the word once swept (${after} of ${area})`);
  // ...and behind it, not over it: the ink of the letters is still ink.
  assert.ok(scan(marks[4.95], hl, (r, g, b) => r + g + b < 120).n > 1000, "letters stay dark over the wash");

  // "Été" (line st, said 5.6 to 6.2): the data says underline, the option says strike.
  const st = [30, 300, 1300, 1530];
  const red = (r, g, b) => r - g > 40 && r - b > 40 && r < 200;
  assert.equal(scan(marks[5.9], st, red).n, 0, "no stroke while the word is still being said");
  assert.equal(scan(marks[6.2], st, red).n, 0, "no stroke on the frame the word ends");
  const stroke = scan(marks[6.8], st, red);
  assert.ok(stroke.n > 1500, `the pen line is drawn by end + 0.6 s (${stroke.n} px)`);
  assert.ok(stroke.top > 1370 && stroke.bottom < 1480, `a strike through the x-height, not an underline (rows ${stroke.top}-${stroke.bottom})`);
  const inkNotPen = (r, g, b) => r + g + b < 240 && r - g < 40; // the stroke itself is dark red
  assert.ok(scan(marks[5.9], st, inkNotPen).n > 1000, "the word is full ink before the strike");
  assert.equal(scan(marks[6.8], st, inkNotPen).n, 0, "the struck word dims to grey");
});

test("hand marks: cues() lists a marker for the highlight and a pen for the stroke", () => {
  const cues = JSON.parse(readFileSync(`${out}/cues.auto.json`, "utf8"));
  assert.deepEqual(cues, [
    { t: 4.5, type: "marker" },
    { t: 6.2, type: "pen" },
  ]);
});
