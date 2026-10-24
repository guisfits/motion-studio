# Sound notes - clone-van-gogh

Output: `audio/mix.wav` (48 kHz stereo, 34.625 s = 1 662 000 samples, gitignored). Rebuild: `audio/build-mix.sh` (from `media/video/studio`). Report: `audio/mix-report.txt`.

## Music
- Model ACE-Step 1.5 turbo (`gen.py`), 40 s asked, cut to 30.75 s. Prompt: "dark cinematic instrumental, solo cello with long sustained legato notes, soft warm string pad, minor key, brooding documentary underscore, slow, sparse, very soft low pulse, gradually building tension, no drums, no vocals, no singing"; bpm 68, key D minor, **seed 11** (`audio/music/cand-11-40.wav`). Script `audio/gen-music.sh`.
- Candidates: seeds 11 (D minor), 33 (C minor), 22 (A minor). Round 1 (31 s asked) was discarded: every seed ended its audio at ~29 s (silence from 29.7 s), so the bed could not run to the 30.75 s cut; round 2 asked 40 s.
- Pick 11: onset autocorrelation peak at 0.88 s (= 68 BPM) with the strongest pulse (0.40; seed 33 0.08, seed 22 0.44 s/0.10), steadiest level (1 s RMS std 2.3 dB), lowest centroid class (787 Hz), LRA 5.3 LU on the bed alone but flat under the voice. Seeds 22/33 were louder and busier. Whisper (small.en) on the pick returns only "(soft music)" tags, no words.
- The bed had no build, so a +3 dB ramp over 19-28 s is applied (film-local ffmpeg volume). Cut: 80 ms fade ending at 30.78 s, silence after. 0.4 s fade-in.

## SFX (`audio/cues.json`, shape of `sfx.mjs`: `{t, type, gain, note}`; `t` = heard time in s)
26 cues, rendered with `--no-thin` (the thinning would drop the deliberate close pairs). One cue per hit-table row except f235 (none measurable): boom f11, whoosh+impact f33, tear f57, soft tap f72, impact f106, swell f130 (shimmer), whoosh f149, book-thud f182, pop f198, boom f212, thud-soft f290, swish f317, boom f349, whoosh-deep+stamp-wood f376, impact f401, whoosh f433, stamp-wood f458, knock f476, and 6 keys at 32.72/32.97/33.15/33.34/33.59/33.83 s. Times come from the table's measured audio times (they already lead the cuts by 2-3 f); boom/impact/thud/pop cues were moved 0.12 s earlier because those recordings peak ~130 ms after their anchor. Measured on the SFX stem: the peak of every shifted recording lands on the table time (+-0.3 f; the 6 shifted cues peak +2 f after their new `t`, i.e. exactly at the table time) and the others on their `t` (max error 1.2 f, one key). Ad hoc check, see gaps.

## Mix (`tools/audio/mix.mjs`, voice `voice/vo.wav`, `--sfx-gain 1.5 --fade-out 0.1`)
- Integrated -14.5 LUFS, LRA 2.6 LU (ref 2.2), true peak -1.1 dBTP, 48 kHz stereo, 34.625 s.
- Bed: -19.7 dB mean under speech (default sidechain duck of 8 dB; -12.5 dB in the gaps). SFX: -26.8 dB mean under speech, p90 -17.7 dB.

## Gaps
- `mix.mjs` needs a video and always writes AAC in mp4: workaround is a black 16 fps silent mp4 + decode to wav (AAC priming drops 75 ms, padded back). Fix: a `--audio-only`/wav output and a `--dur` option.
- `mix.mjs` pads a stem with `apad=whole_dur`, which did not extend the decoded wav in our ffmpeg; film-local pad used. 
- No tool to cut/shape a bed to a hard stop with a build envelope; done with an ffmpeg one-liner in `build-mix.sh`. Fix: `music.mjs --cut-at --build-db`.
- `gen.py` ends the audio ~8-10 s before the requested duration and has no stop-time control; always ask +10 s. Fix: a `--tail-pad` arg or a note in its header.
- No cue-onset verifier (stem peak vs `t`). Fix: `sfx.mjs --verify` using the sidecar's anchors.
- Library has no dedicated "drone hit", "shimmer" or "pillar sweep"; impact/swell/whoosh stand in. The reference mix cannot be A/B compared by ear here, only by numbers; SFX are at -18 dB (p90) under speech, so hits are subtle by design of `SFX_DUCK`; raise `--sfx-gain` if the owner wants them more present.
- `cues.json` is in `sfx.mjs` shape (`t`/`type`), not `mix-remotion.mjs` shape (`at`/`sfx`); `mix.mjs` itself reads no cue list.
