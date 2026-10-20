# Sound device playbook

Device names are the rows of `research/sound-grammar.md` §6 (`sound §6`) unless marked grammar. Ids: `hex/…`, `ee/…`, `pin/…` as in the grammar. Numbers are register A (165 pieces) and measured by script, which cannot hear a cue quieter than the voice's loudest consonants (`sound` Method 7, 9; §4 caution), so every cue rate below is a floor, and the ceiling is 2.0 per 4 s. `~` = inference. Engine constants (`core/audio/mix.mjs`): `SFX_BELOW_VOICE` 12, `SFX_DUCK` 10, `MUSIC_BELOW_VOICE` 10.5, `MUSIC_DUCK` 8, `MUSIC_FIXED_BELOW_VOICE` 12, `TP_TARGET` -1.5, default `--fade-out` 0.8; read them from the file if in doubt.

Order of authority: the measurements (what to do) > Moran (how to do it) > craft §2.9 (frame-level sync).

## 1. Loudness and master

| Device | When | How here | Measured | Tell and fix |
|---|---|---|---|---|
| Loudness normalised to about -14 LUFS | always | `mix.mjs` two-pass loudnorm to `NORMS.audio.lufs`, limiter, true peak `TP_TARGET`. The gate measures the encoded `final-9x16.mp4` (M2, M3) | median -14.1 LUFS, 96% within ±1; LRA median 2.5 (p10-p90 1.8-4.5), 67% at or under 3; true peak median -0.5 dBTP, above 0 in 25% (sound §1). The sameness is the platform's normalisation (about -14), so the number says what ships, not what the mixer chose; `pin` pieces that did not pass through it vary (median -15.5) | M3 orange (1 pro in 3 would also miss): first `--voice-level` if the voice alone swings, then send the writer the line. Never fix loudness with cues or bed. Our true peak stays under the mixer's ceiling even though a quarter of the pros overshoot |

## 2. The bed

Whether the bed is music or ambience is not measured (sound Method 9); the evidence only says a steady floor exists. Timbre is Moran's call (below).

| Device | When | How here | Measured | Tell and fix |
|---|---|---|---|---|
| Continuous bed under the whole narration at about 12 dB below the voice | every narrated film | one track in `assets/music/music.wav`; `--report` line `music re voice: … X dB in the gaps` | floor in pauses -30.1 dBFS vs voice -17.4: voice 12.1 dB over the bed (p10-p90 7.1-18.7); 98% have a floor in pauses (`hex/DYy1TUWufoF`, `ee/DaAV2R5IuSi`, `hex/DUQRqS2icUB`) | accept a gaps figure from -7 to -19 dB (`~` the report averages power where the study took medians); outside it, trim `--music-gain`. A bed with dry pauses is outside the pros (3 pieces without any: `pin/350048`, `pin/349988`, `hex/DYMUSnRiNbV`) |
| Voice from frame 0; bed starts with the voice | always | start the music at 0; no pre-roll | first word 0.08 s after the start (94% within 0.2 s, 98% within 0.5 s); exceptions `ee/DeWa3ljOu2j` (music-led intro, LRA 10.5), `hex/DUiOWpiCare` (1.8 s) | a bed arriving late reads as a different film |
| Bed ends within about 0.5 s of the last word | every film without a house close (with one, the bed is silent from the close line: `SKILL.md` step 6) | `--fade-out 0.2` to `0.5`, or `--fade-out 0` to hold to the cut. The default 0.8 is outside the measured fade | level above the pause floor 0.23 s after the last word (p10-p90 0.05-1.05); last word to the end 0.5 s (0.09-1.65), 4% keep 2 s or more; faded in 46% (`ee/DUiSq11jO4R`, `hex/DV36JADibx8`, `hex/DXEP5DogtTK`), held in 44% (`hex/DaAIlijic8Y`, `hex/DNpu95sCyfO`, `hex/DQwRiFzCf6W`) | if the picture holds the last card longer than the pros hold sound (about 1.5 s), fade inside it; no standing music tail. Digital silence at the very end is ordinary (19 of 165) |
| Bed changes without a picture cause | at the pace plan's turns | cut a new section: `music.mjs` plan chunks sized to the turns (a free prompt ignores length), or two tracks with a short overlap; place the change in the pause before the turn's first picture | 4.1 changes per minute (p10-p90 0-11, 85% of pieces have one), spread through the body; no link to cut rate (median change in cut rate 0); only a slight pull to pauses (29% within 0.75 s against 21% chance) (`ee/DaAV2R5IuSi` 9.5, 27, 30.5 s). Craft §2.8 says about every 20 s | turns come from the director's plan (palette flip, dissolve, chapter, ending; grammar *Palette flip marks a structural turn*); do not invent turns to reach 4 per minute; a plan with one turn gets one change |
| Bed with a beat or tonal rails | optional | steady pulse or pad; `core/audio/beats.py track.wav` gives beats and downbeats to land a section change on | pulse trains in 24% of pieces (strong: `hex/DX6M6NCCWyE`, `ee/DZuVqDpO0Um`), tonal peaks in 61% of pieces with a long pause | a pulse that fights the cut rhythm: choose a pad; the picture is locked and cannot move to the grid |
| Bed released in pauses (sidechain-like) | the minority choice | `--music-duck <dB>` (omit the flag for the engine default `MUSIC_DUCK`): the bed ducks under the voice and rises in pauses over 500 ms. The default recipe is `--music-duck 0`, a fixed bed `MUSIC_FIXED_BELOW_VOICE` dB under the speech | median swell +0.1 dB; 15% of pieces +3 dB or more, 8% +6 or more (`hex/DXEP5DogtTK`, `ee/DUZvCOriq0d`, `hex/DUQRqS2icUB`); depth under speech unresolved (sound §3.2) | `--music-duck 0` for the fixed bed |
| Digital silence | never mid-piece | no dropout | 11 mid-piece drops in 7 pieces; 34% touch a picture event, about chance, so no sign of one kept for a reveal | do not use it as a device |

Choosing the track (Moran, the how; measured evidence is silent on genre):

- Neutral timbre, marimba or pizzicato strings, optionally under a soft pad (`moran` Sound 4, 6, 7, 9): marimba reads curious, pizzicato investigative. Audition against the locked picture, read the mood tags and BPM (Sound 10).
- Keep the bed's energy below about 1 kHz and dip the bed, never the voice, across the voice band: `ffmpeg -i raw.wav -af "equalizer=f=2500:t=q:w=0.8:g=-3" assets/music/music.wav` (centre and -3 dB are `~` own starting points; Moran gives the band, "dip ~1-4 kHz", not the amount). Note the filter in `sound.md`.
- Licence first: source, URL or generation id, licence text, date in `sound.md`; the overlay decides what is allowed. `music.mjs` spends credits and needs `ELEVENLABS_API_KEY`: announce it before any generation and reuse the cache.

## 3. Cues: which picture events get one

Only 2.2% of picture events carry a salient cue (212 of 9 595); the excess over chance on cuts is about 2% (sound §4.2). Cut-synced sound is the exception. What the pros do cue is not resolved by the numbers, so this map is `~` from grammar §13 ("stamps, flash trains and draw-ons are the percussive beats") and Moran's tactile sound (`moran` Sound 1, 2: paper, felt marker, shutter, clicks). Types are `core/audio/sfx-library.json` actions.

| Picture device (sync-sheet `device` or animator device) | Cue | Anchor and `len` | Count rule |
|---|---|---|---|
| Overshoot pop on light pieces (stamps, label pops) | `stamp`, `stamp-wood`, `stamp-ink`; `pop` or `click` for a label | `t` = contact; `len` 0.3-0.6 | one per stamp; a run of stamps in one window is one cue on the first or biggest |
| Flash train | one `impact` or `click` | `t` = first flash; `len` ≤ 0.3 | one per train, never one per flash |
| Draw-on markup | `marker` (circle, underline, highlight) or `pen` | `t` = stroke start; `len` = stroke time | only the mark that carries the claim (the sheet's `lettering.mark`) |
| Drop and settle; Document slides in tilted | `paper-place` (drop); `paper-slide` (document, quiet) | `t` = contact of the drop; slide at its middle | one per beat at most; the beat of the turn first |
| Container opens; Stagger build that counts; Count in steps | `pop` | `t` = the last landing (the count's final value) | one for the whole build, not one per item |
| Typed or UI-native entrance | `burst` | `t` = first key; `len` = typing time | one cue for the line (never `key` per letter) |
| Punch-in to the named detail (`zoom.kind: "punch-in"`) | `whoosh`, peak on arrival | `t` = arrival; the recording leads in up to 0.45 s before `t` | only punches (the film has at most `NORMS.camera.maxPunches`) |
| Paper-native wipe | `paper-wipe` or `page` | centred on the wipe; `len` = the wipe | one per wipe |
| Burst, then hold on the point | `riser` through the burst, `impact` or `thud-soft` on the hold's first frame | riser `len` 2-3 s ending at the hit | the pair fills a window (the cap `NORMS.audio.maxSfxPer4s`) |
| Hard cut on the sentence; Flash frame / blur / glitch over the cut; Hero entrance; Paper breath card | none | | the default; a hit on a cut is about 2% of cuts |
| Dissolve reserved for time or mood | none, or one `swell` at the payoff | | |
| Palette flip at a turn | the bed change (§2); at most one `thud-soft` on the first picture after it | | |
| Decelerating ending | bed fade; the bed's own last note is the edge cue (craft §2.8) | | no SFX on the last card |

Budget: the pros average 0.25 cues per 4 s (median piece 0.15, p90 0.61; median piece 2 cues in 48 s, p10-p90 0-6; 82% have at least one). Zhylin's 1 per 6 s sits near the busy end (`zhylin`). More than that is outside the evidence, not a creative choice. Layering 2+ clips per event (`moran` Sound 3) spends the window: two layers at one `t` are two cues for M4, so layer only when the event is the film's one accent.

Library craft (craft §2.9, `moran` Sound 1-3): align the transient to the contact frame (`anchor: "contact"` types do this; `whoosh` and `swish` are `peak`), a hair early beats late, a whoosh ends on a dull impact so the move has a destination, weight by pitch (low and falling reads heavy), 3+ variants for a type that repeats (the library cycles files). Files not fetched fall back to a synth voice (`core/audio/fetch-sfx.mjs` fetches the Mixkit ones; licences in `core/audio/sfx/CREDITS.md`).

## 4. A cue under a word

M5 (orange) flags a cue whose span touches a word. The pros do it: 20 of 165 pieces show a clear excess of loud transients inside word spans (`ee/DeB2BnjOvHp` 9 over 27 s, `hex/DUiOWpiCare` 8, `hex/DZ1_nI7iEd8` 8, `hex/DX6M6NCCWyE` 7, `ee/DaAV2R5IuSi`, `ee/DSc0jeJjB9u`), and between a third and two thirds of the loud cues overlap a word, unresolved (sound §4.4-4.5). Their cues in gaps are loud (peak -3.3 dB against the narration, p10-p90 -11.2 to +3.8, §4.3); under a word the detector only proves they are not louder than the voice's loudest consonants. So the rule is about level, not about silence:

1. Prefer the pause. 65% of pauses end on a picture event, so a landing often coincides with the first word of the next phrase. Put `t` 1-2 frames early so the onset falls in the pause, and keep `len` short (one-shots) so the tail is the only part under the word.
2. A cue that starts in a word, or whose tail runs into one, stays only if it is quiet under the voice. The mixer builds that: the SFX bus is set `SFX_BELOW_VOICE` dB under the speech level and the sidechain takes `SFX_DUCK` more while the voice speaks, so about 22 dB nominally. Proof: `--report` prints `sfx re voice: … dB mean under speech (p90 Y)`; the report measures only windows where the voice speaks, so Y is the under-word level of the whole SFX stem. Keep when Y ≤ -`SFX_BELOW_VOICE` (`~` own line); otherwise lower `gain`, move or drop.
3. A cue in a pause may be as loud as the mixer's hit level; raising it toward the pros' gap level (up to about the voice) is a per-cue `gain` on one accent and is checked by the report's gap figure, not assumed (`external` Sound: SFX near the VO during transitions, music low).
4. The audible span is `[t - pre, t + len]`: `pre` is the recording's lead-in, up to 0.25 s for `contact` types and 0.45 s for `peak` types (`MAX_PRE` in `core/audio/sfx.mjs`), and the tail is `len`, else the action's `tail`, else 0.6 s. M5 sees `[t, t + len]` only, so a cue with no `len` or a `peak` whoosh passes M5 while ringing into a word: run the span check in `templates.md`. Always write `len`.

## 5. Voice and the stems

The voice is never processed unless `--voice-level` (3:1 compressor, only to rescue LRA). The mix is built around the measured speech level, so a take that is too quiet or too loud changes nothing in the balance. Extra takes (`voices.auto.json`) are summed before measuring. `--report` is the only mix readout: read all three lines (music in gaps, music and SFX under speech) and paste them in `sound.md`.

## 6. Open items (the evidence cannot say; do not fill them in silently)

1. **Duck depth where there is one** is unresolved (sound §3.2); the engine's `MUSIC_DUCK` stays the default for `--music-duck <dB>` until a measurement replaces it. Do not hand-set a low bed on top of an auto-duck (a double dip makes the bed vanish).
2. **Quiet cues under speech** are invisible to the detector: the cue budget is a floor.
3. **Whether the pros' beds are music or ambience** and the track genre are not measured.
