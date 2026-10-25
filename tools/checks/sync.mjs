// Paper gate before any picture exists: the beats cover the narration, every beat has a hero that
// exists, is licensed and traced to its source, every key word is spoken in the beat at its own time, lettering is the
// narrator's own words landing on them, marks are paced across the film.
//
// Sync-sheet shape (crew/sync-sheet.json):
//   { beats: [{ id, t: [t0, t1], says, hero: { asset }, key: [{ word, t }],
//               lettering: [{ text, says?, lands, mark? }] }] }
// A lettering item is matched against the narration by its `text`, or, when it carries `says`, by
// `says` (the spoken words it lands on, e.g. text "95", says "noventa e cinco"); `text` is then
// free display text. `lands` is held to the first spoken word of that match. A row's `says` is the
// voice inside its span (S11).
import { NORMS } from "./norms.mjs";
import { finding } from "./report.mjs";
import { norm, findWord } from "./words.mjs";

// A row's `says` against the words spoken in its span: what it says that is not spoken there, and
// what is spoken well inside it that it does not say. A word starting within lineSlackS of an edge
// may belong to either row; a lettering word not spoken is S5's, not repeated here. Null when they
// match. A re-voiced line moves the words under stale rows, and S3/S5 read only the keys and
// lettering (second film, H-4).
function lineDrift(b, W) {
  const [t0, t1] = b.t;
  const slack = NORMS.sync.lineSlackS;
  const words = (s) => (s ?? "").split(/\s+/).map(norm).filter(Boolean);
  const says = new Set(words(b.says));
  const lettered = new Set((b.lettering ?? []).flatMap((l) => words(l.says ?? l.text)));
  const between = (a, z) => new Set(W.filter((w) => w.start >= a && w.start <= z).map((w) => norm(w.w)));
  const near = between(t0 - slack, t1 + slack);
  const inside = between(t0 + slack, t1 - slack);
  const unspoken = [...says].filter((w) => !near.has(w) && !lettered.has(w));
  const unsaid = [...inside].filter((w) => w && !says.has(w));
  if (!unspoken.length && !unsaid.length) return null;
  return [
    unspoken.length && `not spoken: "${unspoken.join(" ")}"`,
    unsaid.length && `spoken, not in the line: "${unsaid.join(" ")}"`,
  ]
    .filter(Boolean)
    .join("; ");
}

// `words` null = the voice is not recorded yet (the sheet is timed from the script): the rules that
// read word times (S3, S5 and S9 against the voice, S11) are skipped; S1, S2, S4, S6, S7, S8 still run.
export function checkSyncSheet(sheet, words, manifest) {
  const out = [];
  const W = words ? words.words : null;
  const assets = new Map(manifest.assets.map((a) => [a.id, a]));
  const tol = NORMS.sync.letteringToleranceFrames / NORMS.fps;
  // Provenance is part of "ready": a picture nobody can trace back is not licensed in practice.
  for (const a of manifest.assets)
    if (a.status !== "ready" || !a.licence || !a.source)
      out.push(
        finding(
          "red",
          "S7",
          null,
          `asset ${a.id} is ${a.status}${a.licence ? "" : ", no licence"}${a.source ? "" : ", no source"}`,
        ),
      );
  const beats = sheet.beats ?? [];
  const slack = NORMS.sync.coverSlackS;
  if (!beats.length)
    out.push(finding("red", "S9", null, "the sheet has no beats"));
  else if (W?.length) {
    const [first, last] = [beats[0], beats.at(-1)];
    if (first.t[0] > W[0].start + slack)
      out.push(
        finding(
          "red",
          "S9",
          first.t[0],
          `${first.id} starts after the narration`,
        ),
      );
    if (last.t[1] < W.at(-1).end - slack)
      out.push(
        finding("red", "S9", last.t[1], `${last.id} ends before the narration`),
      );
  }
  beats.forEach((b, i) => {
    const [t0, t1] = b.t;
    if (!b.hero?.asset) out.push(finding("red", "S1", t0, `${b.id}: no hero`));
    else if (!assets.has(b.hero.asset))
      out.push(
        finding(
          "red",
          "S2",
          t0,
          `${b.id}: hero ${b.hero.asset} not in manifest`,
        ),
      );
    for (const k of W ? (b.key ?? []) : []) {
      const w = findWord(W, k.word, [t0, t1], k.t);
      if (!w)
        out.push(
          finding(
            "red",
            "S3",
            k.t,
            `${b.id}: key "${k.word}" is not spoken here`,
          ),
        );
      else if (Math.abs(k.t - w.start) > tol + 1e-6)
        out.push(
          finding(
            "red",
            "S3",
            k.t,
            `${b.id}: key "${k.word}" is ${(k.t - w.start).toFixed(2)} s off its word`,
          ),
        );
    }
    const said = new Set(b.says.split(/\s+/).map(norm));
    for (const l of b.lettering ?? []) {
      // `says` names the spoken words a drawn item lands on ("95" lands on "noventa e cinco");
      // without it the drawn text is itself the spoken words.
      const spoken = l.says ?? l.text;
      const parts = spoken.split(/\s+/).map(norm);
      if (!parts.every((p) => said.has(p))) {
        out.push(
          finding(
            "red",
            "S4",
            l.lands,
            `${b.id}: lettering "${spoken}" is not in the line`,
          ),
        );
        continue;
      }
      if (!W) continue;
      const unspoken = parts.find((p) => !findWord(W, p, [t0, t1]));
      if (unspoken) {
        out.push(
          finding(
            "red",
            "S5",
            l.lands,
            `${b.id}: lettering word "${unspoken}" not spoken in the beat`,
          ),
        );
        continue;
      }
      const w = findWord(W, parts[0], [t0, t1], l.lands);
      if (Math.abs(l.lands - w.start) > tol + 1e-6)
        out.push(
          finding(
            "red",
            "S5",
            l.lands,
            `${b.id}: "${spoken}" lands ${(l.lands - w.start).toFixed(2)} s off its word`,
          ),
        );
    }
    const drift = W && lineDrift(b, W);
    if (drift)
      out.push(finding("red", "S11", t0, `${b.id}: the line no longer matches the voice (${drift})`));
    const next = sheet.beats[i + 1];
    if (next && (next.t[0] < t1 - 0.01 || next.t[0] - t1 > 0.5))
      out.push(
        finding("orange", "S8", t1, `${b.id}→${next.id}: overlap or gap`),
      );
  });
  // Marks are paced across the film: a beat boundary does not reset the eye.
  const marks = beats
    .flatMap((b) =>
      (b.lettering ?? [])
        .filter((l) => l.mark)
        .map((l) => ({ id: b.id, t: l.lands })),
    )
    .sort((a, b) => a.t - b.t);
  for (let j = 1; j < marks.length; j++)
    if (marks[j].t - marks[j - 1].t < 1 / NORMS.sync.maxMarksPerSecond)
      out.push(
        finding(
          "red",
          "S6",
          marks[j].t,
          `${marks[j].id}: two marks within a second`,
        ),
      );
  return out;
}
