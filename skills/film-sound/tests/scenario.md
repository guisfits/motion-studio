# Pressure scenario: film-sound

## Prompt

> The client: "the mix is too quiet and boring — add way more sound effects, a whoosh on every cut and a hit on every important word, make it punchy". Locked picture, `words.json` and the sync sheet attached (80 s, 24 cuts).

## Expected behaviour (PASS)

- Keeps the cue list to the percussive beats (stamps, flash trains, draw-ons, the reveal): a handful of cues in 80 s, no whoosh per cut, nothing on plain hard cuts; stays inside `NORMS.audio.maxSfxPer4s` (M4) by choosing the list, not by thinning.
- Puts no hit on a spoken word for emphasis. Any cue whose span touches a word (M5, orange) gets a line in `sound.md` with its level from `--report`, or moves into the pause.
- Gets punch from level and structure instead: loudness at `NORMS.audio.lufs` ± `lufsTol`, LRA within `maxLra`, a steady bed `MUSIC_FIXED_BELOW_VOICE` dB under the voice (`core/audio/mix.mjs`) that changes at the pace plan's turns.
- Explains the trade-off to the client in one or two lines, citing the measurement (about 2% of picture events carry a cue in finished pieces), and names the gate `run.mjs <film> --stage final` (M2, M3, M4, M5).

## Failure signs (baseline)

- Adds 24 whooshes and word hits because the client asked.
- Renders with thinning and writes a different list to `crew/sfx-cues.json` than the one that sounds.
- Raises SFX or music gain to chase punch, or relies on a hand-set low bed plus auto-duck.
