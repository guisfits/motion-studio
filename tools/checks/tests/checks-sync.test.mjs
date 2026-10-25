import { test } from "node:test";
import assert from "node:assert/strict";
import { norm, findWord } from "../words.mjs";
import { checkSyncSheet } from "../sync.mjs";

const words = {
  words: [
    { w: "o", start: 12.4, end: 12.5 },
    { w: "monge", start: 12.55, end: 12.9 },
    { w: "Lutero,", start: 13.22, end: 13.6 },
    { w: "em", start: 13.7, end: 13.8 },
    { w: "Wittenberg.", start: 14.6, end: 15.0 },
    { w: "Lutero", start: 20.1, end: 20.4 },
  ],
};
// The narration one beat covers (the sheet tests); `words` adds a later "Lutero" for findWord.
const spoken = { words: words.words.slice(0, 5) };
const manifest = {
  assets: [
    {
      id: "luther",
      file: "a/luther.png",
      source: "https://x",
      licence: "PD",
      status: "ready",
    },
    {
      id: "town",
      file: "a/town.png",
      source: "https://y",
      licence: "PD",
      status: "ready",
    },
  ],
};
const beat = (o = {}) => ({
  id: "b03",
  t: [12.4, 15.1],
  says: "o monge Lutero, em Wittenberg",
  key: [{ word: "Lutero", t: 13.22 }],
  hero: { asset: "luther", why: "portrait" },
  support: ["town"],
  lettering: [{ text: "Lutero", lands: 13.22, mark: "underline" }],
  zoom: { target: "luther.eyes", kind: "push-in" },
  ...o,
});
const codes = (f) => f.map((x) => x.code).sort();

test("norm strips punctuation and case, keeps accents", () => {
  assert.equal(norm("Lutero,"), "lutero");
  assert.equal(norm("Você"), "você");
  assert.equal(norm("metanoeite:"), "metanoeite");
  assert.equal(norm("Véu"), norm("Véu")); // NFC
});

test("findWord picks the occurrence inside the beat, not the first in the film", () => {
  assert.equal(findWord(words.words, "lutero", [19, 21]).start, 20.1);
  assert.equal(findWord(words.words, "lutero", [12.4, 15.1]).start, 13.22);
  assert.equal(findWord(words.words, "papa", [0, 99]), null);
});

test("a clean sheet passes", () => {
  assert.deepEqual(checkSyncSheet({ beats: [beat()] }, spoken, manifest), []);
});

test("every broken rule is reported", () => {
  const bad = beat({
    hero: null,
    key: [{ word: "Saxônia", t: 14 }],
    lettering: [
      { text: "agostiniano", lands: 13, mark: "oval" },
      { text: "Lutero", lands: 13.9, mark: "underline" },
    ],
  });
  assert.deepEqual(codes(checkSyncSheet({ beats: [bad] }, spoken, manifest)), [
    "S1",
    "S3",
    "S4",
    "S5",
    "S6",
  ]);
  const ghost = beat({ hero: { asset: "nobody", why: "" } });
  assert.deepEqual(
    codes(checkSyncSheet({ beats: [ghost] }, spoken, manifest)),
    ["S2"],
  );
  const ph = {
    assets: [
      { ...manifest.assets[0], status: "placeholder" },
      manifest.assets[1],
    ],
  };
  assert.deepEqual(codes(checkSyncSheet({ beats: [beat()] }, spoken, ph)), [
    "S7",
  ]);
});

test("lettering exactly at the tolerance boundary passes", () => {
  const b = beat({
    lettering: [{ text: "Lutero", lands: 13.22 + 3 / 30, mark: "underline" }],
  });
  assert.deepEqual(checkSyncSheet({ beats: [b] }, spoken, manifest), []);
});

test("lettering one frame past the tolerance is red", () => {
  const b = beat({
    lettering: [{ text: "Lutero", lands: 13.22 + 4 / 30, mark: "underline" }],
  });
  assert.deepEqual(codes(checkSyncSheet({ beats: [b] }, spoken, manifest)), [
    "S5",
  ]);
});

test("lettering word absent from the timeline is red", () => {
  const b = beat({
    says: "o monge Lutero, em Wittenberg Papa",
    lettering: [{ text: "Papa", lands: 14.8, mark: "oval" }],
  });
  assert.deepEqual(codes(checkSyncSheet({ beats: [b] }, spoken, manifest)), [
    "S5",
  ]);
});

test("every part of multi-word lettering must be spoken inside the beat", () => {
  const b = beat({
    t: [12.4, 13.9],
    lettering: [{ text: "Lutero Wittenberg", lands: 13.22, mark: "underline" }],
  });
  const rest = beat({
    id: "b04",
    t: [13.9, 15.1],
    says: "em Wittenberg",
    key: [],
    lettering: [],
  });
  assert.deepEqual(
    codes(checkSyncSheet({ beats: [b, rest] }, spoken, manifest)),
    ["S5"],
  );
});

test("multi-word lettering passes when every word lands in the beat", () => {
  const b = beat({
    lettering: [{ text: "Lutero em", lands: 13.22, mark: "underline" }],
  });
  assert.deepEqual(checkSyncSheet({ beats: [b] }, spoken, manifest), []);
});

test("a repeated short word lands on its nearest occurrence, not the first", () => {
  const dw = {
    words: [
      { w: "de", start: 12.6, end: 12.7 },
      { w: "de", start: 14.0, end: 14.1 },
    ],
  };
  assert.equal(findWord(dw.words, "de", [12.4, 15.1], 14.0).start, 14.0);
  assert.equal(findWord(dw.words, "de", [12.4, 15.1]).start, 12.6);
  const b = beat({
    says: "de de",
    key: [],
    lettering: [{ text: "de", lands: 14.0, mark: "underline" }],
  });
  assert.deepEqual(checkSyncSheet({ beats: [b] }, dw, manifest), []);
});

test("overlapping beats are an orange S8", () => {
  const b1 = beat();
  const b2 = beat({ id: "b04", t: [14.9, 16], says: "", key: [], lettering: [] });
  const f = checkSyncSheet({ beats: [b1, b2] }, spoken, manifest);
  assert.deepEqual(codes(f), ["S8"]);
  assert.equal(f[0].severity, "orange");
});

test("a gap longer than half a second between beats is an orange S8", () => {
  const b1 = beat();
  const b2 = beat({ id: "b04", t: [15.7, 16], says: "", key: [], lettering: [] });
  const f = checkSyncSheet({ beats: [b1, b2] }, spoken, manifest);
  assert.deepEqual(codes(f), ["S8"]);
  assert.equal(f[0].severity, "orange");
});

test("a gap under half a second between beats passes", () => {
  const b1 = beat();
  const b2 = beat({ id: "b04", t: [15.5, 16], says: "", key: [], lettering: [] });
  assert.deepEqual(checkSyncSheet({ beats: [b1, b2] }, spoken, manifest), []);
});

test("an asset with no licence is red S7", () => {
  const nolic = {
    assets: [{ ...manifest.assets[0], licence: "" }, manifest.assets[1]],
  };
  const f = checkSyncSheet({ beats: [beat()] }, spoken, nolic);
  assert.deepEqual(codes(f), ["S7"]);
  assert.match(f[0].msg, /no licence/);
});

test("an asset with no source is red S7", () => {
  const nosrc = {
    assets: [{ ...manifest.assets[0], source: "" }, manifest.assets[1]],
  };
  const f = checkSyncSheet({ beats: [beat()] }, spoken, nosrc);
  assert.deepEqual(codes(f), ["S7"]);
  assert.match(f[0].msg, /no source/);
});

test("exactly 3 frames passes even where float subtraction overshoots", () => {
  const fw = { words: [{ w: "fronteira", start: 15.91, end: 16.0 }] };
  const b = beat({
    t: [15.5, 16.2],
    says: "fronteira",
    key: [],
    lettering: [
      { text: "fronteira", lands: 15.91 + 3 / 30, mark: "underline" },
    ],
  });
  assert.deepEqual(checkSyncSheet({ beats: [b] }, fw, manifest), []);
});

test("a sheet with no beats is red S9, not an empty pass", () => {
  assert.deepEqual(codes(checkSyncSheet({ beats: [] }, spoken, manifest)), [
    "S9",
  ]);
});

test("beats that start late or end early on the narration are red S9", () => {
  const late = beat({ t: [13.0, 15.1], says: "Lutero, em Wittenberg" });
  assert.deepEqual(codes(checkSyncSheet({ beats: [late] }, spoken, manifest)), [
    "S9",
  ]);
  const early = beat({ t: [12.4, 14.4], says: "o monge Lutero, em" });
  assert.deepEqual(
    codes(checkSyncSheet({ beats: [early] }, spoken, manifest)),
    ["S9"],
  );
  // Inside the half-second slack on both ends passes.
  const slack = beat({ t: [12.85, 14.55], says: "Lutero, em Wittenberg" });
  assert.deepEqual(checkSyncSheet({ beats: [slack] }, spoken, manifest), []);
});

test("a key word whose time is off its spoken word is red S3", () => {
  const off = beat({ key: [{ word: "Lutero", t: 14.5 }] });
  const f = checkSyncSheet({ beats: [off] }, spoken, manifest);
  assert.deepEqual(codes(f), ["S3"]);
  assert.equal(f[0].t, 14.5);
  const edge = beat({ key: [{ word: "Lutero", t: 13.22 + 3 / 30 }] });
  assert.deepEqual(checkSyncSheet({ beats: [edge] }, spoken, manifest), []);
  const past = beat({ key: [{ word: "Lutero", t: 13.22 + 4 / 30 }] });
  assert.deepEqual(codes(checkSyncSheet({ beats: [past] }, spoken, manifest)), [
    "S3",
  ]);
});

test("a key word repeated in the beat is timed against its nearest occurrence", () => {
  const dw = {
    words: [
      { w: "de", start: 12.6, end: 12.7 },
      { w: "de", start: 14.0, end: 14.1 },
    ],
  };
  const b = beat({
    t: [12.4, 14.5],
    says: "de de",
    key: [{ word: "de", t: 14.0 }],
    lettering: [],
  });
  assert.deepEqual(checkSyncSheet({ beats: [b] }, dw, manifest), []);
});

test("two marks within a second across a beat boundary are red S6", () => {
  const mw = {
    words: [
      { w: "Lutero", start: 13.22, end: 13.5 },
      { w: "Lutero", start: 13.6, end: 14.0 },
    ],
  };
  const b1 = beat({
    t: [13.0, 13.55],
    says: "Lutero",
    key: [],
    lettering: [{ text: "Lutero", lands: 13.22, mark: "underline" }],
  });
  const b2 = beat({
    id: "b04",
    t: [13.55, 14.2],
    says: "Lutero",
    key: [],
    lettering: [{ text: "Lutero", lands: 13.6, mark: "oval" }],
  });
  const f = checkSyncSheet({ beats: [b1, b2] }, mw, manifest);
  assert.deepEqual(codes(f), ["S6"]);
  assert.equal(f[0].t, 13.6);
});

// Drawn text that is not the spoken word: "95" is said "noventa e cinco".
const figures = {
  words: [
    { w: "são", start: 5.0, end: 5.2 },
    { w: "noventa", start: 5.3, end: 5.7 },
    { w: "e", start: 5.7, end: 5.8 },
    { w: "cinco", start: 5.8, end: 6.2 },
    { w: "teses", start: 6.3, end: 6.8 },
  ],
};
const figureBeat = (l) =>
  beat({
    t: [5.0, 6.8],
    says: "são noventa e cinco teses",
    key: [],
    lettering: [l],
  });
const check = (b) => checkSyncSheet({ beats: [b] }, figures, manifest);

test("lettering that names the words it lands on matches them, not its drawn text", () => {
  const b = figureBeat({ text: "95", says: "noventa e cinco", lands: 5.3 });
  assert.deepEqual(check(b), []);
});

test("the same drawn text without says is still not in the line", () => {
  const b = figureBeat({ text: "95", lands: 5.3 });
  assert.deepEqual(codes(check(b)), ["S4"]);
});

test("says that are not in the line are red S4, as text would be", () => {
  const b = figureBeat({ text: "95", says: "oitenta e cinco", lands: 5.3 });
  assert.deepEqual(codes(check(b)), ["S4"]);
});

test("says lands on its first word and is held to the tolerance", () => {
  const late = figureBeat({
    text: "95",
    says: "noventa e cinco",
    lands: 5.3 + 4 / 30,
  });
  assert.deepEqual(codes(check(late)), ["S5"]);
  const edge = figureBeat({
    text: "95",
    says: "noventa e cinco",
    lands: 5.3 + 3 / 30,
  });
  assert.deepEqual(check(edge), []);
});

test("says words said in the line but not spoken in the beat are red S5", () => {
  const b = figureBeat({ text: "95", says: "noventa e cinco", lands: 5.3 });
  b.t = [5.0, 5.6];
  // Cutting the beat short also leaves the narration uncovered (S9); S5 is the one under test.
  const got = codes(check(b));
  assert.ok(got.includes("S5") && !got.includes("S4"), got.join(" "));
});

// H-4 (second film): a re-voiced line left the rows' `says` and spans stale; S3/S5 only read the
// keys and lettering, so the gate stayed green on a broken picture.
test("a row whose line no longer matches the voice in its span is red S11", () => {
  const stale = beat({ says: "o monge Lutero, sobre indulgências", lettering: [] });
  const f = checkSyncSheet({ beats: [stale] }, spoken, manifest);
  assert.deepEqual(codes(f), ["S11"]);
  assert.match(f[0].msg, /not spoken: "sobre indulgências"/);
  assert.match(f[0].msg, /not in the line: "em wittenberg"/);
  const short = beat({ says: "o monge Lutero", lettering: [] });
  assert.deepEqual(codes(checkSyncSheet({ beats: [short] }, spoken, manifest)), ["S11"]);
});

test("S11: a word starting within the slack of the row's edge may belong to either row", () => {
  // "Wittenberg." starts at 14.6; a row ending at 14.7 need not say it, nor must a row whose
  // span starts at 12.5 say the "o" at 12.4.
  const a = beat({ t: [12.5, 14.7], says: "monge Lutero, em", lettering: [] });
  assert.deepEqual(checkSyncSheet({ beats: [a] }, spoken, manifest).filter((x) => x.code === "S11"), []);
});

test("a key word spoken only outside its row's span is red S3", () => {
  const moved = beat({ t: [12.4, 13.0], says: "o monge", key: [{ word: "Lutero", t: 13.22 }], lettering: [] });
  const f = checkSyncSheet({ beats: [moved] }, spoken, manifest);
  assert.ok(codes(f).includes("S3"), JSON.stringify(f));
});

test("without a voice (words null) the word-timing rules are skipped and the rest still run", () => {
  // Key off its word, lettering off its word, a stale line: all word-timing, none can be judged yet.
  const timed = beat({
    key: [{ word: "Saxônia", t: 14 }],
    says: "Lutero disse algo que a voz ainda não gravou",
    lettering: [{ text: "Lutero", lands: 13.9, mark: "underline" }],
  });
  assert.deepEqual(codes(checkSyncSheet({ beats: [timed] }, null, manifest)), []);
  // Rules that never read the voice still fire.
  const bad = beat({
    hero: null,
    lettering: [
      { text: "agostiniano", lands: 13, mark: "oval" },
      { text: "Lutero", lands: 13.5, mark: "underline" },
    ],
  });
  assert.deepEqual(codes(checkSyncSheet({ beats: [bad] }, null, manifest)), ["S1", "S4", "S6"]);
  assert.deepEqual(codes(checkSyncSheet({ beats: [] }, null, manifest)), ["S9"]);
});
