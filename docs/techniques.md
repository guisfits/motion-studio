# Technique index

One row per technique of phase 1: what to import, which demo shows it, how long the demo takes
to render on an M-series Mac (1920×1080, 30 fps, `tools/render.sh`), and what to know before
using it. Every component is exported from `src/index.ts`. The research behind each technique
is in `research/` (catalogue, craft rules, the Luther-film baseline).

Render any demo: `tools/render.sh <ID> out/<id>.mp4`. Check it: `node tools/checks/run-mp4.mjs out/<id>.mp4`.
The showreel (`Showreel`, 57 s, renders in ~20 s) strings an excerpt of every demo together with torn-paper joins; render it `--muted` (the type and caption demos carry raw VO).

| # | Technique | Components | Demo | Render | Notes |
|---|-----------|------------|------|--------|-------|
| 1 | Camera travelling over a 2D world | `Camera`, `cameraAt`, `EASES` | `T01-Camera` | 5 s | Pure per frame: `cameraAt` is keyframe-exact at any frame. Inside `CameraMotionBlur`, read `useCurrentFrame` in the children (the blur samples them); shutter capped at 120°, 16 samples. |
| 2 | Multiplane parallax | `Multiplane`, `layerOffset`, `blurFor` | `T02-Parallax` | 5 s | Depth blur from distance to the focal plane; the origin is the earliest key. |
| 3 | Voice-timed kinetic type | `RevealWords`, `Highlight`, `Strike`, `Underline`, `Ransom`, `Stroke`, `fitText` | `T03-Type` | 4 s | Write-on under `non-scaling-stroke` uses a growing clip, never dasharray. `Ransom` tiles per grapheme (accents safe). |
| 4 | Diagrams and maps | `DrawPath`, `RouteMap`, `Timeline`, `Tree`, `timelineLayout`, `treeLayout` | `T04-Diagram` | 5 s | Routes in normalised image coordinates; route line ≥ 8 px at 1080p to read at 720p. Timeline/Tree cards arrive through `SetDown`. |
| 5 | Paper motion | `SetDown`, `Tape`, `Torn`, `stepFrame`, `wiggle`, `carryAt` | `T05-Paper` | 4 s | Nothing pops in: every sheet is carried in from off frame. Pass `size` to `SetDown` for a large sheet. 12 poses/s = `stepFrame(frame, 30, 12)`. |
| 6 | Paper transitions | `tornWipe` (for `TransitionSeries`) | `T06-Transitions` | 8 s | Ours: Remotion's tear/pageTurn effects don't give the baseline's paper join. |
| 7 | Texture and print look | `Grain`, `printLook` + `@remotion/effects` | `T07-Texture` | 7 s | Effects need WebGL (ANGLE, set in `remotion.config.ts`). |
| 8 | Sound design and mix | `Cue`, `collectCues`; `tools/audio/mix-remotion.mjs` | `T08-Sound` | 6 s | Render silent, then mix: SFX from cues + VO + ducked bed → −14 LUFS (`node tools/audio/mix-remotion.mjs <silent.mp4> <vo.wav> <bed.wav> <cues.json> <out.mp4>`; the demo bed comes from `tools/assets/make-bed.sh`). The mix refuses a cue list it would misplace: a cue with no finite `at` ≥ 0 or no `sfx` name, or one past the end of the render; an unknown SFX name fails too. Cues live in a pure `.cues.ts` so the picture and the mix share one timing source; `node tools/audio/cues-json.mjs <file.cues.ts> <EXPORT> out/cues.json` exports them. A hot voice take (peak ≈ −1 dBFS) needs a light compressor/limiter before the mix to reach −14 LUFS. |
| 9 | Word timings and captions | `fromWords`, `useWordAt`, `pageWindows`, `readingCheck` | `T09-Captions` | 6 s | `node tools/captions/transcribe.mjs <wav> <out.json>` (local whisper). |
| 10 | Simple 3D | `Card3D`, `Phone3D`, `Book3D` | `T10-Three` | 9 s | Textures wait on `delayRender`, and the hook draws the canvas once they are in, so a card that mounts at any frame renders in place (a missing image URL throws). `remotion still` ignores the config's GL: pass `--gl=angle`. Phone screens take an image or a canvas draw function. |
| 11 | Cut-out puppet | `Puppet`, `solve`, `POSES`, `interpolatePose` | `T11-Puppet` | 5 s | Forward kinematics on pivots from `puppet.json`; joints are round caps on the pivot so no angle opens a seam. `tools/make-puppet-parts.py` regenerates the parts. |
| 13 | Organic FX | `InkSpread`, `Water`, `Smoke` | `T13-Fx` | 9 s | Wrap `@remotion/effects` noise/wave/displace; clip water to the sea. |
| 17 | Checks on rendered mp4s | `tools/checks/run-mp4.mjs` | all | — | Duration (`--min`/`--max` seconds; a non-number is refused), black ≥ 2 s, frozen ≥ 3 s, loudness when there is sound, title-safe text boxes (`--boxes`, `--stills`). An unreadable file is red. |
