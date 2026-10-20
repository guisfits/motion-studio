# How the Moran lessons were extracted

1. `yt-dlp` each reel into `cache/media/`.
2. `core/reference/tutorial-prep.sh cache` — whisper transcript (small, with a vocabulary prompt), scene frames, 1 fps sheet.
3. `core/reference/tutorial-ocr.sh cache` — Vision OCR of every frame at 2 fps; `ocr-values.txt` keeps the lines that carry a setting (After Effects panels, expressions).
4. `extract-brief.md` (first pass, transcript) then `enrich-brief.md` (second pass, screen values) → `lessons.jsonl`.
