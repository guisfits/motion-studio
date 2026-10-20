# Templates and snippets

Run every snippet from the engine root (`/path/to/motion-studio`), with the film directory as the argument.

## `crew/sfx-cues.json`

```json
[
  { "t": 9.30, "type": "riser", "gain": 0.8, "len": 2.4 },
  { "t": 11.70, "type": "impact", "gain": 1, "len": 0.6 },
  { "t": 23.83, "type": "stamp", "gain": 1, "len": 0.5 }
]
```

- `t` = seconds heard, on the contact frame, 1-2 frames early at most (`NORMS.fps`); `type` = a `core/audio/sfx-library.json` action; `gain` linear per cue; `len` = seconds the sound lasts after its anchor. Always write `len`: M5 tests `[t, t+len]`, and the render falls back to the action's tail (else 0.6 s).
- This list is the render: `node <engine>/core/audio/sfx.mjs <film>/crew/sfx-cues.json <film>/out/sfx.wav --dur <film seconds> --no-thin`. Thinning exists for the animator's over-emitted `cues.auto.json`; your list is already chosen.

## `crew/sound.md`

```
# Sound: <film>
Register A. Voice <take>, <n> s, <first word s> to <last word end s>. Final <I> LUFS, LRA <x> LU, true peak <y> dBTP.

## Cues (<n> in <duration> s; budget: median 2, p90 about 6 per 48 s)
| t | type | len | beat | picture device | in a pause? | M5 line |
|---|---|---|---|---|---|---|
| 11.70 | impact | 0.6 | b09 | burst, then hold | yes | none |
| 23.83 | stamp | 0.5 | b17 | overshoot pop | onset 1 frame before "date" | p90 -17.0 dB under speech (limit -SFX_BELOW_VOICE); tail rings 0.2 s into "the", kept |
Skipped on purpose: <the device families left silent and why: hard cuts, caption changes, plain entrances>.

## Bed
Source / URL or generation id / licence text / date: <...>. Filter applied: <equalizer line or none>.
Starts at 0 with the voice. Sections: <t0-t1 texture> at the pace plan's turns <beat ids>. End: <fade-out s or held> (last word ends <s>; film ends <s>).

## Mix (paste `--report`)
<three lines>
Gaps figure for the bed: <x dB> (accept -7 to -19). Voice untouched / --voice-level used because <LRA of the voice alone>.

## Gate (paste `crew/checks-final.md` summary)
<PASS/FAIL, reds, oranges each with its line above>

## Measured vs judged
Measured: <list>. Only a listener can judge: <phone speaker, picture off: intelligibility of <key words>, bed texture at the turns>.
```

## Speech map: first word, last word, pauses of 0.3 s or more

```bash
node --input-type=module -e '
import { readFileSync } from "node:fs";
const w = JSON.parse(readFileSync(process.argv[1] + "/voice/words.json", "utf8")).words;
const gaps = [];
for (let i = 1; i < w.length; i++)
  if (w[i].start - w[i - 1].end >= 0.3) gaps.push([w[i - 1].end, w[i].start]);
console.log("first word", w[0].start, "last word end", w.at(-1).end);
console.log("pauses:", gaps.map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)} (${(b - a).toFixed(2)})`).join("  "));' <film>
```

If `words.json` stretches a word over the pause that follows it (an ASR transcript does; a forced alignment does not), the pauses read short: trim `end` to the voiced part before trusting them (`sound` Method 3).

## Landings per beat

```bash
node --input-type=module -e '
import { readFileSync } from "node:fs";
const film = process.argv[1];
const rd = (p) => JSON.parse(readFileSync(`${film}/${p}`, "utf8"));
const { beats } = rd("crew/sync-sheet.json");
const cues = rd("out/cues.auto.json");
for (const b of beats) {
  const by = {};
  for (const c of cues.filter((c) => c.t >= b.t[0] && c.t < b.t[1])) by[c.type] = (by[c.type] ?? 0) + 1;
  console.log(b.id, b.t.join("-"), b.device ?? "-", b.join ?? "cut", b.zoom?.kind ?? "-", JSON.stringify(by));
}' <film>
```

Read it against the device map (`device-playbook.md` §3): a row with `device`, a `punch-in`, a stamp or a draw-on is a candidate; a row with only `key`, `paper-slide` or `paper-place` from entrances is silence by default.

## Span check: where each cue sounds against the words

```bash
node --input-type=module -e '
import { readFileSync } from "node:fs";
import { NORMS } from "<engine>/core/checks/norms.mjs";
import { ONE_SHOT_TAIL } from "<engine>/core/audio/sfx.mjs";
const film = process.argv[1];
const rd = (p) => JSON.parse(readFileSync(p, "utf8"));
const cues = rd(`${film}/crew/sfx-cues.json`);
const words = rd(`${film}/voice/words.json`).words;
const lib = rd("<engine>/core/audio/sfx-library.json");
const PRE = { contact: 0.25, peak: 0.45 }; // MAX_PRE in core/audio/sfx.mjs: lead-in before `t`
const m = NORMS.audio.sfxWordMarginS;
for (const c of cues) {
  const a = lib[c.type];
  const from = c.t - (PRE[a?.anchor] ?? 0) - m;
  const to = c.t + (c.len ?? a?.tail ?? ONE_SHOT_TAIL) + m;
  const over = words.filter((w) => from < w.end && to > w.start).map((w) => w.w);
  console.log(c.t.toFixed(2), c.type.padEnd(12), `${from.toFixed(2)}-${to.toFixed(2)}`, over.length ? `over ${over.join(",")}` : "in a pause");
}' <film>
```

This is the stricter cousin of M5 (it adds the lead-in). Every "over" row needs a line in `sound.md`.

## Mix and gate

```bash
node <engine>/core/audio/mix.mjs --video <film>/out/silent-9x16.mp4 --voice <film>/voice/voice.wav \
  --sfx <film>/out/sfx.wav --music <film>/assets/music/music.wav \
  --out <film>/out/final-9x16.mp4 --fade-out 0.3 --music-duck 0 --report
node <engine>/core/checks/run.mjs <film> --stage final
```

`--music-duck 0` is the default recipe: a fixed bed `MUSIC_FIXED_BELOW_VOICE` dB under the speech, no swell in the pauses; use `--music-duck <dB>` (default `MUSIC_DUCK`) only for the minority choice of a bed that rises in the pauses. `--fade-out 0` holds the bed to the cut. Add `--voice-level` only after M3 names the voice. `--voice-takes <film>/out/voices.auto.json` when the film declares more than one take.
