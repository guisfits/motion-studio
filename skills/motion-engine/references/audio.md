# Audio: grid, voice, SFX, mix, loudness

Picture and sound share one timeline. The **voice leads**: it is the spine of a narrated film,
continuous from frame 0 to the last word; music is a floor under it and SFX are rare accents on
visible gestures. If a viewer cannot follow every word, the mix is wrong.

## Grid

`beats.json`: `{ bpm, beats: [s…], downbeats: [s…], hits: [s…] }`.

| Source | Command |
|---|---|
| Code score | `node <E>/core/audio/score.mjs <F>/score.json [--out <F>]` → `music.wav` + `beats.json` |
| Generated track | `node <E>/core/audio/music.mjs <F>/music.plan.json` (or a prompt `.txt --seconds 30`); needs `ELEVENLABS_API_KEY`; cached by request; then `beats.py` |
| Supplied track | `python <E>/core/audio/beats.py track.wav > <F>/beats.json` (librosa: bpm, beats, downbeats, hits) |

`score.json`: `{ bpm, bars, chords: ["Dm","Bb","F","C"], voices: { organ, strings, bass, bell,
piano, kick } with { from, to, gain }, tail, reverb }`. One chord per bar, cycling; `from`/`to`
are bar indexes `[from, to)`, so energy builds in layers. `bars ≥ ceil(dur × bpm / 240)`. Tempo by
mood: 72–90 sober, 100–120 energetic.

A generated track's prompt or plan is a cue sheet: instruments, tempo, mood per section with
timestamps, the hit points the picture needs, an ending. A plan (`chunks` with `duration_ms`)
enforces section lengths; a free prompt treats length as a suggestion. Time the shots to the
**measured** grid, not to the prompt.

## Bed norms

- A low, continuous bed **or none**; both are professional. Never busy, never in the voice's
  pitch range. It never becomes a layer the viewer notices.
- About **20 dB under the speech** while the voice talks (≥ 10 LU under is the broadcast floor
  for intelligibility), about 10 dB under in the gaps.
- Change or swell only on structure (the turn, the payoff); drop it 3–5 dB under the CTA; no
  stinger. Hard cut or a short fade after the last word.

## SFX: cues

Components emit cues for their own gestures (`cues()`); hand cues go in `<F>/cues.json`, same
shape: `[{ "t": 2.41, "type": "paper-place", "gain": 0.8, "len": 0.4 }]`.

**`t` is when the thing is seen to land, never when its motion starts.**

| What | `t` |
|---|---|
| A thing placed by a spring | where the spring reaches 95 %: `landsAt(tIn, spring, stepFps)` or `tIn + springReach(k, d)` |
| A hand-stepped entrance (12 fps) | the first step at or after that |
| A stamp or hit | the contact frame |
| A camera whoosh | the middle of the travel: `key + springReach(k, d, 0.5)` |
| A stroke (pen, marker, typed text) | the first frame of the stroke |

Never a hand-guessed offset. One entrance = one sound (not a slide at the start plus a place at
the end).

**Density norm: at most one SFX per 4–6 s in a narrated film**, each on a cut, a card or a mark
landing; zero on a spoken emphasis, zero stacked, none to "fill" a voice gap. Short (≤ 300 ms
transients), low, one sound family per film (paper world: slide, place, page, tape, pencil; UI
world: soft click, tick). No cinematic booms under explanation.

## SFX: thinning and rendering

`node <E>/core/audio/sfx.mjs <F>/out/cues.auto.json <F>/sfx.wav --dur <s> [--no-thin] [--library extra.json]`

`thin.mjs` runs first and is deterministic. Order of rules:
1. Typewriter keys: one per 0.12 s; a run of > 8 keys becomes one `burst`.
2. Priority: signature > landings > camera > slides and pours > text and pen > keys.
3. Gap: no two non-ambient cues closer than 0.35 s; one camera whoosh per 1.0 s; the same type
   twice inside 0.5 s is one event.
4. Masking: nothing starts in the first 0.25 s of a louder cue.
Ambient beds never yield; a `signature` cue (a project's sonic logo) is admitted first.

Thinning removes overlap, not density: the 1-per-4–6 s norm is a **design** decision made in the
shot list. Components over-emit; cut cues with `gain: 0` or by not gathering them.

Library (`core/audio/sfx-library.json`): each action maps to recordings with `anchor` (`contact`
or `peak`, so the anchor lands on `t`), `tail` (default 0.6 s, faded), `gain`, `ambient`,
`signature`, `alias`. Every one-shot is normalised to the same hit loudness first, so levels
differ only by the numbers in the library. Variants rotate deterministically. A type with no file
falls back to a synthesized voice (click, tick, pop, thump, whoosh, page, chime, type, ding, tear,
crumple, drip, scratch…). CC0 files ship with the engine; others are fetched locally by
`node <E>/core/audio/fetch-sfx.mjs` (never redistributed). A project adds its own library with
`--library` or `MOTION_SFX_LIBRARY` (colon list), resolving files in `<json dir>/sfx/`.

## Mix (`core/audio/mix.mjs`)

```bash
node <E>/core/audio/mix.mjs --video <F>/out/silent-9x16.mp4 --out <F>/out/final-9x16.mp4 \
  --voice <F>/voice/voice.wav --music <F>/music.wav --sfx <F>/sfx.wav \
  [--music-gain 1] [--sfx-gain 1] [--voice-gain 1] [--fade-out 0.8] [--report]
```

Built around the measured speech level (mean power of the 50 ms windows where the voice speaks);
the voice itself is not touched.

| Stem | In the pauses | While the voice speaks |
|---|---|---|
| SFX | typical hit (p90) **12 dB under speech** | sidechain ducks a further 10 dB (attack 5 ms, release 250 ms): ≈ 22 dB under |
| Music | 10.5 dB under speech | ducks a further 8 dB (attack 20 ms, release 500 ms): **≈ 20 dB under**; dips under each SFX |
| No voice | music at 0.8; SFX 6 dB under the bed | — |

Then a gentle limiter and two-pass `loudnorm` to **-14 LUFS integrated, true peak -1 dBTP**,
linear so the balance is kept. Target LRA ≤ 3 LU and a 1 s RMS spread ≤ 5 dB. Any subset of
stems works; mix a draft too, to judge sync before the final.

`--report` prints each stem against the voice, e.g. `music re voice: -23.2 dB mean under speech,
-20.5 dB in the gaps`. Under speech, SFX should read about -22 to -25 and the bed -20 to -24; in
gaps SFX about -12 to -14, bed -10 to -12. A stem above -18 under speech is too loud: fix the cue
list or the stem gain, never by raising the voice.

## Voice

- Present 90–100 % of runtime; no gap > 0.4 s except at the very end. Pauses live inside the
  voice ("Look at this.") as absorption time, not dead air.
- Level steady (speech mean ≈ -20 dBFS RMS before normalisation, no spikes above it); clean
  hum/noise, light compression, EQ for clarity.
- Check on a phone speaker. Transcribe the final with ASR: zero wrong words.

## Common defects

| Heard | Cause | Fix |
|---|---|---|
| "Too loud, overlapping, a racket" | SFX dense, stacked, near voice level | cut to ≤ 1 per 4–6 s, thin, `--report` under -18 |
| Effect off the motion | cue on motion start, or a guessed offset | `t` = landing, derived from the spring |
| Voice buried on a phone | bed in the 1–4 kHz band, not ducked | duck ≥ 15–20 dB, lower bed, check on a phone |
| Pumping bed | release too short | 200–500 ms |
| Dead air at cuts | voice edited with gaps | tighten to ≤ 0.3 s |
| Stinger at the end | outro habit | bed down 3–5 dB under the CTA, cut after the last word |
