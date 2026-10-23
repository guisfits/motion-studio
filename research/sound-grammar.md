# Sound grammar of the editorial-collage film

Date: 2026-10-15. Evidence base: the audio of 201 finished pieces (203 with media minus 2 silent loops), measured by script, not by ear: 165 register A, 18 B, 18 C (registers as in `research/editing-grammar.md` §0). Sources: `hex` (@hex_creatives), `ee` (@earn.edits), `pin` (Pinterest board). This file is the knowledge base the sound role is written from. It states what was measured, how sure the number is, and what the measurement cannot see. It does not change `tools/checks/norms.mjs`.

Citations as in the editing grammar: `hex/DUQRqS2icUB`, `ee/DaAV2R5IuSi`, `pin/350048` = pin `7359867641573` + last 6 digits. `(B)`, `(C)` after an id = not register A. **Measured** = computed from the audio and the shot lists. `~` = inference.

## Answers

1. **`NORMS.audio.maxSfxPer4s = 1`: consistent as an average, tighter than the pros at their busiest.** Salient cues in register A average **0.25 per 4 s** per piece (median 0.15, p90 0.61); counting every transient the detector sees, voice consonants included, the ceiling is 2.0 per 4 s (median 1.75), so the true figure sits between. 82% of pieces have at least one cue; the median piece has 2 in 48 s. A 4 s window holds more than one cue in 4% of windows (p90 of pieces 13%); in 36% of pieces at least one sliding 4 s window holds 2 or more (p90 of pieces: 3, max 4), mostly a riser plus its hit, or a burst of cuts with hits. A per-window cap of 1 would fail about one piece in three of the pros; an average cap near 0.3-0.6 per 4 s matches them.
2. **"No SFX on a spoken word": not confirmed and not refuted by the numbers.** Inside words the detector can only see a cue that is louder than 99% of the voice's own consonant transients in that piece. Such cues exist at 0.16 per 4 s of speech, which is about the false-positive floor of the voice itself (188 expected from voice alone, 288 observed over 6 622 s of speech). In voice-free time the same test gives 0.06 per 4 s. So the pros' cues are quieter than the voice's loudest consonants, or sit in pauses; where they sit on a word cannot be read. Two facts bear on the rule: only about 2% of picture events (212 of 9 595) carry a salient cue within ±2 frames, so cut-synced SFX are the exception, not the technique; and 20 of 165 pieces (12%) show a clear excess of loud transients inside word spans (§4.5), so some pros do put cues on speech.
3. **Ship level: -14.1 LUFS.** 95.8% of register A is within ±1 LU of -14 (hex 97%, ee 100%), 89% within ±0.5. Median LRA **2.5 LU** (p10-p90 1.8-4.5); 67% are at or under 3. True peak median -0.5 dBTP, above 0 dBTP in 25%. The sameness (p90 equals the median to 0.1 LU) is the signature of platform loudness normalisation on Instagram, so this says "what the platform ships", not "what the mixer chose"; the 8 `pin` A pieces, which did not pass through it, vary (median -15.5, p10 -25.9).
4. **The bed is static and low, not sidechained.** A non-voice floor runs through the pauses in 98% of pieces at a median -30.1 dBFS against a voice at -17.4 dBFS: the voice sits **12.1 dB** above it (p10-p90 7.1-18.7). The floor does not swell in pauses (median +0.1 dB late vs mid pause), and the side channel and the 30-70 Hz band are as loud under speech as in pauses. Ducking depth cannot be measured cleanly without stems (§3.2); the evidence points to a fixed bed 12 dB under the voice, with a sidechain-like swell in about 15% of pieces.

## Method and limits

1. **Pieces.** The register labels of the grammar synthesis (`pieces.json`: A 165, plus B 18 and C 18 for contrast); 114 still posters (D), 2 pieces without media and the duplicates are out. Audio decoded to 22.05 kHz stereo; loudness from the original file.
2. **Loudness.** `ffmpeg ebur128=peak=true`: integrated LUFS, LRA, true peak.
3. **Speech map.** Whisper `ggml-small`, word times with `-ml 1 -sow`. Whisper stretches a word over the pause that follows it, so each word is trimmed to the frames where the 300-3400 Hz band is within 14 dB of the piece's voice level (kept 98% of words). Pauses are gaps of at least 0.3 s between trimmed words. Words per second = words / (last word end - first word start): median **2.95** (p10-p90 2.2-3.4), the same as the grammar's 3.0.
4. **Bed level.** Frame RMS (23 ms hop). *Bed in pauses* = median RMS over the inner part (0.08 s trimmed each side) of pauses of 0.5 s or more; *voice* = median RMS inside trimmed words. What the pause floor contains is bed plus the tail of the voice and room; the median level drop from just after the voice to mid-pause is 2.9 dB, so the floor is mostly a steady bed and not a decaying tail.
5. **Bed changes.** Min-statistics profile (20th percentile per mel band over 1 s windows, mid and side, 48 values); novelty = mean absolute dB difference between the 2 s before and after; a change point is a novelty peak of 10 dB or more, at least 2 s apart. Checked against `ee/DaAV2R5IuSi`, where the spectrogram shows a bed entering near 9.3 s, a riser from 26.3 s and its end near 29.8 s: change points at 9.5, 27.0 and 30.5 s.
6. **SFX detector.** Onset strength (log-spectral flux, percussive part of an HPSS split) in bands that avoid the voice, robust z-scored per piece (median and MAD): the **side channel (L-R) 4-10 kHz**, where the centred voice cancels, gated to events whose side energy is within 9 dB of the mid energy (a wide transient); the **mid 30-120 Hz** band for centred thuds; **mid 4-10 kHz** only outside words. Side 30-120 Hz is bass and kick of the bed and is never counted. Events need z of 12 or more, are merged within 0.12 s, and trains of 4 or more with a steady interval (CV below 0.15, 0.2-1.0 s) are dropped as music pulse. Outside words an event also has to be audible (peak at -50 dBFS or more) and rise 3 dB over the preceding 300-100 ms; events farther than 1.5 s from any word (music-only passages) are not counted. **Inside words** an event must beat the 99th percentile of that piece's own voice transients, measured on peaks inside words and more than 0.3 s from a picture event. Events within 0.12 s outside a word edge are ambiguous and not counted. Classes: (a) inside a word (trimmed span ±0.05 s, the `sfxWordMarginS` of the norms), (b) in a gap, (c) on a picture event (within ±2 frames of the 12 fps shot grid, 0.167 s, of a `shots.json` boundary or soft-transition start or end).
7. **Validation by spectrogram** (three pieces, ten seconds each, onsets marked on mid and side spectrograms with word spans and picture events): `hex/DUQRqS2icUB` 53-63 s, `ee/DaAV2R5IuSi` 2-12 s, `pin/350048` 7-17 s. The first pass of the detector marked every consonant (side HF z over 12 about 1.6 per second, the voice itself is partly stereo-wide in most pieces) and, on the near-mono `pin/350048`, noise-floor ghosts (z over 280 000 on an empty side channel). The audibility test, the in-word voice threshold, the exclusion of side bass and the pulse filter came from that. After tuning, the markers sit on visible broadband vertical transients and on the start and end of a noise riser (`hex/DUQRqS2icUB` 57.5 and 59.8 s), and none sit on empty channels. I cannot listen: a transient that looks like a cue may be a voice consonant, and a quiet cue under speech is invisible.
8. **Sensitivity.** Three settings of the in-word rule: strict (voice p99, the figures below), p95, and none (every z of 12 or more; mostly voice). Strict is the number to quote; none is the ceiling.
9. **Not measured.** Whether the bed is music or ambience (only indirect: narrow tonal peaks in the pause spectrum in 61% of pieces with a long pause, pulse trains in 24%, tonal rails and beats visible in the validation spectrograms); stems; quiet cues under speech; tonal pings (a 6.7 kHz tone at 8.7-9.4 s in `ee/DeB2BnjOvHp` is visible in both channels and is not a transient, so it is not counted).

Scripts and per-piece JSON are in the session scratchpad (`.../scratchpad/sound/`), not in the repository.

## 0. Pieces measured

| Register | n | Notes |
|---|---|---|
| **A** | 165 | hex 106, ee 51, pin 8 (one is 1:1) |
| B | 18 | music-led or lyrics; 2 more are silent loops with no audio track |
| C | 18 | narrated 16:9 |

## 1. Loudness

| | LUFS median (p10-p90) | within ±1 of -14 | LRA median (p10-p90) | LRA at most 3 | True peak median (p10-p90) dBTP | TP above 0 |
|---|---|---|---|---|---|---|
| **A** | -14.1 (-14.6 to -14.1) | 95.8% | 2.5 (1.8-4.5) | 67% | -0.5 (-2.0 to +0.7) | 25% |
| A hex | -14.1 (-14.6 to -14.1) | 97% | 2.8 (1.9-4.5) | 59% | -0.5 (-1.9 to +0.4) | 22% |
| A ee | -14.1 (-14.2 to -14.1) | 100% | 2.1 (1.6-3.3) | 84% | -0.3 (-1.3 to +0.9) | 33% |
| A pin (n 8) | -15.5 (-25.9 to -14.2) | 50% | 3.9 (1.9-7.3) | 50% | -2.5 (-9.6 to -0.2) | 13% |
| C | -14.2 (-20.7 to -14.1) | 72% | 2.7 (1.8-5.1) | 56% | -1.5 (-5.9 to +1.2) | 22% |
| B | -17.0 (-70 to -13.7) | 50% | 1.1 (0-5.0) | 78% | -4.8 | 6% |

Loudest outliers in A: `pin/350048` -21.6, `pin/349992` -33.7 (very quiet, voice at -35.8 dBFS), `pin/350020` -22.5; LRA over 6: `ee/DeWa3ljOu2j` 10.5 (a 10 s music intro before the narration), `hex/DSA2Hs3k06k` 8.7, `pin/350010` 8.8.

## 2. Speech map

| A | median (p10-p90) |
|---|---|
| Words per second | 2.95 (2.2-3.4); hex 3.1, ee 2.5 |
| Speech coverage inside first-to-last word | 89% (80-96) |
| Pauses of 0.3 s or more | 1.3 per 10 s (0.2-3.0); 1 155 pauses pooled |
| Pause length | 0.42 s median, p90 0.67 s; 16% are 0.6 s or longer |
| First word | 0.08 s after the start (p90 0.19 s); 94% within 0.2 s; 4 pieces have 0.5 s or more of pre-roll (`ee/DeWa3ljOu2j` 2.1 s and a music-only stretch of 3.3-13.0 s, `hex/DUiOWpiCare` 1.8 s, `pin/350048` 0.7 s, `pin/349988` 0.6 s) |
| Last word to the end | 0.5 s (0.09-1.65); 25% hold 1 s or more, 4% hold 2 s or more (`ee/DdI5hwFuoI6` 5.8 s) |

## 3. The bed

### 3.1 Present, and how loud

| A | median (p10-p90) |
|---|---|
| Voice level | -17.4 dBFS (-19.7 to -16.8) |
| Bed floor in pauses of 0.5 s or more | **-30.1 dBFS (-37.1 to -24.8)**; hex -30.2, ee -29.6 |
| Voice over the bed floor | **12.1 dB (7.1-18.7)**; 7% of pieces are at 6 dB or less, 41% at 6-12, 41% at 12-18, 11% above 18 |
| Pieces with a floor of -50 dBFS or more in pauses | **98%** (151 with a pause); no floor in `pin/350048`, `pin/349988`, `hex/DYMUSnRiNbV` |
| Narrow tonal peaks in the pause spectrum (3 or more) | 61% of the 92 pieces with a pause of 0.5 s or more |
| Rhythmic pulse train (0.15 per s or more) | 24% of pieces; at 0.5 per s or more: `pin/349988`, `hex/DX6M6NCCWyE`, `ee/DZuVqDpO0Um` |
| Side-channel bass onsets (z of 12 or more) | 0.6 per s median (0-3.8): kick and bass of a bed with a beat |

### 3.2 Ducking: what can and cannot be said

The finished mix has no stems, so the bed under the voice is not directly measurable. Four estimates, all biased the same way (voice leaks into every band), so none proves ducking:

| Estimate | A median (p10-p90) | Reads as |
|---|---|---|
| Voice minus bed floor in pauses | 12.1 dB (7.1-18.7) | the bed is at most this far under the voice if it is not released in pauses |
| Late-pause minus mid-pause level (release swell) | +0.1 dB (-3.7 to +3.6); 15% of pieces at +3 dB or more, 8% at +6 or more | a bed that rises when the voice stops is ducked; the median bed does not rise |
| Side-channel level, pauses minus speech | -0.4 dB (-7.5 to +2.2) | same level with and without the voice |
| 30-70 Hz level, pauses minus speech | -2.9 dB (-16.6 to +5.0) | the voice-free band is not quieter under speech |
| Per-bin minimum statistics, pauses minus speech | -8.0 dB (-18.6 to -2.3) | negative = voice dominates every bin; unusable as a depth |

Reading: the typical piece has a **fixed bed about 12 dB under the voice**, not a sidechain; a minority (about 15%) release the bed in pauses by 3 dB or more (7 of them at 6 dB or more: `hex/DXEP5DogtTK`, `ee/DUZvCOriq0d`, `hex/DXOey6vghtu`, `hex/DSA2Hs3k06k`, `ee/Da2XkSfOy7h`, `hex/DX6M6NCCWyE`, `hex/DUQRqS2icUB`). The depth of a sidechain, where there is one, is not resolved.

### 3.3 Start and stop against the words

- **Start.** The bed is already there with the first word (first word at 0.08 s): 97.6% of pieces start the voice within 0.5 s, so there is no pre-roll. The four exceptions: `ee/DeWa3ljOu2j` (first word at 2.1 s, then music alone from 3.3 s to 13.0 s), `hex/DUiOWpiCare` (1.8 s), `pin/350048`, `pin/349988`.
- **Stop.** The bed runs through the last word and ends within the outro: level above the pause floor for 0.23 s (p10-p90 0.05-1.05) after the last word. In the last 0.25 s the level is within 6 dB of the pause floor in 44% of pieces (the bed holds to the cut) and at least 12 dB under it in 46% (a fade-out of 0.2-0.5 s). There is no standing music tail: 4% of pieces have 2 s or more after the last word.

### 3.4 Does the bed change

Yes, at section scale: **4.1 change points per minute** (p10-p90 0-11.2; 85% of pieces have one or more; 619 in total over A), spread evenly through the body (the first and last 2.5 s are blind to the method). Against the picture:

- The cut rate in the 4 s after a change point minus the 4 s before has a median of 0 (p10-p90 -4 to +3): a bed change does not mark a rhythm change.
- 29% fall within 0.75 s of a pause against 21% by chance: a slight pull to phrase boundaries, no more.
- Example with a visible event: `ee/DaAV2R5IuSi` 26-30 s, a wide noise build with a bass pulse (z of 100-400 on side bass onsets, about 5 per s) that ends near 29.8 s, after a run of 8 picture events in 2 s at 22-24 s; the picture does not change at the bed change itself.

## 4. SFX and transients

### 4.1 Rate per 4 s window (strict detector)

| A | median of pieces (p10-p90) |
|---|---|
| Cues per piece | 2 (0-6); 2.6 pooled (436 cues over 7 866 s of audio) |
| Mean per 4 s window | **0.15 (0-0.61)**; mean of pieces 0.25; hex 0.12, ee 0.27 |
| p90 of the 4 s windows of a piece | 0.7 (0-1.6) |
| Max of the 4 s windows of a piece | 1 (0-2); max 4 |
| Share of 4 s windows with more than 1 cue | mean 4%; p90 of pieces 13% |
| Pieces with a sliding 4 s window of 2 or more | 36%; p90 of pieces 3 cues in a window |
| Pieces with at least one cue | 82% |
| Gaps between consecutive cues under 4 s | 46% (cues come in clusters) |
| Same measure at voice p95 / no voice rule | mean per 4 s 0.31 / 1.75 (median of pieces); the second is mostly voice |
| Cues by channel | wide 4-10 kHz 334, centred 30-120 Hz 73, mid 4-10 kHz in gaps 29 |

Register B: 0.21 per 4 s (p10-p90 0-1.5, max 2.8), clusters up to 7 in a window. Register C: 0.14 (0-0.5).

### 4.2 Picture events

- **48.6%** of strict cues sit within ±2 frames of a picture event against **30%** by chance (the share of time inside those windows); 2.2% of picture events carry a cue. Without the voice rule the share is 35%, which is chance: the voice is the source there.
- In voice-free zones only: 51% against 39% by chance, 148 cues.
- Per-cut test (cut vs word onsets with no cut within 0.3 s, per piece): 14% of cuts have a wide HF transient above the voice's 90th percentile against 10% of the control; excess **about 2%** of cuts per piece (p10-p90 -8% to +22%). Mean cut-triggered envelope against the same control (162 pieces, dB over the piece median): side 4-10 kHz **+2.4 to +2.9 dB** from 0.15 s before to 0.05 s after the cut; 30-120 Hz **+1.1 to +1.4 dB** from 0 to +0.3 s; mid 4-10 kHz -2.8 dB at 0.15 s before the cut (the pause that precedes the cut) and +2 dB at +0.3-0.5 s (the next word).
- Reading: a hit or wide burst on the cut and a soft thud just after exist, as an average of a few cuts in a hundred; the sound does not follow the picture event by default.

### 4.3 Level against the voice

Voice-free cues peak at **-3.3 dB** against the narration level (p10-p90 -11.2 to +3.8), measured as the loudest 150 ms RMS of the mix after onset: loud, about as loud as the voice, and measured over the bed.

### 4.4 Share overlapping words

| | cues | inside a word | note |
|---|---|---|---|
| Strict, as detected | 436 | 66% (288) | 188 inside-word cues are expected from voice false positives alone (1% of 18 800 voice transient peaks) |
| Excess over that floor | about 100 in-word + 148 in gaps | about 40% | at the voice p99, 0.16 per 4 s of word time against 0.06 per 4 s of gap time |
| None (every z of 12 or more) | 3 853 | 96% | voice |

So 66% is an upper bound and about 40% a corrected estimate; the detector cannot tell the voice from a cue of the voice's loudness, and so the overlap with words cannot be resolved to better than "somewhere between a third and two thirds of the loud cues, and the loud ones are rare".

### 4.5 Pieces where cues sit on speech

Excess of loud in-word transients over the voice floor of 3 or more in 20 of 165 pieces: `ee/DeB2BnjOvHp` (9 over 27 s), `hex/DUiOWpiCare` (8), `hex/DZ1_nI7iEd8` (8), `hex/DX6M6NCCWyE` (7), `ee/DSc0jeJjB9u` (6), `hex/DS7XD63iZUU`, `hex/DZPNofjiwVE`, `ee/DaAV2R5IuSi`, `ee/DU-zVUXCD-r`. Cues in the pauses and outro are densest in `hex/DU3hTiOk2-M` (8), `ee/DeWa3ljOu2j` (7, music-led, so some are music hits), `hex/DSaCpvuCcD3` and `hex/DSA2Hs3k06k` (5 each), `ee/DZC3QoBoN_B` and `hex/DNz8oT80j3U` (4 each). Highest rates per 4 s: `ee/DeB2BnjOvHp` 1.63, `hex/DUiOWpiCare` 1.14, `ee/DT-tehKDNRH` 1.02.

## 5. Silence and pauses

- **No dropout in the bed.** Digital silence (below -60 dBFS for 0.3 s or more) occurs in 24 of 165 pieces (15%), 32 times: **19 at the very end** (the render stops after the voice), 2 at the start, **11 mid-piece in 7 pieces**: two of them have no bed at all (`pin/350048`, `hex/DYMUSnRiNbV`), five keep one and drop it once (`hex/DTnEO5KCawE`, `pin/350010`, `hex/Dcf2oQWiwqU`, `hex/DTC-mtEiT3S`, `hex/DUiOWpiCare`). Median length 0.56 s; none overlaps a word. Only 34% touch a picture event, about chance, so there is no sign of a drop-out kept for a reveal.
- **A pause hands over to a new picture.** 65% of the 1 155 pauses end on a picture event (±2 frames) against 30% by chance, 19% start on one: the voice stops, then the next phrase starts with a new picture. 79% of pauses contain or touch a picture event within 0.1 s before to 0.17 s after.
- **Pauses are short and the bed carries through them.** Pauses of 0.3 s or more come 1.3 per 10 s at 0.42 s median; in 98% of pieces the floor stays above -50 dBFS across them.

## 6. Devices from the numbers

| Device | Prevalence (A) | Example ids |
|---|---|---|
| Loudness normalised to about -14 LUFS | 96% within ±1 LU; 100% of ee | all `hex`, `ee`; counter-case `pin/350048` -21.6 |
| Continuous bed under the whole narration at about 12 dB below the voice | 98% | `hex/DYy1TUWufoF` (6 pauses, floor -28.7 dBFS vs voice -17.3), `ee/DaAV2R5IuSi`, `hex/DUQRqS2icUB` |
| Voice from frame 0; bed starts with the voice | 94% first word within 0.2 s, 98% within 0.5 s | most pieces; exception `ee/DeWa3ljOu2j` |
| Bed ends within about 0.5 s of the last word; faded in 46%, held to the cut in 44% | outro median 0.5 s | faded: `ee/DUiSq11jO4R`, `hex/DV36JADibx8`, `hex/DXEP5DogtTK`; held: `hex/DaAIlijic8Y`, `hex/DNpu95sCyfO`, `hex/DQwRiFzCf6W` |
| Bed released in pauses (sidechain-like) | about 15% (3 dB or more), 8% at 6 dB or more | `hex/DXEP5DogtTK`, `ee/DUZvCOriq0d`, `hex/DUQRqS2icUB` |
| Bed with a beat or tonal rails | pulse trains 24%, tonal peaks 61% | `hex/DX6M6NCCWyE`, `ee/DZuVqDpO0Um`, `ee/DaAV2R5IuSi` 26-30 s |
| Bed changes without a picture cause | 4.1 per minute | `ee/DaAV2R5IuSi` 9.5 s, 27 s, 30.5 s |
| Pause then a new picture | 65% of pauses end on a picture event | all narrated pieces |
| Sparse loud cues | 82% of pieces have one or more; 0.15 per 4 s median | `ee/DeB2BnjOvHp`, `hex/DUiOWpiCare` |
| Noise riser into a fast run of picture events (visual) | seen in 2 of the 3 validation pieces; not counted as a class | `hex/DUQRqS2icUB` 57.5-59.8 s into a run of picture events at 58-62.6 s (4 hard cuts and soft transitions); `ee/DaAV2R5IuSi` 26.3-29.8 s |
| Tonal ping, sustained tone | seen, not counted | `ee/DeB2BnjOvHp` 8.7-9.4 s at 6.7 kHz |
| Hit or wide burst on a cut | about 2% of cuts (excess over control); 2.2% of picture events carry a salient cue | `ee/DaAV2R5IuSi` 10.2-11.2 s (3 wide bursts inside words, at picture events, z of 81-95) |
| Digital silence | 15% of pieces, two thirds of the cases at the end | `hex/DUiOWpiCare` 22.8 s |

## 7. The norms against the measurements

| Norm | Value | The pros (A) | Verdict |
|---|---|---|---|
| `audio.lufs` -14 ±1 | -14 / ±1 | median -14.1; 96% within ±1 | consistent (platform normalised) |
| `audio.maxLra` 3 | 3 | median 2.5; 67% at or under 3; p90 4.5 | consistent as a median, 1 piece in 3 above |
| `audio.maxSfxPer4s` 1 | 1 in any window | mean 0.25, p90 of pieces 0.61, 36% of pieces with a window of 2 or more | consistent as an average; a hard per-window cap of 1 is stricter than a third of the pros. p90 of the per-piece max window is 2, so 2 would hold 9 pieces in 10 |
| "no SFX on a spoken word" (`sfxWordMarginS` 0.05) | 0.05 s margin | 40% to 66% of loud cues overlap a word (not resolved); 12% of pieces have a clear excess in words | not supported as a pro rule; unsupported the other way round too |

Caution on all rows: the detector's blind spot is the cue under the voice that is quieter than the voice's loudest consonants. If the pros' cues are mostly that quiet, the true rate is higher than 0.25 per 4 s and the in-word share higher than the figures above; the ceiling is 2.0 per 4 s (every transient). The norm of 1 per 4 s lies inside that range.
