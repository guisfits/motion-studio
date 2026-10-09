# Sound for the editorial explainer

Legend: **[S]** sourced · **[M]** measured in the 28-reel reference studies (`inspirations/`) (EBU R128, per-50 ms RMS split by
Whisper speech segments, onset counts) · **[I]** inference.

## 1. Voice first

- Narration is present from frame 0 to the last word in 24 of 24 reels; no silence > 0.4 s at
  -35 dB in 23 of 24 [M]. The voice *is* the timeline; every visual beat is cut to a word.
- Level: speech mean ≈ -20 dBFS RMS, p95 ≈ -10; 1 s RMS stays inside a 3–5 dB window for the whole
  reel; nothing ever peaks above the voice [M].
- Intelligibility is the only test that matters: Whisper transcribed every reference reel without
  one wrong word through the busiest stretches, so nothing masked speech [M]. Fong lowers music that
  "competes with the narration's pitch" and avoids maximalist tracks [S].
- Treatment: clean noise/hum, compress to even out, EQ for clarity; the voice "front and centre"
  [S IRPR, general guides]. Check on a phone speaker and cheap earbuds, which is how most viewers
  listen [S].
- Delivery: calm, one take, consistent; "you can't afford to be too clever" in VO [S Fong].

## 2. Music bed

| Parameter | Norm | Evidence |
|---|---|---|
| Presence | continuous low bed (earn.edits) **or none at all** (chrismoran: digital silence -48 dB in the gaps) | [M]; third-party Vox pipelines default music *off* [S Korpi] |
| Level under voice | music ≥ 10 LU below commentary; ambience ≥ 15 LU below (22-listener AES/Salford study, Torcoli et al. 2019); non-experts prefer 4 LU more separation than experts | [S AES] |
| Practical ducking | 15–20 dB under during speech (practitioner guides), 15–25 dB "common starting point" | [S] |
| Ducking timing | start the dip 0–1.1 s before the first word; attack 10–30 ms; release 200–500 ms; a ~0.2 s ramp is "the workhorse" | [S openclip, ducking guide] |
| Structure | Vox long-form changes track about every 20 s; starts/endings are attention and emotional cues; a reflective cue lands the reveal | [S Fong] |
| Ending | bed drops 3–5 dB in the last second under the CTA, no stinger | [M earn.edits yur -19, d08 -21 dBFS last second] |
| Character | not busy, not in the voice's pitch range; "a full day" to find and trim per video | [S Fong] |

In short form the bed is a floor, never a layer the viewer notices [M]. The classic complaint,
"a racket, I can't understand anything", is the failure mode: music + SFX stacked at voice level.

## 3. SFX design and density

- **Density**: ~1 per 6 s (Zhylin: ~10 transients in 62 s); low-band hits 4.8–11.7 per 10 s in
  earn.edits A (includes music); chrismoran nil to sparse, undetectable under the voice [M].
  Default: **≤ 1 SFX per 4–6 s, and only on a cut, a card or a mark landing** [M; I].
- **Placement**: SFX ride the visual event (card in, ring wipe, number tick, arrow draw, camera
  click on a match cut, "old camera/projector" sound on a slide-in) [S Motion Array; M Zhylin],
  never on a spoken emphasis and never in a voice gap to "fill" it [M].
- **Level**: guides start SFX about 6 dB under dialogue (narration > SFX > music) [S, provenance
  unclear]; that is too hot for a phone speaker. Default: a typical hit **12 dB under the speech**,
  plus a sidechain duck while the voice talks (≈ 22 dB under during words) [I; engine mix].
- **Vocabulary** (paper world): paper slide / drop, page turn, tape rip, pencil scribble for the
  arrow/circle, light tick for word builds, soft whoosh for a ground swap, camera click for a
  match cut, counter tick. One family per film; no cinematic booms, no UI bleeps [I from M].
- **Length**: short (≤ 300 ms transients), low, tied to the cut; never a layer of its own [M].
- Zero SFX stacked on top of each other; zero SFX on a spoken number [M].

## 4. Mixing numbers

| Quantity | Target | Evidence |
|---|---|---|
| Integrated loudness | -14 LUFS (±1); every reference reel measured -14.1 to -15.0 | [M 24/24]; -14 to -16 for web [S IRPR]; -14 YouTube normalisation [S] |
| Loudness range (LRA) | ≤ 3 LU (earn.edits 1.1–2.6; chrismoran 2.3–4.6) | [M] |
| True peak | ≤ -1 dBTP | [S] |
| 1 s RMS window | ≤ 5 dB spread across the film | [M] |
| Music under voice | ≥ 10 LU (floor); 15–20 dB typical | [S AES; guides] |
| Ambience under voice | ≥ 15 LU | [S AES] |
| SFX under voice | 12 dB in gaps, ≈ 22 dB under words (sidechain) | [S weak for 6 dB; I] |
| Voice coverage | 90–100 % of runtime; gaps only at the very end | [M] |
| Final step | loudness normalisation (e.g. `loudnorm`) *last* in the chain | [S] |

Build order (a studio's 5-layer framework): dialogue → foley → ambience → music → final mix; lock
picture first; confirm the format and loudness target at the start [S IRPR].

## 5. Sync to motion

- Every SFX is a cue emitted by the visual component that moves (card, arrow, counter), so
  sound and picture cannot drift [engine contract: components emit their own cues; consistent with M].
- Word-level timing: visual beats land on the word (word-level timing from the aligned voice), captions chunk on the phrase;
  the voice never waits for the picture [M].
- Camera click exactly on each match-cut frame; slide-in sound starting on frame 0 of the slide
  [S Motion Array].
- Music starts/ends on structural beats (turn, payoff, CTA), not on arbitrary bars [S Fong].

## 6. Silence

- Measured reels have essentially none: the closest thing to silence is the calm closing beat
  where the voice says one sentence over a plain ground and the bed sits low [M eg9].
- Silence is a tool for the reveal in long-form (Fong's reflective cue), not for short form, where
  a 0.4 s gap reads as a dropout [M; I].
- Pauses live inside the voice ("That's right.") as absorption time, not as dead air [S Fong].

## 7. Common defects and the fix

| Heard | Cause | Fix |
|---|---|---|
| "Too loud, overlapping" | SFX stacked, at voice level | one SFX per event, 12 dB under the voice + duck, ≤ 1 per 4–6 s |
| Voice buried on phone | music in the 1–4 kHz band at -8 dB | duck ≥ 15 dB, EQ a dip in the voice band, check on phone |
| Pumping bed | sidechain release too short | release 200–500 ms, or hand-automate |
| Dead air at cuts | voice edited with gaps | tighten to ≤ 0.3 s; the voice is continuous |
| Stinger at the end | designed outro habit | drop the bed 3–5 dB under the CTA, hard cut after the last word |
| Loudness mismatch between films | normalised per clip, not per film | -14 LUFS integrated, LRA ≤ 3, loudnorm last |
