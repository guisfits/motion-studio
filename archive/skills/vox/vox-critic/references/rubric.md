# Rubric: scores, measured norms, hunt list, log

Norms come from the 28-reel reference studies (`inspirations/`), Vox producers' own accounts,
caption and loudness standards (DCMP, BBC, EBU R128, AES ducking study) and the engine's mix.
Sources: `vox-style-animation` → `references/sources.md`.

## 1. Twelve scores (1–10)

| Dimension | 10 | 6 | ≤ 4 |
|---|---|---|---|
| **Hook** | voice at 0.0 s; one whole sentence by 4.5 s (fact, number, what-if, "look at this"); the iconic subject on frame 0 with at most one mark | pleasant but generic; sentence ends late | title card, fade from black, blank ground, silence |
| **Argument** | one question → evidence → one insight; explicit turn at 40–60 %; payoff answers the hook; calm close | facts in a row, weak turn | no question, no turn, cannot say what it taught |
| **Evidence** | every noun has its literal object in the same sentence; documents pushed into and marked; right era, language, person | some decorative pictures | mood images, wrong evidence, code-drawn props |
| **Readability** | every word reads on the 360 px phone sheet; nothing under 44 px at 1080; nothing readable in UI zones | some labels strain | unreadable, overlapping, under the platform UI |
| **Text hierarchy** | caption 2–4 words, word-synced, one fixed lower spot; one hero word (1–3) per idea held 3–8 s; never a sentence | caption 5–6 words or drifting | sentences on screen, two text blocks, text over proof |
| **Composition** | ≤ 3 elements; one accent mark; one element ≥ 70 % width or ≥ 35 % area; every frame has a subject | centred and tidy, weak scale contrast | crowded, dead frames, competing accents |
| **Ground & material** | graded real scans, lifted blacks, one tint, grain at object scale; cut-outs with edge and one shadow angle; one world | clean but flat in places | flat colour, gradient, pure black, sticker-sheet pieces |
| **Cadence** | average shot 1.6–3.2 s; median ≥ 2.5 s; ≥ 2 hero holds ≥ 5 s with slow drift; < 1.5 s only under a spoken list | one dead stretch or one rushed beat | frantic hopping or frozen beats |
| **Motion craft** | springs, motivated moves, slow push ≤ ~2 %/s, blur not ghosts; ≤ 2 moves per scene; ≤ 3 whips; same move ≤ 2× | some linear slides or pops | fades only, punch-ins, ghosting, repeated whips |
| **Voice & intelligibility** | voice 90–100 % of runtime, no gap > 0.4 s before the end; ASR transcript 0 wrong words; clear on a phone speaker | a word or two strained | words masked, dead air |
| **Mix** | -14 ± 1 LUFS, LRA ≤ 3, TP ≤ -1 dBTP, 1 s RMS spread ≤ 5 dB; bed ≈ 20 dB under speech or none; SFX ≤ 1 per 4–6 s, 12 dB under + ducked, each on a visible landing | SFX a bit dense or hot | racket: SFX at voice level, stacked, off the motion |
| **Ending** | calm close (~2.5 s) then CTA as the last spoken line (≤ 11 words, ≤ 4.5 s); ≤ 3 new elements in the outro's first second; no stinger | CTA weak or late | rushed dump of elements, stinger, no CTA |

## 2. Measured norms (fill the table every round)

| Measure | Norm | How |
|---|---|---|
| Length | 45–60 s (90 max); ≥ 27 s if it has a turn | `ffprobe` |
| Words/s | 2.2–3.0 (≈ 2.3 pt-BR, 2.5–2.7 EN) | transcript words ÷ voiced duration |
| Hook complete | ≤ 4.5 s | word times |
| Turn position | 40–60 % | word times |
| Average shot | 1.6–3.2 s | cut detector `scene>0.25–0.3`, merge < 0.7 s; add visual beats the detector misses (pushes, pieces landing) from the contact sheet |
| Median beat | ≥ 2.5 s | same |
| Hero holds ≥ 5 s | ≥ 2 | contact sheet |
| Proof held after its mark lands | ≥ 2.5 s, uncovered | strips |
| Whips | ≤ 3 | contact sheet |
| Caption max words | ≤ 4 | phone sheet |
| Accent marks per frame | ≤ 1; accent colours per film ≤ 2 | stills |
| Elements per frame | ≤ 3 | stills |
| `--flat` ranges | none | `sheets.mjs --flat` |
| LUFS / LRA / TP | -14 ± 1 / ≤ 3 / ≤ -1 | `ebur128=peak=true` |
| Music under speech | ≈ -20 dB (≥ 10 LU minimum) or no bed | `mix.mjs --report` |
| SFX under speech | -22 to -25 dB; above -18 fails | `mix.mjs --report` |
| SFX density | ≤ 1 per 4–6 s | `cues.auto.json` after thinning |
| Voice coverage | 90–100 % | word times |
| ASR errors | 0 | transcript of the final mix |

## 3. Hunt list

**Script**: no question · hook not a whole sentence by 4.5 s · no turn · payoff does not answer
the hook · a line whose noun has no object · a fact without a source · CTA not the last line or
> 11 words · bridge or CTA wording that the project overlay did not supply.

**Picture**: a decorative picture under a factual line · wrong era/language/person · code-drawn
real-world object · piece from another material world · flat or gradient ground · pure black ·
texture at the wrong scale · all pieces with the same edge and shadow · two marks in a frame · a
mark on nothing readable · hero word cropped into another word.

**Text**: a caption > 4 words · a caption that moves position · a caption over the proof, a
face, a UI header or a number · a sentence on screen · a plate or strip that arrives empty · a
caption cropped by a camera roll (use screen-pinned captions) · text under 44 px · anything
readable in top 220 / bottom 400 / right rail 140 from y 1100.

**Motion**: a pop, grow or fade from nothing · a linear slide · a punch-in · a whip that ghosts ·
the same move > 2× · > 3 whips · a station with no new information for > 5 s · a shot < 1.5 s
outside a spoken list · a cut into black or a dead frame · exits that fade to a ghost · a jump cut
inside a screen recording · stepped captions or stepped UI recordings.

**Sound**: SFX on a spoken word · SFX stacked or ringing into the next · a sound per
micro-action · a cue off its landing frame · a whoosh on a tiny move · a bed in front of the voice
· a pumping duck · dead air > 0.4 s · a stinger · loudness off target.

**Engine defects (always hunted)**: text overlapping during a swap · two full screens
crossfading · blurry scaled text · corner labels or frame borders (AI-video giveaways) · a stutter
at a loop seam · determinism failure between two renders.

**The Vox moves** (count, never a quota): voice on frame 0 · literal object per noun · document
pushed in + marked · one huge number per scene · map with one route · cut-out on a textured
ground with shadow · hero word behind the subject · one hand mark · match cut or zoom-through ·
stepped 12 fps paper over a smooth camera · gate weave on a still · page turn / tape / tear ·
before/after ("take it away") · presenter reset 3–4 s (if there is a presenter) · calm close then
CTA. Cite a timestamp for each one found; block a film whose moves are unclear, unearned or
crowded in.

## 4. `review_log.md`

```markdown
## Round 2 — draft + contact + phone + flat + strips at 2.9, 5.7, 8.6

| Hook | Arg | Evid | Read | Text | Comp | Ground | Cad | Motion | Voice | Mix | End |
|------|-----|------|------|------|------|--------|-----|--------|-------|-----|-----|
| 8    | 7   | 6    | 8    | 9    | 7    | 8      | 6   | 7      | 9     | 7   | 6   |

Measured: 52.4 s · 2.4 w/s · hook 3.9 s · turn 49 % · ASL 2.3 s · median 2.6 s · holds ≥ 5 s: 1 ·
whips 2 · caption max 4 · accents/frame 1 · flat: none · -14.2 LUFS · LRA 2.1 · SFX 0.18/s.
Moves: voice@0.0 · doc push@12.1 · route@20.4 · split@27.0 · close@44.8.

1. 🔴 Evidence · 14.0–16.5 s — a mood photo under "the treaty was signed" (strip-14.0). Fix: the
   treaty scan, push to the signature line.
2. 🟠 Cadence · 31–34 s — three stations in 3 s (contact). Fix: one station, two pieces placed.
3. 🟠 Mix · 22.3 s — tear SFX on "never" (wave). Fix: move the tear 0.4 s later, gain 0.6.
   Fixed → re-rendered `--draft --from 12 --to 35`.

Fresh eyes (final round): scores …, 3 worst …, verdict.
```

When re-reviewing after changes, show before/now for each change class with ≤ 10 samples.
