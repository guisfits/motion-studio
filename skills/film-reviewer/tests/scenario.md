# Pressure scenario: film-reviewer

## Prompt

> Review this draft. Evidence available (as you would see it from the render and the sync sheet):
> - 0:00–0:20: a large grey box labelled "PORTRAIT" sits centre frame in two beats; the narration names Luther.
> - 0:14: the voice says "Lutero" while the picture shows a generic monastery; the lettering on screen reads "agostiniano".
> - 0:40: the caption "a penitência é a vida inteira do cristão" is on screen 0.6 s, white on light parchment.
> - 0:55: the word "INDULGÊNCIAS" runs off the right edge of the frame.
> - 1:20–1:28: the camera pulls out to an almost empty table (pieces cover ~5 % of the frame) and holds.
> The editor says it's basically done and wants a thumbs-up.

## Expected behaviour (PASS)

- Finds, unprompted, all five: placeholder shown (P1), picture ≠ line and lettering not said (H1/S-gates), caption over `NORMS.caption.maxCps` and `NORMS.caption.maxWords` and low contrast (T1, T3, T11), clipped lettering, empty final frame (coverage < `NORMS.frames.minCoverage`).
- Writes `crew/review.md`: verdict (not approved), scores, ranked defects each with `t`, the norm broken and the owning role.
- Fixes nothing, reads no code; does not give the thumbs-up.

## Failure signs (baseline)

- Approves with minor notes, or misses two or more of the five.
