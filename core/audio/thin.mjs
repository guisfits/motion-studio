// Thinning of an SFX cue list: a cue per action reads as noise ("I cannot make anything out").
// Components emit one cue per action, so a busy scene asks for dozens of sounds a second; the ear
// takes a few. thinCues keeps the ones that carry the picture and drops the rest, as a pure
// function of the cue list (no randomness, no I/O), so the same film always sounds the same.
//
// Rules, in force order:
//   1. Typewriter keys: one key per KEY_GAP at most; a run of more than BURST_MIN keys becomes a
//      single `burst` over the run.
//   2. Priority: gesture landings > camera whooshes > slides and pours > text and pen > keys.
//      Cues are admitted in that order, so a loud landing never loses its place to a rustle.
//   3. Minimum gap: no two non-ambient cues start closer than GAP (the typewriter's keys and bell
//      among themselves: KEY_GAP);
//      one camera whoosh per CAMERA_GAP (one per travel); a repeat of the same sound inside
//      SAME_GAP is the same event (paper-place twice in 0.5 s is one placement).
//   4. First window: nothing starts while a louder cue is still in its first FIRST_WINDOW seconds.
// Ambient beds (room tone, fire) and the signature (a project's sonic logo, cue type `logo`,
// supplied by a project library) are exempt from the gap rules;
// the signature is admitted first, so everything near it yields.

export const GAP = 0.35;
export const KEY_GAP = 0.12;
export const SAME_GAP = 0.5;
export const CAMERA_GAP = 1.0;
export const FIRST_WINDOW = 0.25;
export const BURST_MIN = 8;
export const RUN_GAP = 0.25;

// class → [priority, nominal loudness]. Loudness only ranks cues of one class against each other
// and against a candidate inside the first window; it mirrors the library's relative gains.
const CLASSES = {
  signature: [9, 1],
  landing: [5, 1],
  camera: [4, 0.5],
  slide: [3, 0.6],
  text: [2, 0.65],
  keys: [1, 0.45],
};

const TYPES = {
  landing: [
    "paper-place",
    "paper-drop",
    "thud-soft",
    "thud",
    "thump",
    "impact",
    "boom",
    "stamp",
    "stamp-wood",
    "stamp-ink",
    "seal",
    "bell",
    "chime",
    "drip",
    "splash",
    "tear",
    "tape",
    "crumple",
    "sticker",
    "slap",
    "postit-stick",
    "knock",
    "book-close",
    "book-thud",
    "pop",
    "click",
    "glass-clink",
    "match",
    "church-bell",
    "bell-deep",
    "door",
  ],
  camera: ["whoosh", "swoosh", "swish", "whoosh-deep", "flame-whoosh"],
  slide: [
    "paper-slide",
    "paper-slide-wood",
    "paper-wipe",
    "paper-wind",
    "rustle",
    "riffle",
    "page",
    "flip",
    "pour",
    "sticker-peel",
    "postit-peel",
    "wind",
    "riser",
    "riser-soft",
    "swell",
    "reverse-cymbal",
    "creak",
    "flame",
    "blow-out",
    "organ",
    "choir",
  ],
  text: [
    "pen",
    "marker",
    "quill",
    "quill-long",
    "highlight",
    "squeak",
    "scratch",
    "ding",
    "return",
    "carriage",
  ],
  keys: ["key", "type", "tick", "space", "burst"],
  signature: ["logo"],
};
const AMBIENT = new Set([
  "church-room",
  "fire",
  "burn",
  "bells-far",
  "candle",
  "crackle",
]);

const CLASS_OF = new Map(
  Object.entries(TYPES).flatMap(([cls, types]) => types.map((t) => [t, cls])),
);
// Unknown names are treated as a slide: neither a landing nor noise to be dropped first.
export const classOf = (type) =>
  AMBIENT.has(type) ? "ambient" : (CLASS_OF.get(type) ?? "slide");

// The typewriter family sounds as one instrument: its keys and its bell may sit KEY_GAP apart, so a
// typed line keeps its keys before the bell instead of leaving the bell alone.
const TYPEWRITER = new Set(["key", "type", "tick", "space", "burst", "ding", "return", "carriage"]);
const together = (a, b) => TYPEWRITER.has(a.type) && TYPEWRITER.has(b.type);

const loud = (c) => (c.gain ?? 1) * CLASSES[c.cls][1];

// Rule 1: thin the keys of every run to one per KEY_GAP, then fold long runs into a burst.
function foldKeys(cues) {
  const keys = cues
    .filter((c) => c.cls === "keys" && c.type !== "burst")
    .sort((a, b) => a.t - b.t || a.i - b.i);
  const kept = [];
  const dropped = [];
  for (const k of keys) {
    if (kept.length && k.t - kept[kept.length - 1].t < KEY_GAP)
      dropped.push({ cue: k, reason: "key-rate" });
    else kept.push(k);
  }
  const runs = [];
  for (const k of kept) {
    const run = runs[runs.length - 1];
    if (run && k.t - run[run.length - 1].t <= RUN_GAP) run.push(k);
    else runs.push([k]);
  }
  const folded = new Set();
  const bursts = [];
  for (const run of runs) {
    if (run.length <= BURST_MIN) continue;
    for (const k of run) {
      folded.add(k);
      dropped.push({ cue: k, reason: "burst" });
    }
    const span = run[run.length - 1].t - run[0].t;
    bursts.push({
      t: run[0].t,
      type: "burst",
      gain: Math.max(...run.map((k) => k.gain ?? 1)),
      len: Math.min(1.4, Math.max(0.5, span + 0.2)),
      cls: "keys",
      i: run[0].i,
    });
  }
  const survivors = kept.filter((k) => !folded.has(k));
  return { cues: [...survivors, ...bursts], dropped };
}

// cues: [{ t, type, gain?, len? }]. Returns { kept, dropped: [{ cue, reason }] }, kept sorted by t.
export function thinCues(cues) {
  const all = cues.map((c, i) => ({ ...c, cls: classOf(c.type), i }));
  const ambient = all.filter((c) => c.cls === "ambient");
  const rest = all.filter((c) => c.cls !== "ambient");
  const folded = foldKeys(rest);
  const pool = [
    ...rest.filter((c) => c.cls !== "keys" || c.type === "burst"),
    ...folded.cues.filter((c) => c.cls === "keys"),
  ];
  const dropped = [...folded.dropped];

  // Rule 2 and 3: admit in priority order, loudest first, earliest first.
  const order = [...pool].sort(
    (a, b) =>
      CLASSES[b.cls][0] - CLASSES[a.cls][0] ||
      loud(b) - loud(a) ||
      a.t - b.t ||
      a.i - b.i,
  );
  const kept = [];
  for (const c of order) {
    let reason = null;
    for (const a of kept) {
      const dt = Math.abs(c.t - a.t);
      if (together(c, a) ? dt < KEY_GAP : dt < GAP)
        reason = "gap";
      else if (c.cls === "camera" && a.cls === "camera" && dt < CAMERA_GAP)
        reason = "one-per-travel";
      else if (c.type === a.type && c.cls !== "keys" && dt < SAME_GAP)
        reason = "repeat";
      if (reason) break;
    }
    if (reason) dropped.push({ cue: c, reason });
    else kept.push(c);
  }

  // Rule 4: nothing starts inside the first window of a louder cue (a safety net for classes the gap
  // rule lets sit close, i.e. keys against keys).
  const final = kept.filter((c) => {
    const masked = kept.some(
      (a) =>
        a !== c &&
        a.t <= c.t &&
        c.t < a.t + FIRST_WINDOW &&
        loud(a) > loud(c) * 1.1,
    );
    if (masked) dropped.push({ cue: c, reason: "masked" });
    return !masked;
  });

  const strip = ({ cls, i, ...c }) => c;
  return {
    kept: [...final, ...ambient]
      .sort((a, b) => a.t - b.t || a.i - b.i)
      .map(strip),
    dropped: dropped.map((d) => ({ cue: strip(d.cue), reason: d.reason })),
  };
}

// A one-line account of what thinning did (for the CLI).
export function summary(before, { kept, dropped }) {
  const by = {};
  for (const d of dropped) by[d.reason] = (by[d.reason] ?? 0) + 1;
  const why = Object.entries(by)
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
  return `${before} cues → ${kept.length} kept${why ? ` (dropped: ${why})` : ""}`;
}
