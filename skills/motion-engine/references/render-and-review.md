# Render and review

## Render modes (`core/render.mjs <film>`)

| Command | Output in `<film>/out/` | Use |
|---|---|---|
| `--stills beats` (or `downbeats`, or `1.2,3.4,…`) | `stills-<f>/`, `stills-<f>.png` labelled sheet | composition, type, scale contrast; before any video |
| `--draft` | `draft-<f>.mp4` (540 wide, 30 fps, no motion blur) | pacing, motion, transitions |
| `--draft --from 4 --to 7` | `draft-<f>-4-7.mp4` | re-check only the seconds a fix touched |
| `[--format 9x16\|1x1\|16x9\|all]` | `silent-<f>.mp4` (60 fps, 4 blended subframes) + `cues.auto.json` | final picture |
| `--sub 8` | 8 subframes | films with whips or fast piece moves (blur instead of ghosts) |
| `--fps N` | — | override the final frame rate |

A final costs roughly 240 screenshots per second of film. Never run finals inside the critique
loop. `core/server.mjs <film> [--port 4321] [--root dir]` prints a live preview URL with scrubbing.

## Review sheets (`core/critique/sheets.mjs <video> [--out dir]`)

| Output | What it is | Judges |
|---|---|---|
| `contact.png` | 2 frames per second, timestamped | variety, dead beats, holds, composition |
| `phone.png` | 1 frame per second at 360 px wide; on 9:16 the platform UI zones are shaded | readability at phone size; anything readable inside a shaded zone fails |
| `strip-<t>.png` (`--strip 4.2,7.8`) | 12 consecutive frames at t | pops, overlaps, linear slides, ghosting during a fast action |
| `wave.png` | audio waveform | sync of transients with shot changes, silence, clipping |
| `loop_check.mp4` (`--loop`) | the film twice back to back | loop seams |
| `--flat` | prints ranges where > 65 % of the frame is bare ground for > 0.5 s; writes nothing | dead frames, empty grounds |

Open every sheet image and read it; the code is not evidence, the frame is. Fonts, decode timing
and layout lie. Stills hide pops and slides; strips show them. Read every word on the phone sheet:
if you cannot, neither can the viewer.

Put a strip at **every shot change** and at every fast move. Sheets work on any MP4, including a
reference reel being studied.

## Safe zones (9:16, 1080×1920)

| Zone | Pixels | Holds |
|---|---|---|
| Top | 0–220 | platform header: nothing readable |
| Bottom | 1520–1920 (400 px) | caption/handle/audio bar: nothing readable |
| Right rail | x ≥ 940 from y ≥ 1100 | like/comment/share buttons: nothing readable |

Grounds, bleeding hero words and textures may run into the zones; captions, proof, numbers and
faces never. `stage.box` is the safe rectangle; compose essentials inside it. A centred 4:5 block
(1080×1350) is the safest place for anything the argument depends on.

## Type sizes (at 1080 wide)

Statements ≥ 96 px · reading lines ≥ 52 px · caption words ≥ 60 px · labels ≥ 36 px · nothing a
viewer must read under 44 px. The 360 px phone sheet decides.

## Sync and loudness checks

- `core/audio/sync_check.py <final.mp4> <cuts.json> --music <music.wav>`: for each picture event
  in `cuts.json`, is it heard as an attack (the SFX adds an onset the music lacks, ≥ 1.4×, or the
  cut lands on a musical hit)? Pass ≥ 80 %. List only the events that are meant to be heard; with
  sparse SFX, silent cuts belong to the voice, not to the check.
- `mix.mjs --report` prints how music and SFX sit under the voice (see `audio.md`).
- Loudness of the final: `ffmpeg -i final.mp4 -af ebur128=peak=true -f null -` → integrated
  -14 ± 1 LUFS, LRA ≤ 3 LU, true peak ≤ -1 dBTP.
- Intelligibility: transcribe the final mix with an ASR model; every word must come back right.

## Determinism

Same command, same frames. Render a range twice and compare md5. A mismatch means state leaked
between frames (a counter, `Math.random`, a CSS transition, an image still decoding).

## Studying a reference

`core/reference/inspiration.mjs <id> <url> [--fps 2] [--out dir]` downloads one clip (only with
permission and from sources you may use for study), extracts frames and builds a labelled sheet.
Then measure it like your own film: `sheets.mjs`, a cut detector (`ffmpeg -vf
"select='gt(scene,0.3)',showinfo"`, merge detections < 0.7 s apart), `ebur128`, a word-level
transcript for words per second. Write what you saw to `inspirations/<id>.md`: grammar only.
Media and frames stay local, never committed.
