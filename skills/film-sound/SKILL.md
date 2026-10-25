---
name: film-sound
description: Use when a film has a locked picture, its silent master (`out/silent-9x16.mp4`) and a voice with word times, and needs its cues, music bed and final mix; or when anyone asks for more effects, a whoosh per cut, a hit per word or a punchier mix. Owns the cue list, the bed and its licence, and the loudness gate.
---

# film-sound

## Role

Sound designer (which sounds exist and why) and re-recording mixer (final balance of voice, cues and bed). Built on `research/sound-grammar.md` (`sound §n`: 201 finished pieces, measured by script); Moran says how to execute, the measurements say what to do. Register A numbers (grammar §0).

## You receive

- `out/silent-9x16.mp4` (locked picture, no audio) and `out/cues.auto.json` (every landing, travel and stroke the animator's `<Cue>` components in `<film>/Film.tsx` emit, exported by `node tools/audio/cues-json.mjs <file.cues.ts> <EXPORT> out/cues.auto.json`; it over-emits on purpose). Its rows are the composition's `Cue` `{ at, sfx, gain }`; `crew/sfx-cues.json` is `{ t, type, gain, len }` (`t` = `at`, `type` = `sfx`, as `toSfxCues` in `src/audio/cues.ts` maps them).
- `voice/voice.wav`, `voice/words.json` (`words[]` `w`, `start`, `end`); optional `out/voices.auto.json` (extra takes). The voice is the spine; you never retime it.
- `crew/sync-sheet.json` (per beat: `t`, `device`, `join`, `zoom.kind`) and `crew/brief.md` (the pace plan: turns, palette flips, dissolves, ending).
- From the overlay, via the director: voice policy, music licence rules, any sonic logo. Without a licence rule, ask; never guess a licence.

## You deliver

- `crew/sfx-cues.json` `[{ t, type, gain, len }]` and `out/sfx.wav` (rendered from exactly that list).
- `assets/music/music.wav` + `music.meta.json`; source, licence and URL or generation id in `crew/sound.md` (the meta file has no licence field).
- `out/final-9x16.mp4` and `crew/sound.md` (templates: `references/templates.md`).

## Process

1. **Speech map.** Words and the pauses of 0.3 s or more (snippet in `references/templates.md`). Pauses are where cues and bed changes live: 65% of pauses end on a picture event, and 94% of pieces start the voice within 0.2 s (sound §2, §5; device *Pause then a new picture*).
2. **Bucket the landings.** Join `cues.auto.json` to the sheet by beat (snippet in `references/templates.md`). Hard cuts, caption changes and plain entrances get nothing: few picture events carry a cue in the pros' work (evidence: 2.2 %, sound §4.2; grammar *Hard cut on the sentence*).
3. **Pick the percussive beats.** Stamps, flash trains, draw-ons, big drops and the reveal (`~` grammar §13): table in `references/device-playbook.md` §3. Budget: the pros' median piece has 2 cues in 48 s, p90 about 6 (sound §4.1, device *Sparse loud cues*). A riser plus its hit is the one pair that fills a window (device *Noise riser into a fast run of picture events*). Layered cues (`moran` Sound 3) each count against the cap. **Floor (client, 2026-10-16): at least one soft cue per scene**, on that scene's main event — the first cut had too many, the calm cut almost none; the middle is one to three per scene, pleasant paper/object sounds, never percussive punches. A riser plus its hit is the one pair that fills a window (device *Noise riser into a fast run of picture events*). Layered cues (`moran` Sound 3) each count against the cap.
3b. **Pleasant first** (client, 2026-10-17: "os sons têm que dar prazer e profundidade, não assustar ou gerar atrito"). A cue is a soft paper event heard on a desk in a room — tear, fold, page, riffle, highlighter, scissors, a reverse swell into the payoff — never a knock, punch, slap, clink, wood stamp or sticker slap. Every SFX stem is softened (high-pass ~90 Hz, low-pass ~6.5 kHz, a short low room: `aecho=0.8:0.6:45|95:0.22|0.12`) and is heard: about 10 dB under the voice in the pauses (`--report` "sfx re voice … in the gaps"; the pros peak near the voice, sound §4.3), with the bed about 14 dB under (client, 2026-10-17: at -19 dB the effects "sumiram" under a -12 dB bed). The film's `<Cue>` components are the animator's proposals, not the mix: you curate them into `crew/sfx-cues.json` (the first film's animatic had 35 raw cues in 77 s; its curated list kept 9) and the animatic is mixed from that list with the bed (step 7).
4. **Anchor and size.** `t` = the contact frame, a hair early (1-2 frames of `NORMS.fps`) rather than late; `len` = the audible span, so M5 sees the whole sound. The cue list is what sounds: render with `--no-thin` (you already thinned it).
5. **Under a word only if quiet.** Place each cue in the pause when its landing allows; never move the picture. A cue that starts at a word onset or rings into a word is an M5 finding: keep it only if `--report` shows the SFX stem's p90 under speech at or below `-SFX_BELOW_VOICE` dB (`~` own line; the sidechain adds `SFX_DUCK` more), and say which and why in `sound.md` (`references/device-playbook.md` §4; sound §4.4-4.5).
6. **Bed.** One track, licence recorded first, starts with the voice (no pre-roll), runs through the pauses `MUSIC_FIXED_BELOW_VOICE` dB under the voice (`tools/audio/mix.mjs`; evidence: 12.1 dB, sound §3.1), changes texture at the pace plan's turns, ends within about 0.5 s of the last word — **with a house close, the bed fades out over the closing lines and is silent from the close line's first word** (client, 2026-10-19: "vai diminuindo a música de fundo, até que em 'baixe e teste grátis' esteja totalmente sem música, pra quando o sino entrar, um som não sobressair sobre o outro"; the bell and the close cues play on voice alone) (`references/device-playbook.md` §2; devices *Continuous bed under the whole narration*, *Voice from frame 0*, *Bed changes without a picture cause*, *Bed ends within about 0.5 s of the last word*).
7. **Mix.** The picture is rendered silent (`tools/render.sh <CompositionId> <film>/out/silent-9x16.mp4`, render lock). Render the stem from the curated list (`node tools/audio/sfx.mjs <film>/crew/sfx-cues.json <film>/out/sfx.wav --dur <seconds> --no-thin`), then `node tools/audio/mix.mjs --video <film>/out/silent-9x16.mp4 --voice <film>/voice/voice.wav --sfx <film>/out/sfx.wav --music <film>/assets/music/music.wav --out <film>/out/final-9x16.mp4 --fade-out <0 or 0.2-0.5> --music-duck 0 --report` (→ −14 LUFS). `--music-duck 0` is the default recipe: a fixed bed `MUSIC_FIXED_BELOW_VOICE` dB under the speech, no sidechain, as in most finished pieces (sound §3.2); a swell in the pauses (`--music-duck <dB>`, default `MUSIC_DUCK`) is the minority choice, only when the director's overlay asks for it. `tools/audio/mix-remotion.mjs <silent.mp4> <vo.wav> <bed.wav> <cues.json> <out.mp4>` (`docs/techniques.md` row 8) is the one-shot wrapper for the animatic and tests: it takes `{ at, sfx, gain }` cues, thins crowded ones and uses the swelling bed with an 0.8 s fade, so the final uses `mix.mjs` for the recipe flags. A hot VO take (peak near −1 dBFS) gets a light limiter before the mix to reach −14 LUFS. Voice untouched; `--voice-level` only when the voice alone breaks `NORMS.audio.maxLra`. Do not raise `--sfx-gain` or `--music-gain` to chase punch.
7b. **Local music and tool gaps** (S5). A bed generated locally with ACE-Step 1.5 (the local ACE-Step install named by the project overlay; it does not take the heavy-job lock itself: wrap each call in it, as `studio/films/clone-van-gogh/audio/gen-music.sh` does) ends 8–10 s before the requested duration: ask for 10 s more than you need, cut it at the planned stop with a ≤150 ms fade; prove it has no vocals (`node tools/captions/transcribe.mjs` finds no words). Shape a build or a hard stop with an ffmpeg envelope (no tool does it yet). `mix.mjs` needs a video and writes AAC: for a wav-only mix feed a black silent mp4 of the exact length and pad back the ~75 ms AAC priming. Library SFX peak ~120 ms after their file start (booms, impacts, thuds): anchor them that much earlier. Loud cut hits (+13–25 dB sub-bass at the cut) are matched to the measured level instead of the house default only when the client explicitly asks to match a reference's sound; otherwise step 7 (do not raise `--sfx-gain` to chase punch) and §3b (pleasant, never startling) hold. Check every cue onset on the stem.
7c. **Matching a reference bed** (S8): measure the reference's bed under the voice (side channel or a stem) and land ours there with `mix.mjs --music-gain` (S8: −26 dB under speech needed 0.55, the default sat at −21); for a drone, pick the candidate with the lowest LRA (ebur128: 0.4 LU vs 5.1 for a swelling take). Cut-hit SFX are written in the reference's seconds and moved onto our voice through the film's anchors (`studio/films/clone-bethlem/audio/make-cues.py`), so they follow every retime. Integrated −14.1 LUFS against the reference's −14.2.
8. **Prove it with numbers.** `--report` lines, the gate, the cue list against words and windows. You cannot hear the export: say what was measured and what only a listener can judge (phone speaker, picture off) and send that to the reviewer.
9. **Write `crew/sound.md`** and return it with the gate result.

## Gate

`FILM_DIR=<film> FILM_STAGE=final npx vitest run src/film/__tests__/stage-gate.test.ts` (writes `crew/checks-final.md`; fails on any red) plus `node tools/checks/run-mp4.mjs <film>/out/final-9x16.mp4 --audio` for the file itself (exit 1 on any red). Codes M0 to M6, plus F2:

- 🔴 `M0` file unreadable, `M1` dead frames, `M2` integrated loudness outside `NORMS.audio.lufs` ± `NORMS.audio.lufsTol`, `M4` the cue list holds at most `NORMS.audio.maxSfxPer4s` cues in a `NORMS.audio.sfxWindowS` window (more is red), `M6` `out/sfx.wav` without `crew/sfx-cues.json`, or without its `out/sfx.wav.cues.json` sidecar (written by `tools/audio/sfx.mjs`), or with a sidecar hashed from a different cue file (re-render the stem; M4/M5 read the sidecar's cues), `F2` missing `out/final-9x16.mp4`.
- 🟠 `M3` LRA over `NORMS.audio.maxLra`; `M5` a cue whose span `[t, t+len]`, edges widened by `NORMS.audio.sfxWordMarginS`, touches a spoken word.
- PASS = no red, and every orange has a line in `sound.md`: M3 with the voice's own LRA and the fix tried; M5 with the word, the cue's depth from `--report` and why it stays. An M5 with no line is a defect.
- The platform normalises to about `NORMS.audio.lufs` (evidence: 96 % of the pros within ±1 LU of −14, sound §1), so M2 keeps you from being turned down; it is not a taste dial. True peak stays under the mixer's `TP_TARGET`.

## Tells (ranked)

0b. **A voice hidden in the bed** (client, 2026-10-19, draft v19 0:10: "tem um 'ah' de fundo" — an AI-generated bed carried a sung "Ai!"). Before a bed is used, run Whisper over the whole file in 0.5 s windows; any word it hears is spliced out with a short crossfade, and the house bed is fixed at the source.
0a. **A visible action with no sound** (client, 2026-10-19, draft v16 0:07: "faltou o efeito sonoro da tesoura"): a tool the viewer sees working (scissors cutting, a stamp, a hammer, a page turn, a tear) always has its soft cue at contact; re-check the cue list against the picture after every re-cut, since a moved event leaves its cue behind.
0. **Harsh or startling sounds** (client, 2026-10-17: "esses sons de punch, pong, de soco, algo batendo… não ficou legal"). Fix: the step 3b palette and softening; drop the cue rather than keep a hit.
1. **A cue on every cut or word** (the client says "more"). The pros carry a cue on few events (evidence: 2.2 %, sound §4.2). Fix: answer in two lines (level, bed turns, one accent on the reveal); keep the list.
2. **A cue as loud as the voice under a word.** Fix: move it into the pause, shorten `len`, or lower `gain` until `--report` clears.
3. **A bed that pumps.** The pros' typical bed is fixed and does not rise in pauses; only 15% rise by 3 dB or more (sound §3.2). Fix: mix with `--music-duck 0` (the default recipe), a steady track, no solos under speech. A duck left on (`--music-duck <dB>`, which releases over 500 ms) needs a reason in `sound.md`.
4. **Dry gaps** (no floor in pauses; 98% of the pros have one) or **pre-roll** (a bed that arrives after the voice).
5. **A bed change on every cut, or none at a turn.** Fix: changes only at the plan's turns (sound §3.4).
6. **A cue after its picture.** Fix: `t` on the contact frame, 1-2 frames early.
7. **A tail after the last word** longer than the pros hold (4% keep 2 s or more). Fix: `--fade-out` inside the outro.
8. **A cue list that is not what sounds** (thinned render; M4 reads the wrong list). Fix: `--no-thin`, list = render.
9. **A dropout mid-piece.** 7 pieces have one; none sits on a reveal more than chance. Fix: never.
10. **Louder by clipping or by raising cues and bed.** Fix: leave the voice in front; loudness comes from the master pass.

## Hand-off

To the director with `out/final-9x16.mp4`, `crew/sound.md`, `crew/checks-final.md`; the director routes it to the reviewer. Blocked: send the gate code and `t`. An M2/M3 miss from swinging voice levels, or a landing with no pause, is the writer's or animator's defect: report the line or frame, do not fix it. Never edit the voice, picture, sheet or captions.

## Knowledge

- `research/sound-grammar.md`: §1 loudness, §2 speech map, §3 bed, §4 cues, §5 silence, §6 devices, §7 norms against measurements.
- `research/editing-grammar.md`: §1 rhythm, §10 model, §13 role map; `research/craft.md` §2.9; `research/external-skills.md` Sound.
- `references/device-playbook.md` (sound devices, cue map, bed, mix, open items), `references/templates.md` (cue list, `sound.md`, snippets), `references/worked-example.md`.
- `references/moran.md` (Sound: tactile categories, layering, bed below ~1 kHz, mood by track), `references/zhylin.md`.
