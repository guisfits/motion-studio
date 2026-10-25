# The take, the word times, the ASR check

The bar is `NORMS.voice.maxCer`, an intelligibility proxy, not a measured source. The voice tool and policy (draft voice vs final voice) come from the project overlay through the Director; do not pick a voice or vendor.

## Take

1. Voice the draft with the overlay's tool and narration format (`archive/engine-v1/skills/motion-engine/references/pipeline.md` section 1 shows the engine's `narration.json` and `words.json` shapes). A free draft voice for every iteration; a paid final voice only after the picture is approved.
2. Trim leading and trailing silence (~-45 dB, `silenceremove`) before aligning, so beats can hug the first and last word (`NORMS.sync.coverSlackS`, gate S9).
3. `voice/words.json`: one entry per spoken word, seconds, from forced alignment or ASR word timestamps, never from the script. Punctuation is allowed on `w` (gates strip it at the word edges and keep accents).
4. Run the metrics: `node <engine>/skills/film-writer/scripts/take-metrics.mjs <film>` prints F1 (last word end against `NORMS.film`), lead slack, speech speed against register A (3.0 words/s, 2.3-3.4), pauses over 0.4 s, the end of the opening line, and the caption chunks over `NORMS.caption.maxCps`. A film with a product segment passes `--app-t0 <s>` (start of the segment's first word) so F1 measures story and segment apart, as the stage gate does. Exit 1 = F1 red.
5. Pauses over 0.4 s should be the deliberate ones (before the turn, around a breath-card line). Others are cut in the take (retake with the punctuation fixed), never left as air and never closed with `atempo` or by editing `words.json`.
5b. **Fitting a take to fixed times** (an animated picture, or a target timing; S5): voice phrase by phrase — split at commas, periods and the deliberate pauses — and place each phrase at its start time; never stretch a whole sentence (tempo 0.6 reads as a slowed recording). Keep the voice one person across phrases: design it once (with S5's tool, OmniVoice: `--instruct "<sex, age, pitch, …>"`), then voice every other phrase with that first take as the reference (`--ref_audio`/`--ref_text`). Tempo per phrase stays within 0.92–1.1 (≤1.3 only for a 1–2 word phrase), each trimmed at −45 dB; mix the placed phrases into one track and transcribe it for `words.json`. S5 landed 82/82 words with a mean drift of 0.23 s (script: `studio/films/clone-van-gogh/voice/build-vo.py`). The tool stays the overlay's (step 1); this needs one that voices from a reference take (S5: OmniVoice, `mlx_audio.tts.generate --model mlx-community/OmniVoice-fp32`).
5c. **What 5b needs in practice** (S8 clone, 146 words, mean drift 0.215 s, client 9/10): design the voice with attribute keywords only (`--instruct "male, middle-aged, low pitch, british accent"`): a descriptive instruct ("calm documentary narrator, steady…") is read aloud into the take. `--speed` barely changes OmniVoice's length; fit with per-phrase tempo instead. A one-word phrase comes back silent: let it ride with the next phrase. Cache takes by a hash of their text, never by phrase index (re-chunking reuses a stale take). Never let a long phrase overlap the next: push the next start to the previous end + 30 ms and let the drift recover. Write the placed phrases (`start`, `end`, word range) to `voice/phrases.json`: those times are exact, so they, not whisper, anchor every cut and caption to the voice (whisper on the whole track drifts ~0.8 s inside long phrases and puts a phrase's first word ~0.3 s late). Where the reference runs straight on and our phrase ends early, fold the extra silence into the last word: anchoring the phrase end made a cut land 0.5 s before its word. Pattern: `studio/films/clone-bethlem/voice/build-vo.py`, `lib/make-anchors.py`.
6. Word-card sentences: consecutive word starts about 0.3-0.4 s apart (`playbook.md` W5). Number sequences: the end value is spoken once as the hold begins (`playbook.md` W6).

## ASR check

7. Transcribe `voice/voice.wav` with an ASR tool the project already uses (the overlay names it; record name and version). Set the ASR language to the film's language.
8. Normalise both texts the same way: lowercase, strip punctuation, collapse spaces, and spell numbers out in the transcript and the reference alike (the reference is the spoken form in `script.md`). Normalising one side only turns "noventa e cinco" against "95" into ~40% error on a short line.
9. CER = character-level Levenshtein distance between the normalised transcript and the normalised spoken text, divided by the reference length in characters, per line and overall:

```python
import re, unicodedata
def norm(s): return " ".join(re.sub(r"[^\w ]", "", unicodedata.normalize("NFC", s).lower()).split())
def cer(ref, hyp):
    r, h = norm(ref), norm(hyp)
    d = list(range(len(h) + 1))
    for i, a in enumerate(r, 1):
        p, d[0] = d[0], i
        for j, b in enumerate(h, 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (a != b))
    return d[-1] / len(r)
```

10. Pass = overall CER <= `NORMS.voice.maxCer`. ASR forgives stress, proper names, Latin and scripture references: listen once for those.
11. Over the bar: fix at the cause, in the highest-CER lines. Respell the word phonetically in the TTS input (never in the on-screen text), add a comma or break, shorten the line, split a compound, retake. Never edit the transcript or `words.json` by hand. At most two retakes, then send the case to the Director.
12. A name or term the ASR always misses is listed in `cer.md` as a known mismatch with its line id; the Director decides whether it counts. Never exclude it silently.

## `crew/cer.md`

```
tool: <asr name + version>   language: <the film's>   voice tool/policy: <from the overlay>
last word end: <T> s (NORMS.film: <min>-<max>)   speed: <w/s> (register A 2.3-3.4)   overall CER: <x.x> %
| line | reference (normalised) | transcript (normalised) | CER |
Known mismatches: <list or none>
Retakes: <n>
Metrics output: <paste the take-metrics report>
```
