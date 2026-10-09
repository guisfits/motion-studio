# Credits

motion-studio's code is MIT (see LICENSE). The third-party material it ships or fetches:

## Fonts (`core/fonts/`)

| Font | Licence | File |
|------|---------|------|
| Special Elite (Astigmatic) | Apache License 2.0 | `SpecialElite-HomemadeApple-LICENSE-Apache2.txt` |
| Homemade Apple (Font Diner) | Apache License 2.0 | `SpecialElite-HomemadeApple-LICENSE-Apache2.txt` |
| Pinyon Script (The Pinyon Project Authors) | SIL Open Font License 1.1 | `PinyonScript-OFL.txt` |

## Sound effects (`core/audio/sfx/`)

- Committed recordings: Freesound, CC0 1.0. Per-file sources in `core/audio/sfx/CREDITS.md`.
- Mixkit recordings: never committed. `node core/audio/fetch-sfx.mjs` downloads them under the
  Mixkit Sound Effects Free License into the gitignored `core/audio/sfx/fetched/`; sources in
  `core/audio/sfx-sources.json`.

## Generated at runtime

- Music from `core/audio/score.mjs` is synthesized in code.
- `core/audio/music.mjs` calls ElevenLabs Music with your own key (`ELEVENLABS_API_KEY`); the
  generated track's terms are ElevenLabs'.
