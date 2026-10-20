# Brief: enrich Chris Moran's lessons with what is on screen

A first pass extracted lessons from his tutorial reels using the transcripts only. The client's
words: "technical learning and attention to detail are what make the difference". On screen he
shows After Effects panels, expressions and values he never says aloud. A deterministic OCR pass
read every frame at 2 fps. Your job: make every lesson complete and exact, and add what was missed.

## Paths

`M=<scratch>/moran`

Per reel `$M/work/<id>/`: `transcript.srt` (whisper; "Box" = Vox), `ocr-values.txt` (`<second>\t<text | text | …>`
— OCR of the screen, deduplicated, only lines with a value or a tool word; OCR misreads letters, e.g.
"viggle" = wiggle, "Multiyly" = Multiply), `sheet.jpg` (1 fps contact sheet), `frames/scene-NN.jpg`.
Existing lessons: `$M/lessons/lessons-{a,b,c,d}.jsonl` (one JSON per line; schema and the category
taxonomy in `$M/../moran-tools/extract-brief.md` — read it first).

## Do, per reel (your list below, in order)

1. Read the reel's existing lessons (`grep '"reel":"<id>"' $M/lessons/lessons-*.jsonl`), its `transcript.srt` and its `ocr-values.txt` whole.
2. For each lesson, fill `numbers` from the OCR when the screen shows them: effect names, parameter names and values, blend modes, expressions (verbatim code), fps, comp settings, keyframe timing, layer order. Fix `how` steps the screen contradicts or completes. Set `evidence` to the seconds you used ("ocr 16-20s").
3. Add lessons the first pass missed (a setting, a layer stack, an expression, a warning, a structure device). Watch the sheet when the OCR and transcript disagree or are thin, and open a scene frame when a value is unreadable in OCR.
4. Never invent: a value you cannot read stays "not stated"; a guess is `"~<value>"` with confidence medium.
5. Write the complete, final set for each reel — corrected old lessons plus new ones, same schema — to `$M/lessons/enriched-<batch>.jsonl`, then `{"reel":"<id>","done":true,"lessons":N,"added":K,"from_ocr":V}` (V = lessons whose numbers came from the screen). Write only that file. Do not edit the old files.
6. Paraphrase; code expressions may be copied verbatim (they are settings, not prose).

Return (≤ 6 lines): reels done, lessons before → after, how many got screen values, unreadable spots.
