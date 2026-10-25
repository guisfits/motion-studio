# Editing and composition grammar of the editorial-collage film

Date: 2026-10-15. Evidence base: 1291 findings from 323 finished pieces (client Pinterest board `pin`, @hex_creatives `hex`, @earn.edits `ee`), plus measurements taken for this synthesis (see Method). Technique: Chris Moran's 277 lessons (`moran/<reel>`) and `research/craft.md`. This file is the knowledge base the film-crew skills are written from: it says what professionals do, how often, with what numbers, and who on the crew owns it.

Reading the citations:

- `hex/DUiOWpiCare`, `ee/DaAV2R5IuSi` = Instagram post id; `pin/349959` = Pinterest pin `7359867641573` + the last 6 digits; `pin/fd62cda1` = the hashed board image. A tag `(B)`, `(C)`, `(D)` after an id means that piece is not in the target register A (see §0).
- `moran/<reel>` = a lesson in `tutorials/chrismoran/lessons.jsonl`; `craft §2.x` = `research/craft.md`.
- `asr/<id>` = my Whisper transcript of that piece's audio (method below).
- `~` = my inference, not measured and not stated by a finding.
- **Measured** = computed from the OpenCV shot lists (`shots.json`, every video piece) or from frames; reliable. Sizes and angles quoted from findings were read by eye and are approximate.

## Method (what was computed, and its limits)

1. **Register.** Aspect ratio from `ffprobe` on every video (203 with media). Speech from a Whisper (`ggml-small`) transcript of the first 90 s: words per second. Narrated = ≥ 1 word/s and not sung lyrics (lyrics confirmed by reading the transcript: `pin/349994`, `ee/DausEm8OxlC`, `ee/Db-fZK_OO76`). Duplicates removed: `pin/350158`=`pin/349964`, `pin/350165`=`pin/349973`, `pin/bf849c48`=`pin/349995`, `ee/DbVMvRvMboX`≈`ee/Da2XkSfOy7h` (same film with the After Effects UI left in). 319 unique pieces.
2. **Shot statistics.** Per-shot duration, camera class (hold, drift, pan, push-in, pull-out, rotate), zoom ratio, `peak_at` (where in the shot the move is fastest, 0 = first frame, 1 = last), stepped flag, soft-transition spans: read from each piece's `shots.json` and pooled per register.
3. **Picture change vs caption change.** For each cut I compared the last frame of the outgoing shot with the first frame of the incoming one (share of pixels that moved less than 25 levels). A held shot compared with itself scores ~0.7 (median, start vs end); a cut that scores ≥ 0.7 is counted as "same picture" (caption or one element changed). This is a heuristic (~): treat it as an estimate, not a count.
4. **Device prevalence.** Each device has a text pattern run over all 1291 findings (negated phrases such as "no dissolve" removed first); `pieces` = distinct pieces whose findings describe the device. Findings average 4 per piece and describe only what the analyst noticed, so these are **lower bounds**; where a device is measurable I also give the measured prevalence, which is the number to trust.
5. **Correction to the findings.** Several rhythm findings say "the picture changes on every word" (`hex/DP6L1BqCc0g`: "one clip with a caption word per event"). The shot frames of `hex/DP6L1BqCc0g` show caption words accumulating inside one shot and a new clip or paper card at most cuts. Measured over register A, one edit event lands every ~3.5 spoken words (§Rhythm model). "Every word" is a fast variant, not the norm.

## 0. Registers

| Register | What it is | Pieces | ASL s, median (p10–p90) | Events / 10 s | Duration s | Speech words/s |
|---|---|---|---|---|---|---|
| **A** | narrated vertical (9:16; one 1:1) collage explainer: the target | 165 measured (hex 106, ee 51, pin 8) + 2 `~` (`pin/350009`, `pin/350031`, media missing) | 1.17 (0.71–2.05) | 8.3 (4.7–13.8) | 48 (30–66) | 3.0 (2.3–3.4) |
| A, hex only | archival-paper explainer | 106 | 1.00 (0.66–1.84) | 9.5 (5.1–15.2) | 54 (39–68) | 3.1 |
| A, ee only | business explainer, props and UI | 51 | 1.40 (0.85–2.01) | 6.9 (4.7–11.5) | 38 (27–49) | 2.6 |
| **B** | music-led or silent: lyric type, stings, motion loops | 20 | 3.21 (0.25–8.54), bimodal | 1.9 (0–39) | 12 (6–22) | 0.1 |
| **C** | narrated 16:9: footage essays and a few landscape collage explainers | 18 | 0.96 (0.49–4.18) | 10.3 (2.2–20.3) | 54 (14–88) | 3.0 |
| **D** | still collage posters and asset sheets (Pinterest images) | 114 | — | — | — | — |

Notes. B is two different things: lyric type at 0.25–0.5 s per event (`pin/349994`, `ee/DausEm8OxlC`, `ee/Db-fZK_OO76`, `hex/DcViZM2ouct`, `hex/Dds_rrHvnyR`) and near-static loops of 3–15 s (`pin/349973` one locked shot, `pin/350004`, `pin/350166`). C mixes footage-led essays (`hex/DcG_IX3P3vI`, `hex/DeGwAnTCJqI`, `hex/Dd_AuDsv9OM`, `hex/DdOCMfmCbLq`, `hex/DcO003cvlUI`), landscape collage explainers (`pin/349959`, `pin/349964`, `pin/349969`, `pin/349972`, `pin/350021`, `hex/DYZBoYQiQBA`, `hex/Dae8G-ZiP7P`, `hex/DeL0qoEvYmD`, `ee/Db7vTmguuxN`) and one type-only spot (`ee/Db2uSdmoVU0`). Device tables count pieces from all registers; the `(B)`/`(C)`/`(D)` tags show where a cited example sits. D carries most of the evidence on cut-out edges, palette and still composition and none on timing.

What B, C and D teach that A lacks:

- B: type whose length equals the sung syllable (`ee/Db-fZK_OO76`), a wipe that becomes the next ground (`ee/DausEm8OxlC`, `ee/Db-fZK_OO76`), a loop driven by one cause-and-effect micro-event (`pin/349973`: a hand with a remote enters, the screen changes). The overlap and crop tolerance of B does not transfer to narration (`ee/DausEm8OxlC` odd finding).
- C: one number per beat as count-down cards of 0.4–1 s (`hex/Dd_AuDsv9OM`), glowing type on black cards (`hex/DeGwAnTCJqI`), one map used as the stage for a whole film (`hex/DeL0qoEvYmD`), one grade over dozens of stock sources (`hex/DeGwAnTCJqI`, `hex/DcG_IX3P3vI`).
- D: rim width, torn-edge, disc stage, palette counts and the crowding tells (§Odd).

---

## 1. Rhythm

| Device | Owner | Pieces (findings) | Measured in A |
|---|---|---|---|
| Phrase-locked cut | director | 16 (hex 11, ee 3, pin 2) | 1 event / 3.5 words (2.1–5.5) |
| Caption as the motion | animator | 14 (hex 10, ee 4) | ~20% of cuts keep the picture (6–51%) |
| Paper breath card | storyboard | 35 (hex 24, ee 10, pin 1) | — |
| Burst, then hold on the point | director | 7 (hex 3, ee 4) | longest shot 4.6 s (2.9–7.8) |
| Decelerating ending | director | 25 (hex 10, ee 14, pin 1) | last 5 s cut at 0.53× body rate |
| Count in steps | animator | 31 (hex 16, ee 13, pin 2) | — |
| Flash train | animator | 14 (hex 11, ee 2, pin 1) | 32/165 pieces have ≥ 3 flashes ≤ 0.2 s |
| Opening-line formula | writer | 74 openings (asr) | first 3 s cut at body rate (ratio 1.03) |

**Phrase-locked cut.** The edit lands on the spoken phrase. Measured in A: narration 3.0 words/s, one edit event per 3.5 words (p10 2.1–p90 5.5), one new picture per ~4.5 words (`~`, heuristic), pooled shot median 0.75 s (0.17–2.4).
- When: every clause gets its picture; the word-speed variant (shot median 0.17–0.24 s) only for a run of names, stats or hype: `hex/DUiOWpiCare` (picture on every word, slow beats only for a number), `hex/DXUEoamgkj5`, `hex/DPgS8B7CZoY` (each club named gets its clip), `hex/DNpu95sCyfO`.
- How: hard cut on the onset of the word that names the new picture (`hex/DN-WcdHiZCs`); a new clip per phrase (`hex/DeGwAnTCJqI` (C): every 2–4 words a new shot); two cuts per phrase at most (`hex/DSA2Hs3k06k`).
- Wrong: the voice outruns the picture (`hex/DNDJyk8pizL` why-line). Fix: the picture arrives on or before the noun (craft §2.7; timing tolerance not measured here, `~`).

**Caption as the motion over a held picture.** On a held face, plate or engraving the caption chunk changes and the picture does not.
- Numbers: caption chunks of 2–5 words (`hex/DY_8VpvCpeO`, `hex/DbnDiSLCtax` 2–4); swaps every ~0.4–0.6 s (`hex/Dd0qOzpqoYf` 0.4 s, `hex/DcO003cvlUI` (C) ~0.5 s); the picture under it lasts 2–4 s (`hex/DY_8VpvCpeO`) up to 9.25 s on a talking head (`hex/DcO003cvlUI` (C)). Each engraving carries 1–2 label swaps before it is replaced (`hex/Dd0qOzpqoYf`).
- When: a talking head, a plate that needs reading time, a thesis whose words flip (`hex/DcG_IX3P3vI` (C): "very good at predicting… / terrible at predicting…" swapped with no cut).
- How: the chunk replaces in place at a fixed position (`hex/DbnDiSLCtax`, `hex/Dbxj93xiCqg` 3 chunks on one paper card).
- Wrong: tiny low-contrast caption over a moving face (`hex/DcO003cvlUI` (C), 2.5% height). Fix: a plain band or a glow.

**Paper breath card.** A near-empty paper or flat card with one short line, between image bursts.
- Numbers: 0.3–0.5 s spacer words (`ee/DcszHOXuFU6`); 0.8–1.5 s cards (`hex/Dbxj93xiCqg` 0.8–1.2, `hex/DbnDiSLCtax` 0.9–1.5, `hex/Dbc-vIXCCqe` ~1.5, `ee/Dbp5HyyOmsR` 1.3); 4 s for a thesis card (`hex/DcG_IX3P3vI` (C)). Frequency: 3 in 65 s (`hex/DY_8VpvCpeO`), 5–7 in 63 s (`hex/DYy1TUWufoF`), 6 in 56 s (`hex/DbnDiSLCtax`).
- When: a date or one-line fact (`hex/DbnDiSLCtax` "It's 1932."), a statement with no honest picture (`hex/Dbc-vIXCCqe`), after the hook and before the body (`ee/Dbp5HyyOmsR`), an emotional low (`hex/DbNcjZ2iwUc`), right before the answer (`ee/DcaqrJkOiD3`), a one-word negation (`hex/DdI4HMVi99s` "no money").
- Variant, call-and-response: picture beat and pure type slate alternate (`ee/DZC3QoBoN_B`; `ee/DY9SS5YOhS8` slate 0.7 s vs plate 1.5–2 s).
- How: textured paper, never flat white (`hex/DaAIlijic8Y` creases); optional ghost watermark of the subject at ~10% (`hex/DbSap1rTb6K`, `hex/DdDvS3ZC1gg`, `hex/DeYtNniiUHe`); cut out of the card straight into a picture that already carries the next line (`hex/DbnDiSLCtax`). Moran: a flat background loses identity (`moran/DY7TSLJAQef`).

**Burst, then hold on the point.** A run of sub-second flicks resolves into one long hold on the line, number or evidence that matters.
- Numbers: 8–12 clips in 4–5 s then a 6 s hold (`hex/DcG_IX3P3vI` (C)); 3–5 flicks then 5.9 s (`hex/Dc3B4rcCH18`); five 0.13 s shots then 2 s (`ee/DZuVqDpO0Um`); 0.27 s cuts then 3.4 s (`ee/DdI5hwFuoI6`); 0.13–0.23 s stutter then 1.3 s (`ee/DQucioMABeN`). Measured A: longest shot per piece 4.6 s (2.9–7.8); 6% of shots ≥ 3 s, 34% < 0.5 s.
- When: "everyone says X" then the argument (`hex/DcG_IX3P3vI`); a list that resolves into one idea (`ee/DdI5hwFuoI6`); the key number or conclusion (`hex/DUiOWpiCare` ~2.8 s; `hex/DeGwAnTCJqI` (C) 9.2 s climax card); footage that is itself the evidence (`hex/DdbK-PAT7O6` (C) 8.6 s).

**Decelerating ending.** Measured A: the last 5 s cut at 4.0 events/10 s against 8.5 in the body (ratio 0.53); last shot 2.2 s (0.3–5.6).
- How: a fade to white with the last phrase in italic serif held ~2 s (`hex/DXUEoamgkj5`); an empty white card ~1.5 s (`hex/DUQRqS2icUB`); the last word small and alone on paper (`hex/DPwBS-mCRuS`, `hex/DNNfSWsJ0em`); 1.5 s dissolves at the close (`hex/DSpnlAhCaJ5`, `hex/Daug-7bC4ZY`); three static slates in the final 3 s (`ee/DYgz0USId6P`); a tiny line in a big field (`ee/DYEuMpvIhYK`, 6% height). Bookend: close on the opening device (`ee/DcJM47zIj-t` ledger, `ee/DdlOmjlOR0b` same plate).
- Wrong: the CTA breaks the register (`pin/350009` dark UI outro; `ee/DcD4mcfIgey`). Fix: the CTA as a prop scene in the film's own world (`ee/DZXDJ8AuAiU`, `ee/DaU3XslOTOa`, `ee/Dbp5HyyOmsR`). The ee CTAs advertise the account's own product; a film without a CTA ends on the bookend or the quiet card (`~`).

**Count in steps.** A number or date advances in steps on one spot, then holds.
- Numbers: 3 swaps in ~1 s (`hex/DcG_IX3P3vI` (C)); 3 swaps of 0.3–0.4 s (`hex/DeBjyarCfFn` (C) `$` → `$17.` → `$17.8 million`; `hex/Dc3B4rcCH18`); a counter run of ~1.5 s (`hex/DXy2ea_ib-P`, `hex/DZmh9k_C2cp` 0 → 532, `ee/DcijzMlOiKS`); years at ~0.3 s each, then a 2–3 s hold (`pin/350031` `~`A); an altimeter at ~8 ticks/s (`hex/Da44fBhCbJd`).
- When: an escalating stat, elapsed time, a price or age that changes.
- How: put the number on an object (`ee/DZXDJ8AuAiU` flip board at the figure's belt; `hex/DXy2ea_ib-P` truck side; `hex/Dc3B4rcCH18` placard); monospaced digits so they do not jitter (`moran/DaNlGAcgYsD`); odometer roll (`moran/DLTLw1DpgwE`). Restraint variant: the number typed small (`ee/DcaqrJkOiD3`).

**Flash train.** A run of 0.13 s white or glow frames on an intensity beat.
- Numbers: trains of 5–9 flashes of 0.13–0.17 s (`hex/DTC-mtEiT3S`); bursts of 8, 7, 8, 5 (`hex/DOOCNSVCexy`); 4 flashes in the first 1.9 s (`hex/DPBpZK4CbYi`). Measured A: of all soft events, 32% are ≤ 0.2 s; 32/165 pieces have ≥ 3 such flashes; the median A piece has none.
- When: a sports climax, a threat word, a front-loaded hook. Moran: exposure flashes as a bridge (`moran/DMDyGp6Jwwx`).

**Opening-line formula (writer).** Measured from the transcripts: 74/165 A openings (hex 51, ee 22, pin 1) use one of: a direct question or "you" (18; `asr/DN-WcdHiZCs` "Have you seen this old man…"), a negation twist (18; `asr/DSpnlAhCaJ5` "…isn't Ferrari."), a year first (17; `asr/DOvNKEtiREq` "In 1958, Lego…"), a superlative (15; `asr/DQwRiFzCf6W` "The greatest decision in photography history…"), "What if I told you" (13; `asr/DNDJyk8pizL`), a number first (4; `asr/DaAV2R5IuSi` "20 billion dollars on the table."). Categories overlap.
- The hook is in the line and the picture, not in faster cutting: the first 3 s cut at the body rate (ratio 1.03, measured).
- Picture of the hook: tilted photo cards stacking on white, ~10 in 3 s (`hex/DUiOWpiCare`); the object with its words around it (`hex/DN-WcdHiZCs`); a burned-in social title for ~4 s (`hex/DUQRqS2icUB`, `hex/DW522AEAhOq`); a loud ground used only for the hook (`ee/DTxZksEDMiQ`, `hex/DZw15OaCDZv`).

---

## 2. Camera

| Device | Owner | Pieces (findings) | Measured in A |
|---|---|---|---|
| Never-static still | animator | 60 (hex 35, ee 21, pin 4) | 144/165 pieces move on ≥ 50% of shots |
| Stepped (12 fps) motion | animator | 58 (hex 43, ee 10, pin 5) | ≥ 25% stepped shots in 91/165 |
| Punch-in to the named detail | storyboard | 17 (hex 12, ee 4, pin 1) | push ≥ 1.5 in 72/165; ≥ 2.0 in 29/165 |
| Snap, then settle | animator | 7 (hex 5, ee 2) | 45% of moves peak in their first quarter |
| Pull-out reveal | storyboard | 25 (hex 14, ee 9, pin 2) | pull ≤ 0.8 in 115/165 |
| Into the screen or frame | storyboard | 13 (ee 8, hex 3, pin 2) | — |
| Layered parallax | animator | 13 (hex 6, ee 6, pin 1) | — |
| Top-down desk camera | art-director | 33 (ee 15, hex 14, pin 4) | — |
| Vertical move on a tall subject | storyboard | 3 (hex 3) | — |

**Never-static still.** Every still carries a small push, pan or drift for its whole life.
- Measured A: camera mix by shots: hold 25%, pan 23%, drift 18%, push-in 12%, pull-out 11%, rotate 10%. Push-in zoom median 1.14 (1.05–1.48); push-in shot length 1.4 s (0.4–3.4); pan shot 1.3 s (0.3–3.5).
- Findings: 1–10% moves on paper (`pin/349959` (C)); 1.01–1.09 on archival stills (`hex/DN-WcdHiZCs`); 1.15–1.18 over 2 s (`hex/DY_8VpvCpeO`); ~1.24 on the portrait as its line lands (`hex/DaAIlijic8Y`); constant 1.09 with three depth layers (`ee/DdI5hwFuoI6`).
- Exception, the fast montage: the camera stays still and the cut is the move (`hex/DXUEoamgkj5` 39 holds; `hex/DcViZM2ouct` (B) zoom ≤ 1.03; `hex/DUiOWpiCare` zoom ≤ 1.12 on action footage; `hex/DPgS8B7CZoY` "the picture is already busy").
- How: animate one parent Zoom null, ~108% → 115% (`moran/DZFqNzwAqVa`, `moran/DLQ4Wp9pqv3`). Wrong: a dead hold (`pin/349989` (B), 8 identical seconds). Fix: keep 1–3% drift or an idle loop.

**Stepped (12 fps) motion.** Camera and piece moves play on twos.
- Measured A: median 30% of shots stepped; ≥ 25% stepped in 91/165 pieces (hex 63/106, ee 23/51, pin 5/8). It is the hex house style, not universal: ee median 9%.
- When: archival stills and low-res footage (`hex/DQepYZ4CfSt` 45/69, "hides upscaling"; `hex/DO5lBJLiTni` 32/47, "reads as archival film"); AI plates (`hex/Dbc-vIXCCqe` 32/36, "hides AI-image softness"); paper pieces (`ee/DZXDJ8AuAiU` 21/32).
- How: Posterize Time 12 on a top adjustment layer (`moran/DLQ4Wp9pqv3`, `moran/DaDhDFjAysT`); 8 fps for a page turn (`moran/Dafr0KjAkve`); jitter that snaps, not wiggle that glides (`moran/DQsNA9RCcs_`: 6 px, 2 moves/s).

**Punch-in to the named detail.** A push of ×1.5 to ×4 lands on the detail at the word that names it.
- Measured A: 72/165 pieces contain a push ≥ 1.5 and 29/165 a push ≥ 2.0; ≥ 2.0 is 3% of all push-ins. An accent, not a habit.
- Findings: ×2.9 on the ticket on the line that names it (`hex/DcapWBnCHCh`); ×2+ to a foot in a shackle (`hex/Dd0qOzpqoYf`); ×1.5 to the eyes on "lost the left eye" (`hex/DZmh9k_C2cp`); ~×4 to a face for a quote (`ee/DbVMvRvMboX`); ×2.02 into a watch dial (`hex/DPwBS-mCRuS`); ×2.8 on limited archive (`hex/DcS2NcaCHBM`); a punch that doubles as a blur transition (`ee/DcD4mcfIgey`).
- How: Moran punches 1×↔2× hidden by motion (`moran/DOb0h6VCSpM`). Evidence says use it rarely (see §Contradictions).

**Snap, then settle.** The move is fastest in its first frames and eases out so the caption is read on a settled picture.
- Measured A, moves ≥ 0.5 s: 45% peak in the first quarter, 33% in the middle half, 23% in the last quarter. Per piece, the median move peaks mid-shot in 109/165 pieces and early in 52.
- Findings: median peak 0.06 "settles for the read" (`hex/Dd0qOzpqoYf`); 0.07 "lands as a snap" (`hex/DdTK_skvNta` (C)); 0.12 (`hex/DbnDiSLCtax`); 0.0 "snap-in then hold matches voice phrasing" (`hex/DeOZeaQCs6q`). Counter-cases: near-symmetric 0.41 (`hex/Dbc-vIXCCqe`); peak late, accelerating into the cut (`pin/350033`, `pin/349959` (C)).
- How: snap-settle for a caption beat; a late peak only when the cut should carry momentum (`moran/DaDhDFjAysT`, cut at the fastest point; `moran/DPcvDgNDNM4`).

**Pull-out reveal.** From a detail to its context, from a face to the room, to the closing wide.
- Measured A: pull-out zoom median 0.87 (0.67–0.95); 115/165 pieces pull to ≤ 0.8 at least once.
- Findings: face to room (`hex/DeYtNniiUHe`, zoom 0.49–2.0); 0.21 scale reveal (`hex/DW522AEAhOq`; `hex/DeL0qoEvYmD` (C) block to planet); closing wide (`pin/349959` (C) 0.926); close-up proof then pull-out to the phone (`ee/DZuVqDpO0Um` 0.61); zoom-out makes room for each new card (`ee/DaU3XslOTOa`); the old scene becomes a frame hanging in the new one (`ee/DdI5hwFuoI6`).

**Into the screen or frame.** The camera pushes through a screen, window or picture frame until it is the next scene.
- Findings: dolly into a phone screen (`ee/DUGJjUEjO_I`); into a laptop in ~0.5 s (`ee/DUZvCOriq0d`); ~×4 into a monitor (`pin/350010`); TV image to full frame (`ee/DeG9eYVOknN`); gold frame grows 0.25 → 1.2 in ~1.5 s and the person steps out (`ee/Da2XkSfOy7h`); thumbnail ×6 (`hex/DYrYZt3irrR`).
- When: setup → product, person → their story, world → screen.

**Layered parallax.** Foreground layers move faster than the plate.
- Findings: three layers (curtains, booth, floor) at zoom 1.09 (`ee/DdI5hwFuoI6`); two-speed clouds (`hex/DakK_n7igAJ`); clouds in front of and behind a ship or phone (`hex/DZ1_nI7iEd8`, `ee/DYEuMpvIhYK`); a blurred passer-by as a natural wipe (`hex/DbC_1tFCI3K`, ~0.25 s); foreground blur framing the hero (`ee/Dbp5HyyOmsR`).
- How: split the photo into planes and dolly slowly (`moran/DZsDDmvtNJP`, `moran/DQu3nYiCepd`); lower contrast at the back (`moran/DMtlFlxJ6sg`).

**Top-down desk camera.** An overhead view treats a desk, pitch, road or map as the page.
- Findings: football pitch as a page with years on the grass (`ee/DZ4dXpRu9g6`); flat-lay of a product (`ee/DbagmfuIKyH`); a road seen from above carries "drove across America" (`hex/DdvgHQcIWYy`); real hand writing on the desk (`ee/DcaqrJkOiD3`); window-light stripes on the desk (`hex/DYg3NWxiZ7j`). See also "Desk stage" in §6.

**Vertical move on a tall subject.** Tilt or pan along a tall subject so 9:16 needs no crop: tower facade with a climber (`hex/DUQRqS2icUB`), a rope down to the cage in 3 s with ease-out (`hex/DeTi33ICNIC`), a tilt up to the skyline (`hex/DcapWBnCHCh`).

---

## 3. Transition

| Device | Owner | Pieces (findings) | Measured in A |
|---|---|---|---|
| Hard cut on the sentence | director | 39 (hex 23, ee 12, pin 4) | 75/165 pieces have no soft transition at all |
| Ground swap per beat | art-director | 12 (ee 7, hex 5) | — |
| Match cut on shape or object | storyboard | 14 (ee 7, hex 4, pin 3) | — |
| Flash frame over the cut | animator | 16 (hex 11, ee 5) | 32% of soft events ≤ 0.2 s |
| Blur or smear frame on the swap | animator | 31 (ee 14, hex 13, pin 4) | — |
| Dissolve reserved for time or mood | director | 37 (hex 28, ee 7, pin 2) | ≥ 0.6 s dissolve in 61/165 pieces |
| Paper-native wipe | animator | 36 (hex 13, ee 13, pin 10) | — |
| Palette flip marks a turn | director | 10 (hex 6, ee 4) | — |
| Iris or shape-mask reveal | animator | 9 (ee 7, hex 2) | — |
| Glitch cut | animator | 9 (hex 3, ee 3, pin 3) | — |

**Hard cut on the sentence.** The default join of the measured pieces; our crew does not take it as its default (`film-animator` step 9: the overlay's default join, else a carried transition).
- Crew note (client, 2026-10-19): the measured default holds only inside a scene or where the cut is continuous; between scenes the join is an animated paper transition (`research/second-film-postmortem.md` R3).
- Measured A: soft transitions per 10 s, median 0.28 (hex median 0, ee 1.8); 75/165 pieces have none.
- Findings: 99 shots, all hard cuts (`hex/DX6M6NCCWyE`); cuts on the beat of the sentence (`hex/Dbc-vIXCCqe`); 1-frame black between scenes (`ee/DaU3XslOTOa`); identical paper grain across the cut so it reads as an element swap (`pin/349959` (C)).

**Ground swap per beat.** Each beat changes its ground (paper, wood, sky, felt, flat colour); the new ground is the scene change.
- Numbers: 5 grounds, one every ~3 s (`hex/DZw15OaCDZv`); 5 grounds in 24 s (`hex/Db-UqYwiqT5`); no ground lasts more than ~6 s (`hex/DcF_qVxqsaA`); photo, paper card, collage rotated (`hex/DcapWBnCHCh`); 12 material sets in 46 s (`ee/DZXDJ8AuAiU`).
- When: a story with many places; each sentence introduces a new idea or actor (`ee/DZXDJ8AuAiU`).
- How: one flat material per ground with one cut-out set on it (`hex/Db-UqYwiqT5`); at most two saturated hues per scene, one halftone over all scenes (`ee/DbagmfuIKyH`); the palette switch reads as a chapter break (`ee/DdI5hwFuoI6`).

**Match cut on shape or object.** A circle, prop or hero object carries over the cut.
- Findings: the object swaps inside the same circle at the same position (`pin/350184` (B)); circle to eyeball (`pin/350021` (C)); round object changes scale market → planet in one frame (`ee/DebtJlmO-89`); the same phone prop across two leaders (`hex/DcF_qVxqsaA`); the product as the through-line (`ee/DdtaQr_O7w7`); each exit object is the next entrance (`ee/DdI5hwFuoI6`); object → texture zoom (`hex/DeGwAnTCJqI` (C)).
- How: keep motion direction across the cut (`moran/DPcvDgNDNM4`).

**Flash frame over the cut.** 2–4 frames of white, glow or flare hide the swap: a lamp-motivated flare (`ee/DRzcFdBjDPG`); 0.13 s glow (`hex/DdTK_skvNta` (C)); camera-flash glare (`ee/DUGJjUEjO_I`); white flash plus growing square (`ee/DeG9eYVOknN`). Use singly; the train is §1.

**Blur or smear frame on the swap.** The outgoing frame smears or defocuses for 1–4 frames; the new one is born settled.
- Numbers: 1 frame (`ee/DaAV2R5IuSi`, `ee/DbVMvRvMboX`, `ee/Da2XkSfOy7h`); 1–2 frames of ghost (`pin/349994` (B)); 2 frames defocus (`pin/350020`); 3–4 frames smear on speed (`hex/DaFnYhFCvKl`); ~4 frames radial blur (`hex/Da0NQ7eCAnr`).
- How: focus hunt keys 0, 4, 6, 0 px of box blur (`moran/DLdy8b5JpHC`).

**Dissolve reserved for time or mood.** Measured A: of soft events, 28% last ≥ 0.6 s; 61/165 pieces have at least one.
- When: one chapter turn (`hex/DN-WcdHiZCs`, the only 2.08 s dissolve); time jumps (`hex/DYy1TUWufoF` "dissolves signal time passing, cuts signal a new fact"; `hex/DcF_qVxqsaA` 0.4–2.5 s for "Today"); a quiet argument (`hex/DaaSLUAidHC`); a sombre close (`hex/Daug-7bC4ZY`); the payoff (`hex/DbnDiSLCtax` 2.7 s, "one long dissolve is reserved for the payoff"); softening grim archive (`hex/DdvgHQcIWYy`); dip to black or white at chapter breaks (`hex/DU3hTiOk2-M`).
- Rule seen: footage cuts hard, graphics dissolve (`hex/Dc-vZs9CkUT`).

**Paper-native wipe.** A tear, page curl, curtain, cloud, smoke or slab sweeps across and becomes the next ground.
- Findings: torn strip on a road band (`pin/349964` (C)); three-stage tear in 1 s (`pin/350151` (B)); page curl 0.5 s (`hex/DbXtTeqifQw`, `hex/Dbxj93xiCqg`); smoke or dust (`ee/DcJM47zIj-t`, `ee/DcijzMlOiKS`); clouds (`ee/DZ4dXpRu9g6`, `ee/Dd08TpPONpx`); curtain (`ee/DdlOmjlOR0b`); torn strip in 4 frames (`ee/DeWa3ljOu2j`); block wipe in the next scene's colour (`ee/DdtaQr_O7w7`); slab that becomes the ground (`ee/DausEm8OxlC` (B), `ee/Db-fZK_OO76` (B)).
- How: CC Page Turn + Posterize 8 fps + shadow layer (`moran/Dafr0KjAkve`); ink luma matte (`moran/DVcF9XyiSjm`); burn-film reveal (`moran/DcTljpCgNNJ`).

**Palette flip marks a structural turn.** Colour → B&W as the story turns bad (`hex/DY_8VpvCpeO`); colour at the peak, B&W at the fall (`ee/Da2XkSfOy7h`); black card for the negative, white for the answer, 6 flips in 38 s (`hex/DXOey6vghtu`); light → dark from message to offer (`ee/DUiSq11jO4R`); dark → white for the people or the hopeful turn (`hex/DeL0qoEvYmD` (C), `hex/DcO003cvlUI` (C)); desaturation for the last line (`ee/DcijzMlOiKS`).

**Iris or shape-mask reveal.** Iris as film language (`ee/DbAnBlpTkUQ`); a pentagon → hexagon → circle tunnel (`ee/DbagmfuIKyH`, ~6 frames over 1.5 s); window in black, 30% → full in 0.3 s for a change of viewpoint (`hex/DcS2NcaCHBM`); iris closing on one detail (`ee/DYURMKHoayc`).

**Glitch cut.** 1–4 frames of RGB split or pixel blocks; only when the topic is digital: AI montage (`hex/DcG_IX3P3vI` (C), 0.14 s × 30); hides AI-image swaps (`ee/Ddn42dGOwnB`); games (`hex/DdlM2RiK1ih`).

---

## 4. Entrance and exit

| Device | Owner | Pieces (findings) |
|---|---|---|
| One prop per phrase | storyboard | 5 (hex 2, ee 2, pin 1) |
| Stagger build that counts | animator | 42 (hex 27, ee 12, pin 3) |
| Drop and settle | animator | 31 (hex 14, ee 10, pin 7) |
| Hand as the agent | animator | 38 (ee 21, pin 11, hex 6) |
| Document slides in tilted | animator | 26 (hex 17, ee 9) |
| Typed or UI-native entrance | animator | 52 (ee 35, hex 11, pin 6) |
| Container opens | storyboard | 12 (hex 10, ee 2) |
| Overshoot pop on light pieces | animator | 12 (hex 5, ee 5, pin 2) |
| Multiply one cut-out into a crowd | storyboard | 19 (hex 8, ee 6, pin 5) |
| Position-locked swap | storyboard | 22 (ee 14, hex 6, pin 2) |

Exits are mostly cuts; the few designed exits are a sheet sliding over the pile (`hex/DdDvS3ZC1gg`), a crumple into a bin (`ee/DcD4mcfIgey`, "ignored" made literal) and a pull-out that turns the scene into a frame in the next (`ee/DdI5hwFuoI6`).

**One prop per phrase.** Each spoken noun brings its prop onto the held ground, in speech order: "No meters." "No bills." each pop with the word, ~0.7 s per beat, then the plate empties for the thesis (`hex/DZrkiVFCxe5`); one physical prop per key noun, one word per second (`ee/DUiSq11jO4R`); each noun gets its footage (`hex/DQepYZ4CfSt`); props arrive piecemeal in 0.5 s steps and the beat resets with a hard cut to the empty ground (`pin/349959` (C)). This is the storyboard rule behind most of §4 and §6.

**Stagger build that counts.** Items land 0.1–0.4 s apart so the count is seen.
- Numbers: 0.1 s (`hex/Db-UqYwiqT5` rows, `hex/DdvgHQcIWYy`); 0.15 s (`hex/DYy1TUWufoF`); 0.2 s (`hex/Dc-vZs9CkUT`, `hex/DbC_1tFCI3K`, `ee/DSc0jeJjB9u`); 0.25–0.3 s (`hex/DdqZ3qKKe7f`, `hex/DdDvS3ZC1gg`); 0.27–0.4 s (`ee/DdI5hwFuoI6`, `ee/DcD4mcfIgey`, `hex/DeL0qoEvYmD` (C)).
- When: "seven partners" shown as a row of seven (`hex/Dc-vZs9CkUT`); a group built then collapsed back to one (`hex/DdqZ3qKKe7f`); a cast from the archive (`hex/DYmMoGlCETm` ~0.4 s).

**Drop and settle.** A paper piece drops or slides with a small rotation and settles with a shadow: 2–3 frame settle (`pin/350031` `~`A); 4-frame bounce for a headline (`hex/DbILU8IileY`); stamp 1.3 → 1.0 in 2 frames as the percussive beat (`ee/DZ4dXpRu9g6`); bills drop one by one, 3 in ~1 s (`hex/DbnDiSLCtax`). Heavy paper lands without overshoot (craft §2.2, `~` not measured).

**Hand as the agent.** A hand places, presses, writes or erases: hands place buildings (`pin/350180` (B), `pin/349989` (B)); hands place index cards (`hex/DcF_qVxqsaA`); a recipe as hand actions on a fixed bowl (`hex/DZw15OaCDZv`); a gloved hand with a wand erases "FOR YEARS" (`ee/DbAnBlpTkUQ`); a real hand writes the number (`ee/DcaqrJkOiD3`); first-person hands make the viewer the shopper (`ee/DYt77hNOaeB`). Why: human scale and a visible cause.

**Document slides in tilted.** A page slides in at 3–12°, straightens or stays tilted, then the camera pushes to the headline: 0.4 s slide, ~8° to straight, push to headline (`hex/DapVrzSiKJR`); a 4–5 sheet stack at 0.3–0.5 s each (`hex/Dbxj93xiCqg`); 4 frames, 3° (`ee/DZHpNwSob_R`); ~12° over a plate dimmed ~50% so the paper is the only bright thing (`ee/DcaqrJkOiD3`).

**Typed or UI-native entrance.** Text types, bubbles stack, a cursor clicks; the interface supplies the motion. Register note: 35 of the 52 pieces are ee.
- Numbers: one character per frame (`ee/DSxDRZRDKVT`, `ee/DYEuMpvIhYK`); one chat line every 0.8–1 s (`ee/DTaQHn1DEll`); a prompt streaming ~2 s (`hex/DWG_-c3grGL`); serif italic typed at ~8 chars/s as a cold open (`ee/Db7vTmguuxN` (C)).
- How: a switchable cursor preset (`moran/DaNlGAcgYsD`); real captured pages treated as evidence (`moran/DLQw7mqJzRp`).

**Container opens.** Photos spring out of an envelope, fanned 0.1 s apart (`hex/DdvgHQcIWYy`); an envelope opens in 0.6 s on "one condition" (`hex/Dc3B4rcCH18`); a ledger whose pages are the dates (`ee/DcJM47zIj-t`); an exploded view that reassembles (`hex/DbXtTeqifQw`).

**Overshoot pop on light pieces.** Labels and stamps overshoot and settle: label pop 0.25 s (`hex/DZ1_nI7iEd8`); "13" overshoots, label and birds follow at 0.15 s (`ee/Dc0KeKyOQZE` (B)); ~15% overshoot (`pin/349991` (B)); small objects bounce while the figure stays fixed (`ee/DaU3XslOTOa`).

**Multiply one cut-out into a crowd.** 8 bottles → 80+ (`hex/DZw15OaCDZv`); 1 dove → 40 (`hex/Db-UqYwiqT5`); prisoners 3 → 12 → 24 at uniform scale (`hex/DeOZeaQCs6q`); one circle crop → a 4×5 grid in 1 s (`hex/DdvgHQcIWYy`); icons 15 → 30 in 4 steps (`ee/DYEuMpvIhYK`); 25 people, 9 of 10 vanish (`hex/DXEP5DogtTK`).

**Position-locked swap.** The frame, figure or label stays; only one spot changes: role words on the same Viking, ~1.1 s each (`ee/DcijzMlOiKS`); founders swap every 0.4 s (`ee/Ddn42dGOwnB`); bags change colour every 0.7 s (`hex/DbSap1rTb6K`); faces swap in 1–2 frames, type stays (`ee/DeB2BnjOvHp`); logos rotate in a phone dial, 4 in 3 s (`hex/DXoOsJdiSeU`); the CTA replaces the claim in the same text box (`ee/DUZvCOriq0d`).

---

## 5. Motion (inside a shot)

| Device | Owner | Pieces (findings) |
|---|---|---|
| Draw-on markup | animator | 54 (hex 25, ee 19, pin 10) |
| Data that performs | animator | 19 (hex 10, ee 7, pin 2) |
| Idle life on a held image | animator | 20 (hex 9, ee 9, pin 2) |
| Pose-swap puppet | animator | 12 (ee 7, pin 4, hex 1) |
| Tint wash on the story object | art-director | 18 (hex 9, ee 9) |
| Shape morph | animator | 5 (ee 3, hex 2) |

**Draw-on markup.** Circles, arrows, underlines, routes draw themselves on the word.
- Numbers: 3–4 frames per mark (`pin/349988`); 5 frames (`pin/349994` (B)); 6 frames for a marker ellipse (`ee/DY9SS5YOhS8`); 0.3–0.5 s for scribbles (`ee/DeB2BnjOvHp`); ~0.6 s arc (`hex/DapVrzSiKJR`); ~0.8 s map circle (`hex/DXoOsJdiSeU`); ~1 s loop round a figure (`hex/Dae8G-ZiP7P` (C)); ~1.2–1.5 s route (`hex/DVL9nizj2HD`, `hex/DYMUSnRiNbV`).
- When: pick a person out of a group photo (`hex/DdqZ3qKKe7f`, `hex/DeYtNniiUHe`); trace a route or distance (`hex/DcS2NcaCHBM`); circle the paradox word (`hex/DNDJyk8pizL`).
- How: Trim Paths (`moran/DLShlJxRXZe`), Roughen Edges ×2 for chalk (`moran/DMixnWEpuhj`), taper the end (`moran/DT2_SIMgBfI`), edge boil (`moran/DZdCD2YNk4d`). Wrong: a perfect vector line (`moran/DT2_SIMgBfI`). Fix: roughen and boil.

**Data that performs.** The number is shown as a quantity: bars made of the product itself (`ee/DbagmfuIKyH`); two bars with the cars riding on top, 5 events in 2.5 s (`hex/DVL9nizj2HD`); a line chart drawing in ~2.5 s (`hex/DW0u-HTguVA`); a ring 66 → 80% (`ee/DU-zVUXCD-r`); countries tinted one at a time (`hex/Dc-vZs9CkUT`); one map, 5 beats, only overlays change (`hex/DaaSLUAidHC`); a dot grid filling red over ~2 s (`pin/350010`). Maps: desaturate the base, colour regions in Overlay (`moran/DcTljpCgNNJ`); maps should steer attention (`moran/DLShlJxRXZe`).

**Idle life on a held image.** One small loop while text builds: a hazard sign, mousetrap or sunburst idling at ~10°/s (`ee/Dacjr7jNsbG`, "keeps a held image alive"); a painting swinging ~15° and settling in 4 frames (`ee/Dd08TpPONpx`); props swaying on a cable (`ee/DWYdcYwIc5K`); a bobbing floating island (`ee/DcszHOXuFU6`); a slow-rotating sunburst (`hex/DWlRxTpAkLW`). When: a hold of ≥ 1.5 s (`ee/Dacjr7jNsbG`).

**Pose-swap puppet.** Figures change pose by swapping drawings, not by warping: limbs re-posed every 0.5 s (`pin/350166` (B)); a 4-pose typing loop (`pin/349999` (B)); a 2-pose walk (`ee/DafS1lPu18x`); a walk loop is fine for ≤ 1.5 s (`ee/Dc0KeKyOQZE` (B)).

**Tint wash on the story object.** A region or object is washed at the moment the line names it: red 40% on "something is wrong" (`hex/Da9wmeYi1ZG`); red overlay at 0.7 as a blast radius (`hex/DaaSLUAidHC`); map tint on the region the line names (`hex/Dbc-vIXCCqe`); one prop recoloured lime on the money line (`ee/DbVMvRvMboX`, `ee/Dbp5HyyOmsR`); a red flood as an alert (`hex/DXjF3JdCU_b`).

**Shape morph.** A progress bar becomes a ribbon becomes the next word, 6 steps in 3 s (`hex/DV36JADibx8`); sun rays become a clock (`ee/DaAV2R5IuSi`); two dots carry a whole film with one 18 s shot (`hex/DW_DhQ6AmZ1`).

---

## 6. Composition

| Device | Owner | Pieces (findings) |
|---|---|---|
| One hero on a quiet ground | art-director | 31 (pin 15, ee 10, hex 6) |
| Footage on a paper mat | art-director | 20 (hex 16, ee 2, pin 2) |
| Desk or tabletop stage | art-director | 58 (ee 29, hex 25, pin 4) |
| Disc or burst stage | art-director | 49 (pin 29, hex 12, ee 8) |
| Evidence board | storyboard | 16 (hex 6, pin 5, ee 5) |
| Type interleaved with the subject | animator | 19 (ee 11, hex 4, pin 4) |
| Grid or mosaic for "many" | storyboard | 38 (hex 18, ee 14, pin 6) |
| Frame in frame | art-director | 42 (ee 22, hex 14, pin 6) |
| Scale contrast | storyboard | 21 (hex 9, ee 6, pin 6) |
| Clear centre, clutter at the edges | art-director | 6 (ee 4, hex 1, pin 1) |
| Document as proof | archivist | 49 (hex 32, ee 14, pin 3) |
| Reuse one plate or asset | storyboard | 13 (hex 8, ee 5) |

**One hero on a quiet ground.** One subject per beat, 40–90% of the frame empty: ~70% empty, subject 15–35% of the area (`pin/349959` (C)); 60–70% empty paper (`ee/DcD4mcfIgey`); figure 28% of height, 60% empty (`hex/Dc-vZs9CkUT`); object 10% of the frame, 85% paper for "one thing" (`hex/DOvNKEtiREq`); 90% empty chapter card (`ee/DeG9eYVOknN`). When: the line names one object or person.

**Footage on a paper mat.** 16:9 or square footage sits in a box on the paper page, captions in the bars: clip ~35% of the canvas, 65% paper (`hex/DNNfSWsJ0em`); box 30–40% of height (`hex/DPgS8B7CZoY`, `hex/DPwBS-mCRuS`); letterboxed in ~55% of events (`hex/DPY-sAcCXMC`); ~14 of 49 shots (`hex/DUQRqS2icUB`). The caption sits above the box at a fixed position across cuts (`hex/DP6L1BqCc0g`). Wrong: a small 16:9 clip in black 9:16 bars reads cheap (`ee/DTNgwGAjH7-`). Fix: a paper mat, or cover the clip with type and use it for one beat.

**Desk or tabletop stage.** Objects lie on wood, felt or a cutting mat seen from above: props ~45% of frame width, tilted 5–10° (`hex/DbnDiSLCtax`); book covers ~40% width with a soft shadow (`hex/Dbxj93xiCqg`); a steel tray for a medical topic: the material matches the topic (`hex/DdvgHQcIWYy`); three price cards with the middle one physically in the middle (`ee/DZC3QoBoN_B`); clutter at the edges frames a clear centre for the headline (`ee/DZuVqDpO0Um`).

**Disc or burst stage.** A flat colour disc, burst or blob behind the cut-out: disc ~45% of width at the same spot every beat (`pin/350184` (B)); yellow disc ~40% behind a face (`hex/DN-WcdHiZCs`); circle ~65% (`hex/DPBpZK4CbYi`); rays converging on the subject (`ee/DY9SS5YOhS8`); break out of the disc for depth (`pin/349961` (D), `pin/350043` (D)).

**Evidence board.** Pins, string and connector lines say who links to whom: red string drawn pin to pin while the camera pushes ×1.9 (`hex/DY4QF50i64w`); string in 0.5 s (`hex/DapVrzSiKJR`); a map with pinned polaroids and red thread (`hex/DeL0qoEvYmD` (C)); yellow lines between archive photos (`hex/DeYtNniiUHe`); a thin white connector to a small label (`hex/DeBjyarCfFn` (C)).

**Type interleaved with the subject.** Headline behind the subject, numeral behind the shoulders, letters around a prop: sky / text / hero / grass (`ee/DZuVqDpO0Um`); title behind and in front of the car (`hex/DXoOsJdiSeU`); "2008" behind the person (`ee/DaAV2R5IuSi`); "$8 Billion" behind the head (`ee/Ddn42dGOwnB`); a knocked-out word so the subject shows through (`ee/DSxDRZRDKVT`); a word behind a row of robots (`hex/DWvkgUhAqJb`). Moran: size the image like type (rebus, `moran/DdoVHX5gfP-`).

**Grid or mosaic for "many".** 16 painting tiles = "900 paintings" (`hex/DbNcjZ2iwUc`); a 5×4 library (`ee/DVDNgkZCtf4`); ~40 tiles and a push into one (`hex/DV36JADibx8`); 6×5 wall with one orange circle as the focal point (`hex/DWlRxTpAkLW`); one corrupted tile is the point (`ee/DRzcFdBjDPG`); a pattern with one off-pattern hero (`ee/Db7vTmguuxN` (C)).

**Frame in frame.** A TV, laptop, phone, gold frame or window holds the footage and turns it into an object: CRT at 70% width (`hex/DTnEO5KCawE`), 85% (`hex/DSpnlAhCaJ5`), 60% (`hex/DdbK-PAT7O6` (C)); laptop 60% (`hex/DcO003cvlUI` (C)); gold frame ~30% (`ee/DcD4mcfIgey`); a phone viewfinder that justifies zooms (`ee/DU-zVUXCD-r`); a peephole (`ee/DcszHOXuFU6`); an airplane window (`ee/DY9SS5YOhS8`). How: pick the TV by era (`moran/Dcm63HBAHzT`); screen treatments (`moran/DNmGyQupPlQ`).

**Scale contrast.** Tiny figure in a vast field, or many small against one big: astronauts ~3% of the frame on Mars (`hex/DTICqkGibPm`); a figure 1:12 to a tunnel of books (`hex/DaAIlijic8Y`); a man on a tiny globe (`hex/DW522AEAhOq`); a 10% figure on step 3 of a podium = underdog (`hex/DZ7O_jiit4O`); many small ships, then one at 80% width (`ee/DcijzMlOiKS`); an iceberg two-thirds underwater (`ee/DbagmfuIKyH`).

**Clear centre, clutter at the edges.** Props pushed to the corners and cropped by the frame; the centre holds the type (`ee/DZuVqDpO0Um`, `ee/DdI5hwFuoI6`, `hex/DYrYZt3irrR`); the type line sits low over a darkened band, never over the busy area (`ee/DRzcFdBjDPG`). In stills: centre 40% clear (`pin/349974` (D)).

**Document as proof.** A clipping, headline or screenshot, with the key clause marked, settles the claim: clipping ~90% of width (`hex/DNfiewopHaL`); screenshots tilted ~3° with yellow highlight then zoomed (`hex/DVZHDehkr_K`); a stack of three article sheets zoomed to "did not count" (`hex/DYMUSnRiNbV`); zoom into the highlighted clause (`hex/Dd_AuDsv9OM` (C)); the headline as the receipt (`hex/Dc3B4rcCH18`); a clipping on a flat red ground (`ee/DZHpNwSob_R`). How: real captured pages (`moran/DLQw7mqJzRp`); a real scan beats a fake (`moran/DbJSUGZpvzL`).

**Reuse one plate or asset.** One corridor plate for 6 beats, only the population changes (`hex/DeOZeaQCs6q`); the same plate for 5 shots (`hex/DXOey6vghtu`); one map for 5 beats (`hex/DaaSLUAidHC`); one statue scene as the base for hook, middle and CTA (`ee/DUZvCOriq0d`); one cut-out at two scales = wide and close (`hex/DZ7O_jiit4O`); one painting in two treatments (`hex/DbNcjZ2iwUc`).

---

## 7. Type

| Device | Owner | Pieces (findings) |
|---|---|---|
| Small serif caption on the quiet area | art-director | 58 (hex 47, ee 9, pin 2) |
| Key-word size jump | art-director | 24 (hex 15, ee 5, pin 4) |
| Highlighter on the key phrase | art-director | 53 (hex 33, ee 16, pin 4) |
| Name tag on the subject | art-director | 40 (hex 24, ee 11, pin 5) |
| Numeral hero, small unit | art-director | 42 (hex 26, ee 13, pin 3) |
| Echo stack | animator | 8 (hex 3, ee 3, pin 2) |
| Handwritten script as a second voice | art-director | 33 (hex 15, pin 10, ee 8) |
| Caption rule follows the ground | art-director | 18 (hex 10, ee 6, pin 2) |
| One word per card | director | 8 (ee 3, pin 3, hex 2) |
| Condensed caps headline stack | art-director | 47 (ee 22, pin 17, hex 8) |

**Small serif caption on the quiet area (the register-A caption).** 2–4 words of narration in a small high-contrast serif, often italic.
- Numbers: cap height 2.5–3.5% of frame height (`hex/Dbc-vIXCCqe` 3.5, `hex/DPwBS-mCRuS` 3.5, `hex/Dbxj93xiCqg` 3, `hex/Dd0qOzpqoYf` 3, `hex/DcF_qVxqsaA` 3, `hex/Da0NQ7eCAnr` 2.5, `hex/DdlM2RiK1ih` 2.5); 1–3 words (`hex/DU3hTiOk2-M`), 2–4 (`hex/DbnDiSLCtax`), 2–5 (`hex/DY_8VpvCpeO`).
- How: placed on sky, water or wall (`hex/Dbc-vIXCCqe`), on the chest or dark mid-tones, never on faces (`hex/DcF_qVxqsaA`), in empty sky (`hex/DdlM2RiK1ih`); white with a soft glow on footage, black on paper (`hex/DbnDiSLCtax`); italic on one word is the only emphasis (`hex/Dbc-vIXCCqe`).
- Register note: ee uses condensed caps instead (below); Moran's captions are uppercase in a pill (`moran/DL24UePpHWN`, `moran/DY7TSLJAQef`). See §Contradictions.
- Wrong: white 3% caption on a bright sky (`hex/DQepYZ4CfSt`); caption across eyes and mouth (`hex/DOOCNSVCexy`). Fix: move it to paper or a dark area, below the chin.

**Key-word size jump.** The stressed word grows; nothing else changes: 1.6–2× (`hex/DN-WcdHiZCs`); 3× (`hex/DPY-sAcCXMC` 8% vs 3%; `hex/DQwRiFzCf6W` 7% vs 3%); ~2.5× (`ee/DbVMvRvMboX`); 4:1 (`hex/DOvNKEtiREq`); key word 20–25% against 3% body (`ee/Dbp5HyyOmsR`); a name at 3× on its first appearance, then caption size (`hex/DO5lBJLiTni`); upright for the base clause, italic for the payoff (`hex/DeBjyarCfFn` (C)).

**Highlighter on the key phrase.** A marker box behind the one phrase that carries the claim.
- Numbers: reveals left to right in ~0.4 s (`hex/DaKcIKGisp7`), ~0.5 s (`ee/Dacjr7jNsbG`), ~0.6 s with the pen in frame (`ee/DbagmfuIKyH`); bar half a line high so letters overlap it (`hex/DbXtTeqifQw`); one per line (`hex/DYmMoGlCETm`); 8 amber labels in 20 s (`hex/DbILU8IileY`).
- Colour: yellow in most hex; lime (`ee/DTaQHn1DEll`), green (`ee/DQucioMABeN`), royal blue (`hex/Dc-vZs9CkUT`). One colour per film.
- How: a hand-drawn yellow box (`moran/DLnuz5ZJ6Ys`); markups override a frame with no focal point (`moran/DMixnWEpuhj`).

**Name tag on the subject.** A paper label, tape strip or slab names the person or thing: red-orange tag, two lines, lower third (`hex/DbSap1rTb6K`); blue tag on the chest (`hex/DakK_n7igAJ`); curled paper strips following the body (`ee/DcJM47zIj-t`); a label on the person's microphone (`hex/DX_ywaQC7Ny`); two tiers, who + what (`hex/DWdeabDAoHp`); stickers ~1 s per face (`ee/DeG9eYVOknN`); the real conference placards as lower thirds (`hex/DdI4HMVi99s`).

**Numeral hero, small unit.** The number is the biggest element: 12–15% of height (`hex/DPBpZK4CbYi`, `hex/DO5lBJLiTni`, `hex/DUiOWpiCare`); 20–25% (`hex/DNNfSWsJ0em`, `hex/DOOCNSVCexy`); 30–35% (`hex/DeGwAnTCJqI` (C), `hex/DeL0qoEvYmD` (C)); unit small beside or below (`hex/DUiOWpiCare`, `hex/DWdeabDAoHp`). Wrong: a numeral across the product logo (`hex/DPBpZK4CbYi` odd finding). Fix: bare paper or the dark part of the clip.

**Echo stack.** The same line 3–5 times, centre line black, the rest fading (`hex/DTC-mtEiT3S` 5 lines at 100/45/20% opacity; `hex/DT5DKMnCSPl`, `hex/DTShsFnidx_`, `hex/DTnEO5KCawE` 3 lines); a wall of 8 faded copies for "replicate" (`ee/DWYdcYwIc5K`). When: repetition, echo, stealth.

**Handwritten script as a second voice.** Cursive or marker for names, asides or the topic word against the serif facts: written stroke by stroke in ~2 s (`hex/DYOyiPDI666`), ~1.5 s for a chapter line (`hex/DYZBoYQiQBA`); a diary voice (`hex/Da44fBhCbJd`); script for names and mood, serif for facts (`hex/DdI4HMVi99s`); a marker scribble drawn in 4 frames on the wrong word to drop (`ee/DUiSq11jO4R`).

**Caption rule follows the ground.** A fixed rule: black ~3% above the letterbox, white 3.5% inside the clip (`hex/DPlWlKVCfON`); ~3% on footage, ~6% bold-italic centred on blank paper (`hex/DYg3NWxiZ7j`); size set by free space, one family (`hex/Dbxj93xiCqg`); the caption layer stays constant across footage and plates (`ee/DcaqrJkOiD3`).

**One word per card.** A sentence one word per empty card: ~0.4 s per word, 7 cards (`ee/DcD4mcfIgey`); ~0.3 s per word in a sting (`hex/DcViZM2ouct` (B)); one word per beat on a fixed spot (`ee/DdtaQr_O7w7`). When: a line to be delivered with deliberate pace, a tagline.

**Condensed caps headline stack.** Heavy condensed caps build line by line on a flat ground; the last word is recoloured or oversized: one line per beat, ~1.5 s hold (`ee/DaU3XslOTOa`); built word by word (`ee/DZXDJ8AuAiU`); type colour coded to the idea (`ee/DcszHOXuFU6`); the red headline is the only colour (`ee/DYt77hNOaeB`). With a 3% sentence caption running underneath for sound-off viewers (`ee/DYURMKHoayc`). Register: ee (22) and D posters (17); hex rarely (8).

---

## 8. Colour and texture

| Device | Owner | Pieces (findings) |
|---|---|---|
| Grey world, one accent | art-director | 52 (pin 31, ee 12, hex 9) |
| One treatment over every source | art-director | 20 (ee 9, pin 7, hex 4) |
| Grade carries the mood | art-director | 21 (ee 9, hex 7, pin 5) |
| Flat colour ground per scene | art-director | 10 (ee 8, hex 1, pin 1) |
| Vignette or spotlight pool | art-director | 44 (hex 21, ee 18, pin 5) |
| Moving window-light shadow | art-director | 7 (ee 4, hex 2, pin 1) |
| Scanline or CRT texture | art-director | 16 (hex 12, ee 4) |
| Visible paper ground | art-director | 99 (pin 52, hex 27, ee 20) |

**Grey world, one accent.** B&W or sepia material; one saturated hue reserved for the story object or key word: a single accent per beat (`hex/Dbc-vIXCCqe`); only yellow, 8 uses, each the plot noun (`hex/Dd0qOzpqoYf`); the red pepper plant is the only colour (`hex/DZw15OaCDZv`); only the hero squadron is red (`hex/DapVrzSiKJR`); accent under 5% of the frame area (`ee/DVDNgkZCtf4`); people grey, brand objects red (`ee/DafS1lPu18x`); one saturated element per scene (`pin/349964` (C)). How: Tint photos into the colour system at ~60% (`moran/DQpMiV_Cdpr`); Tritone from grey artwork (`moran/DR0HIWTiTkJ`).

**One treatment over every source.** One grade, halftone, grain or scanline layer makes mixed sources one film: grey-blue grade + grain + scanline over all footage (`hex/DNDJyk8pizL`); one palette across 8 clips (`hex/DTaMyIKCQYS`); halftone as glue across scenes (`ee/DbagmfuIKyH`); one grade and one vignette (`ee/DcJM47zIj-t`); halftone on licensed film stills (`ee/DbAnBlpTkUQ`); teal/gold grade on archive and modern clips (`ee/DZ4dXpRu9g6`). How: homogenise every clip the same way (`moran/DMOpmHxpAOA`); a CRT pass over archival (`moran/DTOKw4vieGq`).

**Grade carries the mood.** Colour for the optimistic beat, grey for failure (`hex/DY_8VpvCpeO`); hero warm, others grey (`hex/DaAIlijic8Y`); B&W for the technical beats (`hex/DaFnYhFCvKl`); dark for the past, warm for the payoff (`ee/DbAnBlpTkUQ`); colour saved for the human payoff (`hex/DdvgHQcIWYy`); colour spikes earned after quiet plates (`hex/DYy1TUWufoF`).

**Flat colour ground per scene.** A full-bleed saturated ground with grain carries one beat (`ee/DQucioMABeN`, `ee/DcszHOXuFU6`); one colour slate per year (`ee/DYURMKHoayc`); felt or canvas instead of flat vector (`ee/DZuVqDpO0Um`); a red field with tiny figures (`hex/DVL9nizj2HD`); ground colour taken from the subject (`ee/Db-fZK_OO76` (B), `ee/DYgz0USId6P`). Register: ee.

**Vignette or spotlight pool.** ~35% corner darkening (`ee/DcJM47zIj-t`); ~20% (`ee/Dbp5HyyOmsR`); ~15% to keep a white page from feeling digital (`hex/DWG_-c3grGL`); a 60% spot on a cork board (`hex/Da0NQ7eCAnr`); a picture lamp lighting ~20% of the frame (`ee/Dd08TpPONpx`); a lone object on black (`ee/DUiSq11jO4R`). How: `moran/DLQw7mqJzRp`, `moran/DZFqNzwAqVa`, a focus vignette with Compound Blur (`moran/DLShlJxRXZe`).

**Moving window-light shadow.** Blind or leaf shadow bands at ~25–30° across the desk (`ee/DTxZksEDMiQ`, `hex/DYg3NWxiZ7j` slowly moving, `ee/DU-zVUXCD-r`). How: a shadow plate in Multiply with a slow position drift (`moran/DdKZ5oBpPCW`).

**Scanline or CRT texture.** ~2 px scanlines over paper and clips (`hex/DQepYZ4CfSt`); scanlines and grain glue AI images and paper cards (`hex/Dbc-vIXCCqe`); scanline + fringe for a mid-century subject (`ee/DcD4mcfIgey`). How: scan-line layer ~50% Overlay (`moran/DLQw7mqJzRp`); Venetian Blinds (`moran/DaQeqljgc7y`).

**Visible paper ground.** Crumpled, fibre, grid, kraft or newsprint paper even under empty cards (`hex/DaAIlijic8Y`, `pin/350161` (D), `pin/349991` (B)). How: never flat (`moran/DY7TSLJAQef`); one texture per frequency band (`moran/DNuJS_oWoxM`); darken modes on white, lighten on black (`moran/DbBSCjjgbTw`); judge scale against a real object (`moran/DcBhNhOg5kR`); push white to a warm off-white (`moran/Dc1ShYsplyF`).

---

## 9. Cut-out

| Device | Owner | Pieces (findings) |
|---|---|---|
| Halftone B&W cut-out | archivist | 57 (pin 31, hex 14, ee 12) |
| White die-cut rim | art-director | 52 (pin 28, hex 15, ee 9) |
| Torn edge with fibre | art-director | 52 (pin 37, hex 10, ee 5) |
| Soft contact shadow | animator | 47 (hex 24, ee 12, pin 11) |
| Tilted photo print | art-director | 53 (hex 32, ee 14, pin 7) |

**Halftone B&W cut-out.** People and props as B&W halftone or engraving so any source fits: dot ~3 px at 360 w masks upscaling (`hex/DTnEO5KCawE`); engravings throughout (`hex/Dd0qOzpqoYf`); halftone on licensed stills (`ee/DbAnBlpTkUQ`); halftone + die-cut as the whole sticker style (`pin/350003` (D)). How: halftone plate in Overlay, strength by Curves (`moran/DUJWPrqCYGX`); a high-res texture hides a low-res image (`moran/DQpMiV_Cdpr`).

**White die-cut rim.** 3–8 px white sticker edge at 1080 w, constant width: 3–5 px (`pin/350080` (D)); 4–6 (`pin/350003` (D), `ee/DafS1lPu18x`); ~7 (`ee/DSc0jeJjB9u`); 2–3 with a shadow (`hex/DYg3NWxiZ7j`); ~3 px keyline on textured paper (`hex/DXoOsJdiSeU`). Constant width is what makes a set (`pin/350080`); mixed widths read as a pack from mixed sources (`pin/350067` (D), `pin/350087` (D)).

**Torn edge with fibre.** Ragged tear, white fibre rim ~3 px (`pin/350019` (D)); torn pieces with ~4 px gaps (`pin/350137` (D)); torn base, clean person: two materials in one frame (`pin/349960` (D)); a portrait through a torn aperture (`ee/DaAV2R5IuSi`); rough scissor outline ~4 px (`hex/DY4QF50i64w`). Straight clean edges read as pasted (`pin/350121` (D), `pin/350329` (D)).

**Soft contact shadow.** Shadow under each sheet or where pieces touch: 10–20 px offset (`pin/349972` (C)); ~6 px (`pin/349962` (D)); ~15 px offset, ~20 px blur under cards (`hex/DYZBoYQiQBA` (C)); 2–4 px under cut-outs (`hex/DOvNKEtiREq`); the shadow under a curling page sells it (`hex/DX6M6NCCWyE`). None on pure black (`pin/fd62cda1` (D)) or for flat-colour props on a grey print (`hex/Dd0qOzpqoYf`). How: a separate shadow layer under the turning page (`moran/Dafr0KjAkve`).

**Tilted photo print.** Prints and polaroids at 2–15°, overlapping, with a border: ±3–6° (`hex/DNz8oT80j3U`); 2–6° (`hex/DYrYZt3irrR`); 5–15° stacked one per ~0.25 s (`hex/DUiOWpiCare`); 10–15° (`hex/DaFnYhFCvKl`); ~8° rounded tiles on black (`ee/DafS1lPu18x`); 8 px polaroid border with a soft shadow (`hex/DXzqcfMiZ0F`).

---

## 10. Rhythm model for register A

All numbers measured over the 165 register-A pieces unless marked.

| Quantity | Median (p10–p90) | Source |
|---|---|---|
| Duration | 48 s (30–66) | ffprobe |
| Narration speed | 3.0 words/s (2.3–3.4) | asr |
| Average shot length (edit events) | 1.17 s (0.71–2.05); hex 1.00, ee 1.40 | shots.json |
| Events per 10 s | 8.3 (4.7–13.8); hex 9.5, ee 6.9 | shots.json |
| Pooled shot duration | 0.75 s (0.17–2.4); 34% of shots < 0.5 s; 6% ≥ 3 s | shots.json |
| Spoken words per edit event | 3.5 (2.1–5.5) | asr × shots |
| New picture every | ~1.6 s (0.9–3.0), ~4.5 words (2.7–8.3) | frame heuristic `~` |
| Cuts that keep the picture (caption or element change) | ~20% (6–51%) | frame heuristic `~` |
| Longest shot in the piece | 4.6 s (2.9–7.8) | shots.json |
| Camera-still shots | 26% of shots (5–52%) | shots.json |
| Still holds ≥ 4 s | 4 of 165 pieces | shots.json |
| Opening 3 s vs body cut rate | 1.03× | shots.json |
| Last 5 s vs body cut rate | 0.53×; last shot 2.2 s (0.3–5.6) | shots.json |
| Soft transitions | 0.28 per 10 s; none in 75 of 165 pieces | shots.json |
| Soft-event length | ≤ 0.2 s 32%, 0.2–0.6 s 40%, ≥ 0.6 s 28% | shots.json |

The model, in edit terms:

1. **The phrase is the unit.** An edit event every ~3.5 spoken words; a new picture every ~4.5 words (`~`). Inside a picture the caption chunk changes; a new picture comes with a new noun or clause (§1 phrase-lock, caption-motion).
2. **When the picture changes vs when only the caption changes.** The picture changes when the narration introduces a new noun, place, person or number (`ee/DaAV2R5IuSi` "every spoken number or noun gets its own picture"; `hex/DQepYZ4CfSt`; `hex/DPgS8B7CZoY`). Only the caption changes when the clause continues about the same subject, on a talking head, on a dense plate that needs reading time, or when the line itself flips (`hex/DY_8VpvCpeO`, `hex/DcO003cvlUI` (C), `hex/Dd0qOzpqoYf`, `hex/DcG_IX3P3vI` (C)).
3. **Holds.** Most shots are short; the long ones are earned: the key number or conclusion (`hex/DUiOWpiCare` ~2.8 s), the climax card (`hex/DeGwAnTCJqI` (C) 9.2 s), footage that is the evidence (`hex/DdbK-PAT7O6` (C) 8.6 s), detailed plates (`ee/DcJM47zIj-t` ASL 2.1). A held picture always moves (camera or idle loop); still holds of ≥ 4 s occur in 4 of 165 pieces.
4. **How sections breathe.** Bursts of 3–12 sub-second events resolve into a hold (§1 burst-hold); a paper breath card of 0.8–1.5 s every 10–20 s (`hex/DY_8VpvCpeO` 3 in 65 s, `hex/DbnDiSLCtax` 6 in 56 s, `hex/DYy1TUWufoF` 5–7 in 63 s); the ground changes every ~3–6 s (`hex/DZw15OaCDZv`, `hex/DcF_qVxqsaA`); a dissolve or dip only at a time jump, chapter turn or payoff (§3).
5. **Hook and ending.** The hook is in the opening line and its picture; the opening 3 s cut at the body rate. The ending slows to about half the body rate and holds the last card ~2 s.
6. **Camera.** Most shots move: pan, drift, push, pull (push median ×1.14 over ~1.4 s); about half the pieces step the motion at 12 fps; big punches (≥ ×2) are rare accents on the word that names a detail.

---

## 11. What makes a collage look odd (ranked)

Ranked by the number of pieces where a finding shows the tell. Most come from the D stills and from the analysts' "better pieces do X" comparisons, which are interpretive (`~` where noted).

| # | Tell | Pieces | Evidence | Fix |
|---|---|---|---|---|
| 1 | **Pasted cut-out**: no rim or contact shadow, straight clean edge, grain, resolution or colour temperature unlike its neighbours | 12 | `pin/350050`, `pin/350058`, `pin/350099`, `pin/350121`, `pin/350141`, `pin/350315`, `pin/350329`, `pin/350087`, `pin/350067`, `pin/350316`, `pin/350337`, `pin/350033` (mis-scaled hands) | one grain over all layers (`pin/350311`); a contact shadow where parts touch (`pin/350058`); a rim (`pin/350099`); a torn edge on strips (`pin/350121`); tone photos into the palette (`pin/350315`, `pin/350329`); hide style joins under an object (`pin/350069`, `pin/350141`). Moran: crisp edges read digital (`moran/DUEIdzuCUgn`); copy a real reference (`moran/DVd9Ls2gHWM`); perfect collage looks awful (`moran/Dc1ShYsplyF`) |
| 2 | **No focal point**: equal-weight items, even spacing, no empty area | 8 | `pin/350041` (gaps ~0), `pin/350101`, `pin/350112`, `pin/350118` (wallpaper), `pin/350139`, `pin/350072`, `pin/350314`, `pin/349974` | keep 10–20% empty (`pin/350041` `~`); one dominant item (`pin/350101`); one unique bright colour on the focus (`pin/350112`); overlap one element with the hero (`pin/349974`); in motion, reveal a dense layout in layers (`pin/350072`) |
| 3 | **Unreadable type**: too small, low contrast, over faces, a bright sky or a logo | 8 | `hex/DQepYZ4CfSt` (3% on bright sky), `hex/DcO003cvlUI` (C, 2.5% over a moving face), `hex/DOOCNSVCexy` (across eyes), `hex/DPBpZK4CbYi` (numeral over logo), `ee/DZHpNwSob_R` (1.5% key line), `ee/DUGJjUEjO_I` (1% microtext), `ee/Dd08TpPONpx` (2% labels), `pin/350094` (mid-tone) | move to paper or a dark area, or dim the clip; below the chin; key lines larger (the `ee/DZHpNwSob_R` analyst says 8–12% `~`); a band or glow under captions |
| 4 | **Register or style break** without a separator | 8 | `pin/349992` (last 3 shots switch to sepia + sans), `pin/350009` `~`A (dark UI outro), `ee/DcD4mcfIgey` (CTA tonal break), `ee/Db2uSdmoVU0` (C, emoji vs 3D props), `pin/349988` (3D macro vs flat), `pin/350043`, `pin/350307`, `pin/350008` (B, render, not collage) | one object style per scene (`ee/Db2uSdmoVU0`); ≤ 2 styles per piece, each with its own colour world and word cards between (`ee/DcszHOXuFU6`); hard cuts between realism levels (`pin/349988`); keep the CTA in the film's world (`ee/DZXDJ8AuAiU`) |
| 5 | **Low-res or mismatched footage shown raw** | 6 | `ee/DTNgwGAjH7-` (upscaled crop; small 16:9 in black bars), and the fixes seen in `hex/DNNfSWsJ0em`, `hex/DO5lBJLiTni`, `hex/DQepYZ4CfSt` (stepping), `hex/DTnEO5KCawE` (halftone), `hex/DP6L1BqCc0g` (blown edges) | step at 12 fps, halftone or grain it, cover it with type, use it for one beat; one treatment for every clip (`moran/DMOpmHxpAOA`, `moran/DQpMiV_Cdpr`) |
| 6 | **Generated plates drift in style** | 5 | `ee/Dbp5HyyOmsR`, `pin/350031` `~`A, `ee/DdI5hwFuoI6`, `ee/DbAnBlpTkUQ`, `hex/DdOCMfmCbLq` (C) | same grade, grain and halftone on all plates; ≤ 1.5 s per plate (`ee/Dbp5HyyOmsR`); high-contrast greyscale hides artefacts (`hex/DdOCMfmCbLq`) |
| 7 | **Overlap or frame-crop held too long** | 3 | `ee/Dacjr7jNsbG` (works at 0.3 s, not longer), `ee/DausEm8OxlC` (B only), `ee/DcijzMlOiKS` (crop only in the first 2–3 frames of an entrance) | overlaps only on sub-second beats; every final hold inside a safe margin (~60 px at 1080 w, `ee/DcijzMlOiKS`) |
| 8 | **Dead hold** | 1 (+4 measured) | `pin/349989` (B, 8 s identical frames); measured still holds ≥ 4 s in `hex/DZrkiVFCxe5`, `hex/DSA2Hs3k06k`, `hex/DY_8VpvCpeO`, `hex/DWG_-c3grGL` | 1–3% drift or an idle loop (`pin/349989`); a still is a slideshow (`moran/DZsDDmvtNJP`) |
| 9 | **Production leftovers** | 2 | `hex/DWG_-c3grGL` (getty watermark on stock), `ee/DbVMvRvMboX` (After Effects UI left in) | reviewer frame check |
| 10 | **Floating labels** with no tie to their object | 1 | `ee/Dd08TpPONpx` (2% labels at the frame edge) | a leader line or arrow from label to object (`hex/DNfiewopHaL`, `hex/DZE-78dC_Xr`, `hex/DdDvS3ZC1gg`) |

Moran-only tells (technique; not observable in this evidence): texture strength set by opacity (`moran/DL24UePpHWN`); two textures in one frequency band (`moran/DNuJS_oWoxM`); overcooked grain (`moran/DMWEwQRp6aD`); texture scaled down until it exposes the edge (`moran/DcBhNhOg5kR`); more than one text animation at once (`moran/DLTLw1DpgwE`, partly contradicted below); pure #000/#FFF text (`moran/DOMfGIfCbuQ`).

---

## 12. Where the evidence contradicts Moran

| # | Moran lesson | Evidence | Verdict |
|---|---|---|---|
| 1 | Cutting on stillness feels jarring; cut on action (`moran/DOb0h6VCSpM`) | A: 26% of shots have no camera move and cuts land on phrase boundaries; fast montages hold the camera and let the cut do the work (`hex/DXUEoamgkj5`, `hex/DcViZM2ouct` (B), `hex/DUiOWpiCare`); hard cuts on the beat of the next word (`hex/DN-WcdHiZCs`) | **Contradicted for narrated collage**: the voice, not motion, covers the cut; in a calm register Moran's still-frame cut is the right test |
| 2 | Punch in and out 1×↔2× "a lot" (`moran/DOb0h6VCSpM`) | push ≥ ×2.0 is 3% of push-ins and appears in 29/165 A pieces; push median ×1.14 | **Contradicted as a habit**; true as a rare accent |
| 3 | Vox style = Posterize Time 12 fps (`moran/DLQ4Wp9pqv3`, `moran/DaDhDFjAysT`) | ≥ 25% stepped shots in 91/165 A pieces; hex 63/106 but ee 23/51 (ee median 9%) | **Partial**: a hex house style, not the genre rule |
| 4 | Speed curve as a spike in the middle; long 1–2 s eases (`moran/DPcvDgNDNM4`, `moran/DLQ4Wp9pqv3`) | 45% of moves peak in their first quarter, 33% mid, 23% late; push shots 1.4 s (0.4–3.4) | **Partial**: front-loaded ease-out is the most common single shape; mid-peak is common too; Moran's long bell (Z2) is the calm shape, his spike (Z3) the excitement shape |
| 5 | Only one text animation at a time (`moran/DLTLw1DpgwE`) | big stressed words over a running 3% sentence caption (`ee/DYURMKHoayc`); giant words while tiny captions run elsewhere (`hex/DdTK_skvNta` (C)) | **Partial**: two text layers coexist when they have distinct roles (emphasis vs reading) |
| 6 | Never solid colours; map everything to a texture (`moran/DLQ4Wp9pqv3`) | flat colour slates and grounds in ee (`ee/DaU3XslOTOa`, `ee/DYURMKHoayc`, `ee/DausEm8OxlC` (B)) and hex (`hex/DVL9nizj2HD`), usually with grain (`ee/DQucioMABeN`, `ee/DcszHOXuFU6`) | **Partial**: flat fields are used; grain keeps them from reading as vector |
| 7 | Captions as uppercase 1–4 words in a red pill / uppercase subtitles (`moran/DL24UePpHWN`, `moran/DY7TSLJAQef`) | the dominant register-A caption is a small lowercase serif, often italic, with no box (58 pieces, hex 47); ee uses condensed caps (22) | **Register-dependent**: Moran's caption is not the collage-explainer caption |
| 8 | Never pure #000 / #FFF (text colours, `moran/DOMfGIfCbuQ`) | grounds: 40/165 A pieces show ≥ 20% pure black (≤ 8) in ≥ 10% of shots, 37 pure white (≥ 247) | **Untested for text**; pure black and white grounds are common |

Also against our own `research/craft.md` (not Moran): body caption cap height "≥ 4% of frame height" (craft §2.5) vs 2.5–3.5% measured in the register-A caption (§7); "hook inside the first 1.0–1.5 s" holds for the line, but no piece front-loads its cutting (opening ratio 1.03).

---

## 13. Role map

| Role | Owns (devices) |
|---|---|
| **Writer** | opening-line formula; the one line on each breath card and word card; the number sequence for count-in-steps; one new noun per clause, so the picture has something to change on (`~` from §10.2) |
| **Director** | register choice; phrase-locked cut (pace); burst-then-hold (where the long holds go); decelerating ending; hard cut as default; dissolve reserved for time, mood, payoff; palette flip at the structural turns; one-word-per-card beats |
| **Storyboard** | one prop per phrase; breath-card placement; punch-in to the named detail; pull-out reveal; into the screen or frame; vertical move; match cut on shape or object; container opens; multiply into a crowd; position-locked swap; evidence board; grid or mosaic; scale contrast; reuse one plate or asset |
| **Art director** | top-down desk camera; ground swap per beat; one hero on a quiet ground; footage on a paper mat; desk stage; disc stage; frame in frame; clear centre; the caption system (serif caption, size jump, highlighter, name tag, numeral hero, script voice, ground rule, condensed stack); every colour and texture device; tint wash; die-cut rim; torn edge; tilted print |
| **Archivist** | document as proof (real clippings, headlines, screenshots); halftone or engraving sources; footage and stills that can survive a 12 fps step and a halftone; plates for mosaics and multiplied crowds |
| **Animator** | caption as the motion; count in steps; flash train; never-static still; stepped motion; snap-settle; parallax; flash, blur, paper-wipe, iris and glitch transitions; stagger, drop-settle, hand, document slide, typed, overshoot entrances; draw-on; data that performs; idle life; pose swap; shape morph; type interleaved with the subject; echo stack; contact shadows |
| **Sound** | **gap** in this study: no finding measured sound (measured since in `research/sound-grammar.md`). Moran-only: tactile paper, marker, camera SFX on entrances (`moran/DLR8e0NuUh9`); marimba or pizzicato bed kept below ~1 kHz under the voice (`moran/DLnuz5ZJ6Ys`, `moran/DecbrespqWe`); `~` a sound on stamps, flash trains and draw-ons, since those are the percussive beats here |
| **Reviewer** | the odd-tell table (§11) and measured gates from §10 (`~` as thresholds): ASL within 0.7–2.1 s; no still hold ≥ 4 s; last 5 s slower than the body; captions ≥ 2.5% cap height and never over faces; one accent hue; no watermark or UI leftovers; every label tied to its object |
