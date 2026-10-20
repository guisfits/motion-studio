// SFX cue gate: the sound role's crew/sfx-cues.json against the narration.
//   cues:  [{ "t": seconds-heard, "type", "gain", "len" }]   (format of core/audio/sfx.mjs)
//   words: voice/words.json, { words: [{ w, start, end }] }
// M4  more cues in any sliding NORMS.audio.sfxWindowS window than NORMS.audio.maxSfxPer4s.
// M5  a cue whose span [t - lead-in, t + len] overlaps a spoken word (the word's edges widened by
//     NORMS.audio.sfxWordMarginS). Orange, not red: 40-66 % of the pros' loud cues overlap a word
//     and 12 % of pieces put cues on speech on purpose (research/sound-grammar.md §4.4-4.5, §7),
//     so a cue on a word is a judgment for the reviewer, not a defect.
// M6  an SFX stem (out/sfx.wav) with no crew/sfx-cues.json, or whose render sidecar is missing or
//     hashed from another cue file: the mix has cues no gate can read.
import { NORMS } from "./norms.mjs";
import { finding } from "./report.mjs";

// Float noise on a boundary must not flip a verdict.
const EPS = 1e-9;

// preOf(type): seconds a recording of that type is heard before its t (core/audio/sfx.mjs cuePre).
export function checkCues(cues, words, { preOf = () => 0 } = {}) {
  const out = [];
  const { maxSfxPer4s: cap, sfxWindowS: win, sfxWordMarginS: margin } = NORMS.audio;
  const sorted = [...cues].sort((a, b) => a.t - b.t);
  // A cue breaks the cap when the window ending on it holds more than `cap` cues;
  // only that cue is reported, not every window it shares.
  sorted.forEach((c, i) => {
    let inWindow = 1;
    for (let j = i - 1; j >= 0 && c.t - sorted[j].t < win - EPS; j--) inWindow++;
    if (inWindow > cap)
      out.push(
        finding(
          "red",
          "M4",
          c.t,
          `${c.type}: ${inWindow} cues within ${win} s (max ${cap})`,
        ),
      );
  });
  for (const c of sorted) {
    // A riser or whoosh that starts in a gap can ring into the next word: test the whole span.
    const from = c.t - preOf(c.type) - margin;
    const to = c.t + (c.len ?? 0) + margin;
    const w = (words?.words ?? []).find(
      (x) => from <= x.end + EPS && to >= x.start - EPS,
    );
    if (w)
      out.push(
        finding("orange", "M5", c.t, `${c.type}: cue sounds over the spoken word "${w.w}"`),
      );
  }
  return out;
}

// M6: the stem must be traceable to the cue list the gate reads. sfx.mjs writes
// out/sfx.wav.cues.json beside the stem: { source, sha256 of the cue file, cues actually rendered
// after thinning }. A stem with no cue file, no sidecar, or a sidecar hashed from another version
// of the cue file is red: M4/M5 would audit a claim, not the mix. A film with no SFX (neither
// file) is clean. `sidecar` is the parsed file or null; `cueSha256` the hash of crew/sfx-cues.json.
export function checkSfxFiles({ hasStem, hasCues, sidecar = null, cueSha256 = null }) {
  if (!hasStem) return [];
  if (!hasCues) return [finding("red", "M6", null, "out/sfx.wav exists without crew/sfx-cues.json")];
  if (!sidecar || !Array.isArray(sidecar.cues))
    return [
      finding(
        "red",
        "M6",
        null,
        "out/sfx.wav.cues.json is missing or unreadable: render the stem with core/audio/sfx.mjs so the gate can read what was mixed",
      ),
    ];
  if (sidecar.sha256 !== cueSha256)
    return [
      finding(
        "red",
        "M6",
        null,
        "out/sfx.wav was rendered from a different crew/sfx-cues.json than the current one (hash changed): re-render the stem",
      ),
    ];
  return [];
}
