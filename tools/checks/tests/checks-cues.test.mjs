import { test } from "node:test";
import assert from "node:assert/strict";
import { checkCues, checkSfxFiles } from "../cues.mjs";
import { NORMS } from "../norms.mjs";

const { maxSfxPer4s: cap, sfxWindowS: win, sfxWordMarginS: margin } = NORMS.audio;
// Two words with a clear gap between them (1.5 to 3.0).
const words = {
  words: [
    { w: "Lutero", start: 1, end: 1.5 },
    { w: "fim", start: 3, end: 3.4 },
  ],
};
const cue = (t) => ({ t, type: "click", gain: 1, len: 0.2 });
const codes = (f) => f.map((x) => x.code);
const silent = { words: [] };

test("cues at the density cap pass", () => {
  const cues = Array.from({ length: cap }, (_, i) => cue(10 + (i * win) / (cap + 1)));
  assert.deepEqual(checkCues(cues, silent), []);
});

test("one cue over the cap inside the window is red M4, on the cue that breaks it", () => {
  const cues = Array.from({ length: cap + 1 }, (_, i) => cue(10 + i * 0.1));
  const f = checkCues(cues, silent);
  assert.deepEqual(codes(f), ["M4"]);
  assert.equal(f[0].t, cues.at(-1).t);
});

test("a cue exactly one window after a full window is in a new window", () => {
  const full = Array.from({ length: cap }, (_, i) => cue(10 + i * 0.01));
  assert.deepEqual(checkCues([...full, cue(10 + win)], silent), []);
});

test("cues just inside the window are red, order of the input does not matter", () => {
  const full = Array.from({ length: cap }, (_, i) => cue(10 + i * 0.01));
  const f = checkCues([cue(10 + win - 0.01), ...full.reverse()], silent);
  assert.deepEqual(codes(f), ["M4"]);
  assert.equal(f[0].t, 10 + win - 0.01);
});

test("each offending cue gets one finding, not one per window", () => {
  const cues = [cue(10), cue(10.5), cue(11), cue(11.5)];
  const f = checkCues(cues, silent);
  assert.equal(f.length, cues.length - cap);
});

test("the density cap is two cues per window (research/sound-grammar.md §4.1, §7)", () => {
  assert.equal(cap, 2);
});

test("a cue inside a spoken word is orange M5", () => {
  const f = checkCues([cue(1.2)], words);
  assert.deepEqual(codes(f), ["M5"]);
  assert.equal(f[0].severity, "orange");
  assert.equal(f[0].t, 1.2);
});

test("a cue that starts in a gap but rings into the next word is M5", () => {
  // Starts 0.3 s before "fim" (3.0) and lasts 0.4 s: its tail covers the word.
  const long = { t: 2.7, type: "whoosh", gain: 1, len: 0.4 };
  assert.deepEqual(codes(checkCues([long], words)), ["M5"]);
  // The same cue, short enough to end before the widened word, passes.
  assert.deepEqual(checkCues([{ ...long, len: 0.1 }], words), []);
});

test("a cue without len is read as an instant", () => {
  assert.deepEqual(checkCues([{ t: 2.25, type: "click", gain: 1 }], words), []);
  assert.deepEqual(codes(checkCues([{ t: 1.2, type: "click", gain: 1 }], words)), ["M5"]);
});

test("a cue in a gap between words passes", () => {
  assert.deepEqual(checkCues([cue(2.25)], words), []);
});

test("the word's edges are widened by the margin, inclusive", () => {
  assert.deepEqual(codes(checkCues([cue(1.5 + margin)], words)), ["M5"]);
  // A cue's span runs from t to t + len, so the leading edge is reached by its end.
  const instant = (t) => ({ t, type: "click", gain: 1, len: 0 });
  assert.deepEqual(codes(checkCues([instant(1 - margin)], words)), ["M5"]);
  assert.deepEqual(checkCues([cue(1.5 + margin + 0.01)], words), []);
  assert.deepEqual(checkCues([instant(1 - margin - 0.01)], words), []);
  assert.deepEqual(checkCues([cue(1 - margin - 0.2 - 0.01)], words), []);
});

test("a recording that starts before the cue (its lead-in) is gated from where it starts sounding", () => {
  // "Lutero" ends at 1.5; a cue just clear of the widened word, with a 0.4 s lead-in, starts sounding inside it.
  const c = { t: 1.5 + margin + 0.21, type: "whoosh", gain: 1, len: 0 };
  assert.deepEqual(checkCues([c], words), [], "without the lead-in the cue is clear of the word");
  assert.deepEqual(codes(checkCues([c], words, { preOf: () => 0.4 })), ["M5"]);
  // The lead-in is per type: a type with none is judged as before.
  assert.deepEqual(checkCues([c], words, { preOf: (type) => (type === "thump" ? 0.4 : 0) }), []);
});

test("no cues, or no words, is clean", () => {
  assert.deepEqual(checkCues([], words), []);
  assert.deepEqual(checkCues([cue(1.2)], silent), []);
});

test("an SFX stem without its cue list is red M6; neither is clean", () => {
  assert.deepEqual(codes(checkSfxFiles({ hasStem: true, hasCues: false })), ["M6"]);
  assert.equal(checkSfxFiles({ hasStem: true, hasCues: false })[0].severity, "red");
  assert.deepEqual(checkSfxFiles({ hasStem: false, hasCues: false }), []);
});

test("a stem with a cue list but no render sidecar is red M6: the mix cannot be traced to the list", () => {
  const f = checkSfxFiles({ hasStem: true, hasCues: true, sidecar: null, cueSha256: "abc" });
  assert.deepEqual(codes(f), ["M6"]);
  assert.equal(f[0].severity, "red");
  assert.match(f[0].msg, /sfx\.wav\.cues\.json/);
});

test("a sidecar hashed from another cue file is red M6: the stem was rendered from a stale list", () => {
  const f = checkSfxFiles({ hasStem: true, hasCues: true, sidecar: { sha256: "old", cues: [] }, cueSha256: "new" });
  assert.deepEqual(codes(f), ["M6"]);
  assert.match(f[0].msg, /different|stale|changed/);
});

test("a sidecar that matches the cue file is clean", () => {
  assert.deepEqual(checkSfxFiles({ hasStem: true, hasCues: true, sidecar: { sha256: "abc", cues: [] }, cueSha256: "abc" }), []);
});
