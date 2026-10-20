# Worked example (project-agnostic, illustrative numbers)

A 48 s narrated 9:16 film, 14 beats, 150 words, one structure turn at b09 (palette flip, from the pace plan), one dissolve at b13, ending hold 1.2 s after the last word. `cues.auto.json` has 31 landings.

## 1. Speech map and landings

Pauses of 0.3 s or more: 13 (the film's own breath cards and phrase ends). The per-beat table shows: b02 key x14 (a typed line), b04 `paper-place`, b05 stamp, b07 `marker`, b08 `paper-slide` x2, b09 flip, b10 `punch-in`, b11 burst of eight cuts, b12 hold, b13 dissolve, b14 end.

## 2. Picks (`device-playbook.md` §3)

| Beat | Device | Decision |
|---|---|---|
| b02 | Typed entrance | one `burst`, `len` 1.2 (14 keys become 1 cue) |
| b04, b08 | Drop and settle; Document slides in | silence: not percussive, and the window is for b05 |
| b05 | Overshoot pop (stamp) | `stamp` at contact, 2 frames early; onset lands in the pause |
| b07 | Draw-on | silence: the mark underlines a word that is not the film's claim |
| b09 | Palette flip | bed change (below); one `thud-soft` on the first picture |
| b10 | Punch-in | `whoosh` peak on arrival (the film's first of two punches) |
| b11-b12 | Burst, then hold | `riser` 2.6 s through the burst, `impact` on the hold's first frame: a pair |
| b13 | Dissolve | silence |
| b14 | Decelerating ending | bed fade only |

Result: 6 cues in 48 s, inside the pros' median-to-p90 (2 to about 6): `burst` 4.2, `stamp` 13.8, `thud-soft` 28.1, `whoosh` 31.0, `riser` 34.0, `impact` 36.6. The busiest 4 s window ends on the riser (31.0 and 34.0) and again on the impact (34.0 and 36.6): two cues each, so `NORMS.audio.maxSfxPer4s` holds with nothing to spare; a seventh cue between 31 and 38 s would be red M4.

## 3. Under a word

The span check reports: `stamp` in a pause; `whoosh` leads in 0.45 s before its peak, over the word "ship" (M5); `riser` runs under five words (M5, by design: a riser is bed-like); `impact` in a pause. The picture is locked, so the whoosh keeps its arrival frame. `sound.md` lines for both: `--report` p90 under speech -16.8 dB, limit -`SFX_BELOW_VOICE` (12): kept. Had the p90 read -9 dB, the whoosh `gain` would drop until it cleared, or the cue would go.

## 4. Bed

One pizzicato-and-pad track, licence recorded; `equalizer` dip at the voice band (`~` -3 dB). Sections: 0-24 s texture A, 24-48 s texture B, the change in the pause before b09's first picture; `--fade-out 0.3`, the last word ends 1.2 s before the end, so the bed finishes 0.3 s into the hold and the last card is quiet (the pros hold 0.5 s median, 1.65 s at p90).

## 5. Mix

`mix.mjs … --fade-out 0.3 --report`:

```
voice speech level -22.1 dBFS
music re voice: -19.0 dB mean under speech (p90 -17.5), -12.8 dB in the gaps
sfx re voice: -31.2 dB mean under speech (p90 -16.8), -13.0 dB in the gaps
```

Gaps -12.8 dB: inside -7 to -19. Gate: M2 -14.0 LUFS, M3 LRA 2.4, M4 none, M5 two (both lined in `sound.md`), M6 none: PASS.

## 6. The client asks for "a whoosh on every cut and a hit on every important word"

Reply in two lines: the pros carry a cue on about 1 in 45 picture events and keep the bed steady under the voice; the punch comes from the master level, the bed turn at b09, and the pair at b11-b12. Offer one more accent on the reveal, never one per cut. Keep the list.
