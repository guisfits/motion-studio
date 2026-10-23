# Collage study: finished pieces, measured

Finished editorial-collage / paper / magazine animations the client chose as the look to learn
from (2026-10-15): the Pinterest board `guisfits138/vox-animations` (27 videos, 114 stills) and the
Instagram accounts `@hex_creatives` (120 reels) and `@earn.edits` (80 reels; 3rd-party tool
showcases skipped). Duplicates across and within sources removed by perceptual hash.

What was learned is about **editing** (rhythm, camera, cuts and transitions, entrances and exits,
piece motion) and **composition** (layers, hierarchy, type, colour and texture, cut-out craft, and
what looks odd), never about content.

- `findings.jsonl` — 1291 findings, one per line: `source`, `src` (post id), `kind`, `t`, `area`,
  `finding`, `measure`, `why_it_works`, `use_when`, `confidence`; plus a `done` line per piece with
  its ASL and events per 10 s.
- `study-brief.md` — the brief every study agent followed.
- How each video was measured before anyone looked: `tools/kit/reference/study-prep.sh` runs
  `tools/kit/reference/editing.py` (OpenCV: picture events with camera-move compensation, per-shot camera
  move — zoom, pan, rotation, speed peak, stepped/posterized — and frames around every event) and a
  2 fps contact sheet.
- `cache/` — the media, measures and frames (git-ignored: the pieces are their authors' work).
