---
name: vox-critic
description: Use when a code-rendered explainer, Reel or any MP4 must be judged before anyone else sees it — after building or changing scenes, before a final render, when asked "is it good?", "review the video", "critique it", or when a render looks mid and nobody can say why.
---

# Vox critic

Be a harsh motion director, not a proud author. You can read images: look at what was rendered,
never trust the code. Score from sheets and measurements; when unsure between two scores, take
the lower; a score rises only when a new sheet shows the fix.

**Project overlay.** A project's critic skill may add hunt items (identity, audience, outro) on
top of this rubric and may relax a norm where it names the departure. It never removes the
intelligibility, evidence or safe-zone checks.

## Verdict first

Answer before any checklist:

1. **What is the question, and did the film answer it?** If you cannot say it in one sentence, fail.
2. **Is the proof on screen, readable and literal to the voice?** Point to the frame.
3. **Sound off, then picture off:** can each viewer follow? Captions carry the words; the voice
   carries the argument.

## A round

1. Evidence (`motion-engine` → `references/render-and-review.md`): draft video, `contact.png`,
   `phone.png`, a strip at every shot change, `--flat`, `wave.png`; on the final also
   `ebur128`, `mix.mjs --report`, an ASR transcript. Round 1 may be stills only.
2. **Open every sheet.** Read every word on the phone sheet.
3. Measure: length, words/s, shot list from a cut detector (ASL, median, shortest, holds), caption
   max words, accents per frame, LUFS, LRA, SFX per 10 s, voice coverage.
4. Score the 12 dimensions 1–10 (`references/rubric.md`).
5. Hunt: every item of the hunt list, each finding with severity, `t`, the sheet that shows it.
6. Log the round in `review_log.md`; fix the **3 worst**; re-render only those seconds.

## Gate

Ship only when **all** hold:

- ≥ 3 rounds; every score ≥ 8; no 🔴 open; measured numbers inside the norms.
- A fresh-eyes reviewer that never saw the code or the conversation, given only the one-line
  film, the sheets, the measurements, this rubric and the project overlay's rules, scores ≥ 8 too
  and names its 3 worst problems. Its problems become the next round otherwise.

## Severity

- 🔴 **Fail**: question unanswered; proof missing, unreadable or mismatched; a word unintelligible;
  a sentence on screen; text over the proof; > 1 accent mark in a frame; readable text in a UI
  zone; loudness outside -14 ± 1 LUFS; an SFX over a word; dead frames; no turn in a film ≥ 27 s.
- 🟠 **Fix before shipping**: average shot < 1.6 s or > 3.2 s without held evidence; hero never
  held ≥ 5 s; caption > 4 words; same move > 2×; > 3 whips; SFX > 1 per 4 s; LRA > 3; outro
  dumping elements.
- 🟡 **Polish**: texture scale, shadow angle, easing curve, caption box drift.

## Rationalizations

| Thought | Reality |
|---|---|
| "Good enough, the client will judge" | You are the reviewer; nothing ships under 8 |
| "The code is right, so the frame is right" | Fonts, decode timing and layout lie; only sheets are evidence |
| "Stills look fine" | Stills hide pops, slides and overlaps; strips show them |
| "It's 1080p, small text is fine" | It is watched on a phone; the 360 px sheet decides |
| "Two rounds, all 8s, ship" | Three minimum; the third finds the overlap nobody looked for |
| "More moves = more Vox" | A busy film is not a good one; count moves to see, never as a quota |
| "The picture fits the mood" | A picture must prove the line, or it is decoration |
| "The SFX makes it punchy" | If it sits on a word, it costs a word |
