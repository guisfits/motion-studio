# The sync sheet, field by field

One file, `crew/sync-sheet.json`: `{ "beats": [ ... ] }`. The key stays `beats` (the engine reads
it); each entry is one **picture row**: one picture event on one phrase. Fields marked **gate** are
read by `tools/checks/sync.mjs` (S1–S9) and `tools/checks/picture.mjs` (H1), and by the
composition through `film.json` (see "Sheet to film.json" below); their names and shapes are the contract and never change. The other fields
are read by the art director, archivist, animator and reviewer; add no field not listed here.

## Fields

| Field | Rule | Read by |
|---|---|---|
| `id` | `b01`, `b02`, … in time order; never renumbered after the client has seen the animatic | gate (messages), reviewer |
| `t` `[t0, t1]` | seconds, 2 decimals, copied from the table (before the voice, C6: from the script's estimated clock, re-timed to `words.json` at C7). `t0` = `start` of the row's first word; `t1` = `t0` of the next row; the last row ends at the last word's `end` + tail ≤ `NORMS.sync.coverSlackS`. No gap, no overlap | **gate** S8, S9 |
| `says` | the exact words of words.json inside `[t0, t1]` (before the voice: of the script), single-spaced, punctuation as in the table; generated, never retyped | **gate** S4, S5 |
| `key` | 1–3 `{word, t}`. `key[0]` = the word the row's new picture lands on (the hero's name on a new plate; the new prop on a same-plate row), whatever its place in the row: a role word or a support spoken before the name never goes first. `key[1]`, `key[2]` time the supports, in time order. `t` = the word's `start` | **gate** S3; H1 and the animatic still use `key[0]` |
| `hero` `{asset, why}` | one per row. `asset` = manifest id, kebab-case, subject + source or date (`harbour-crane-1956`). Repeat the previous row's id when the plate holds and one element changes (one prop per phrase, swap, crowd step, board link). `why` = what the picture proves about the line | **gate** S1, S2 (`asset`), H1; art director, archivist (`why`) |
| `support` | `[]` to 2 manifest ids, each proving a second noun of the line | art director (manifest), animator |
| `lettering` | `[]` to 2 `{text, lands, mark?, says?}`. `text` 1–2 words, each said in this row; or display text (a numeral) with `says` naming the spoken words it lands on. `lands` = `start` of its first spoken word. `mark`: `circle` `underline` `highlight` `strike` | **gate** S4, S5, S6 (marks across the whole film) |
| `zoom` `{target, kind}` | `target` = `<hero id>.<part>`, a visible named part (`eyes`, `date`, `seal`, `title`, `figure`). `kind`: `push-in` `punch-in` `pull-out` `pan` `tilt` `drift` `static` `into-frame`. A `push-in` or `pull-out` is built at >= `NORMS.camera.emphasisMinScaleDelta` (T7); a gentler move is `drift` | animator (T7, T9 measure the result) |
| `device` | optional, one of: `hold` `breath-card` `word-card` `one-prop` `container` `crowd` `position-swap` `evidence-board` `grid` `scale-contrast` (see `device-playbook.md`) | art director (what to build), animator |
| `join` | optional: `cut` (a hard cut, only where it is continuous), `match`, `dissolve`; absent = the default join (the overlay's, else a carried transition: `film-animator` step 9). The join *into* this row. `dissolve` only where the brief's pace plan lists one | animator, reviewer |

Matching details that bite (`tools/checks/words.mjs`): case and edge punctuation are ignored, accents
and digits are not (`você` ≠ `voce`, `95` ≠ `noventa e cinco`: use the lettering's `says`). When a
word repeats in a row, `lands` / `key.t` pick the occurrence nearest the time given: give the right
one.

## Worked rows

Narration (words.json): `the 10.20 · trucker 10.32 · Malcom 10.80 · McLean, 11.15 · in 12.10 · Newark 12.30–12.90`.
Assets offered: an anonymous truckers photo, a named portrait of the man, a 1950s photo of the port.

```json
{ "beats": [
  {
    "id": "b07",
    "t": [10.2, 12.1],
    "says": "the trucker Malcom McLean,",
    "key": [{ "word": "McLean", "t": 11.15 }],
    "hero": { "asset": "mclean-portrait-1957", "why": "the man the line names, recognisable" },
    "support": [],
    "lettering": [{ "text": "McLean", "lands": 11.15, "mark": "underline" }],
    "zoom": { "target": "mclean-portrait-1957.eyes", "kind": "push-in" }
  },
  {
    "id": "b08",
    "t": [12.1, 12.9],
    "says": "in Newark",
    "key": [{ "word": "Newark", "t": 12.3 }],
    "hero": { "asset": "newark-port-1956-photo", "why": "the place the line names, in its decade" },
    "support": [],
    "lettering": [],
    "zoom": { "target": "newark-port-1956-photo.cranes", "kind": "pan" }
  }
] }
```

Why: "trucker" names a role; the subject is the man, so the hero is his portrait, never the
anonymous truckers, and `key[0]` is "McLean" though "trucker" is spoken first (a support keyed on
"trucker" would be `key[1]`). "Newark" is a new place, so it is a new row (grammar §10.2), not a support
crammed into the first. Lettering is a word the narrator says, on its word. Adjacent `kind`s differ.

## Row report (pre-check before the gate)

Run it in `<film>` (`cd <film>` first). It prints each row and a summary: words per picture row (grammar §10
"new picture every": ~4.5, p10–p90 2.7–8.3), how many rows hold the previous plate, rows in the
last 5 s against the body rate (R4 will measure the real ratio on the draft).

```sh
cd <film> && node -e '
const {beats}=JSON.parse(require("fs").readFileSync("crew/sync-sheet.json"));
const end=beats.at(-1).t[1];let prev=null,same=0;const wpr=[];
for(const b of beats){const n=b.says.trim().split(/\s+/).length;wpr.push(n);
 const s=b.hero?.asset===prev;if(s)same++;prev=b.hero?.asset;
 console.log(b.id,(b.t[1]-b.t[0]).toFixed(2)+"s",n+"w",s?"same-plate":"new",b.device??"",b.join??"",b.zoom?.kind??"",n>8.3?"<- long row":"")}
const tail=beats.filter(b=>b.t[0]>=end-5).length,body=beats.length-tail;
const med=[...wpr].sort((a,b)=>a-b)[wpr.length>>1];
console.log(`rows ${beats.length} · words/row median ${med} · same-plate ${same} · end/body row rate ${body&&end>5?((tail/5)/(body/(end-5))).toFixed(2):"n/a"}`)'
```

A row marked `<- long row` is a candidate to split on its next noun, unless it is a planned hold.
The summary line goes into the hand-off.

## Sheet to film.json

The sheet is not translated into new props: it stays in `crew/sync-sheet.json` (the one copy, which you edit; `film.json` points to it by path, never holds a second copy), and the animator's `scene.ts`
converts seconds to frames. The contract (`docs/film-contract.md`, "film.json") and the reference film
(`studio/films/example/film.json`) decide; when this table and they differ, they win and this table changes in the same commit.

| Sheet field | In `film.json` |
|---|---|
| the whole table | `sheet: "crew/sync-sheet.json"`, the file holding `{ beats: [...], register?, app?: { t0 } }`: one object per row with the fields above, `t`, `key[].t` and `lettering[].lands` in seconds as written |
| the voice's word table | `words: "voice/words.json"`, the file `{ words: [{ w, s, e }] }` (what `tools/captions/transcribe.mjs` writes) |
| `hero.asset`, `support[]` | `manifest: "crew/manifest.json"`, the file `{ assets: [{ id, kind, status, licence, source }] }`; the trace ids are these asset ids |
| closing house outro | `house: [t0, t1]` seconds, a window that puts nothing in the trace |
| a spot or test film's length | `length: { minS, maxS }` replaces the register's norm (the report carries an orange F1 until `crew/animation-notes.md` has a `length: <reason>` line, then yellow) |
| composition clock | `id` (composition `F-<id>`), `format` (`9x16`, `1x1`, `16x9`), `fps`, `durationInFrames` |
| anything the film needs beyond the sheet | film props (the example keeps its caption chunks in `captions: [{ id, words: [first, last] }]`, indices into `words`) |

The animator reads `sheet.beats[i].t`, `key`, `zoom`, `device`, `join` and `lettering` at import and turns them into
frames (`Math.round(seconds * fps)`); nothing is retyped. `support`, `device` and `join` have no dedicated `film.json`
key beyond the beat itself.

## Running the gate

The manifest does not exist yet, so run on a scratch copy outside the film folder (only `crew/sync-sheet.json`, a seed manifest and, once the C7 take exists, `voice/words.json`; no `film.json`, so F1 reads the register's norm and is the writer's; delete it after) with a seed
manifest of every id you used (never write `crew/manifest.json` in the film):

```sh
cd <film> && S=$(mktemp -d) && mkdir -p "$S/crew" "$S/voice" \
 && cp crew/sync-sheet.json "$S/crew/" && { [ ! -f voice/words.json ] || cp voice/words.json "$S/voice/"; } \
 && node -e 'const {beats}=JSON.parse(require("fs").readFileSync("crew/sync-sheet.json"));
const ids=[...new Set(beats.flatMap(b=>[b.hero?.asset,...(b.support??[])]).filter(Boolean))];
console.log(JSON.stringify({assets:ids.map(id=>({id,file:"",source:"",licence:"",status:"missing"}))}))' > "$S/crew/manifest.json" \
 && (cd <engine> && FILM_DIR="$S" FILM_STAGE=sheet npx vitest run src/film/__tests__/stage-gate.test.ts); cat "$S/crew/checks-sheet.md"
```

PASS for you: no S1–S6, S8, S9 lines. Before the voice (C6) there is no `voice/words.json`: the gate then skips S3, S5, S9, S11 and F1 and prints one yellow F0 note saying so; at C7, re-time the sheet to the take and run it again with the words. Paste the file (without S7 lines) into the hand-off and say
it came from a scratch copy.
