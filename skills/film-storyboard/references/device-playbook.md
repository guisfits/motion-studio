# Device playbook (storyboard)

Each device: when the line asks for it, how it is written in the sheet (fields in
`sync-sheet-fields.md`), the measured range with evidence ids (`research/editing-grammar.md`), the
tell and its fix. Register A numbers unless marked; `~` = inference. Executing the move, the entrance
or the transition is the animator's; building the stage is the art director's; you decide where and
on which word.

## Rows: one picture per phrase (grammar §1 "Phrase-locked cut", §10.1–10.2)

- When: every row. **New row** when the line introduces a new noun, place, person or number (`ee/DaAV2R5IuSi` "every spoken number or noun gets its own picture"; `hex/DQepYZ4CfSt`). **No new row** when the clause continues about the same subject, the plate needs reading time, or the line flips its own words; the caption changes on the held picture (`hex/DY_8VpvCpeO`, `hex/Dd0qOzpqoYf`, `hex/DcG_IX3P3vI` (C)).
- How: a row starts on the onset of the word that names the new picture (`hex/DN-WcdHiZCs`); at most two picture rows per phrase (`hex/DSA2Hs3k06k`). A list sentence becomes word-speed rows, one per item (`zhylin.md` 3; `hex/DPgS8B7CZoY`).
- Measured: new picture every ~4.5 words (2.7–8.3) / ~1.6 s (0.9–3.0) `~`; one edit event per 3.5 words (2.1–5.5); ~20% of events keep the picture (6–51%) `~`. R1–R3 measure the animatic against `NORMS.rhythm`.
- Tell: a picture over a whole idea (10+ words), or a new picture for every word on one subject. Fix: split on nouns; merge rows that continue the subject.

## Hold on the point (director's placement, grammar §1 "Burst, then hold on the point")

- When: the pace plan names it: the key number, the conclusion, the document or footage that is itself the evidence (`hex/DUiOWpiCare` ~2.8 s; `hex/DdbK-PAT7O6` (C) 8.6 s).
- How: the burst before it as short rows; the point as one row with `device: "hold"`; give it a second event inside (a mark, a support, a slow push) so it never reads dead (`zhylin.md` 4; `NORMS.frames.deadWindowS`).
- Measured: longest shot per piece 4.6 s (2.9–7.8); bursts of 3–12 sub-second events before it (`hex/Dc3B4rcCH18`, `ee/DZuVqDpO0Um`).
- Tell: holds where the plan has none, or a hold on filler. Fix: only the plan's points.

## Paper breath card (grammar §1)

- When: the brief's slots: a date, a one-line fact, a statement with no honest picture, after the hook, before the answer, a negation (`hex/DbnDiSLCtax`, `hex/Dbc-vIXCCqe`, `ee/Dbp5HyyOmsR`, `ee/DcaqrJkOiD3`, `hex/DdI4HMVi99s`).
- How: a row with `device: "breath-card"`, hero = one shared card asset for the film (`breath-card`, source drawn; `zhylin.md` 1: build the shared card once), `why` = "rest before …". The next row cuts straight into a picture that already carries the next line (`hex/DbnDiSLCtax`). Call-and-response (`ee/DZC3QoBoN_B`): picture row and card row alternate.
- Measured: 0.8–1.5 s cards, 0.3–0.5 s spacer words; one every 10–20 s.
- Tell: a decorative stock picture where the line has none (craft §2.7). Fix: the card.

## One word per card (director's line, grammar §7)

- How: one row per word, `device: "word-card"`, same card asset, ~0.3–0.4 s each (`ee/DcD4mcfIgey`). Only on the line the brief names.

## One prop per phrase (grammar §4)

- When: a held ground whose line lists things ("No meters. No bills.").
- How: the first row sets the hero (the ground or stage); each following row repeats `hero.asset`, adds the new prop in `support`, `device: "one-prop"`, `key[0]` = the prop's word. The beat resets with a hard cut to the empty ground (`pin/349959` (C)).
- Measured: ~0.7 s per prop (`hex/DZrkiVFCxe5`); one prop per key noun, one word per second (`ee/DUiSq11jO4R`).
- Tell: all props on at once (no hierarchy, postmortem K3). Fix: one per word.

## Punch-in to the named detail (grammar §2)

- When: the line names a detail of the picture: the ticket (`hex/DcapWBnCHCh` ×2.9), the eyes on "lost the left eye" (`hex/DZmh9k_C2cp` ×1.5), a watch dial (`hex/DPwBS-mCRuS` ×2.02).
- How: `zoom.kind: "punch-in"`, `zoom.target` = that part, `key[0]` = the word naming it. At most 2 per film: T7 caps punches ≥ `NORMS.camera.punchMax`, and the evidence makes it an accent (grammar §12.2). Ordinary emphasis is `push-in`: the animator builds it at a scale change of at least `NORMS.camera.emphasisMinScaleDelta` inside one shot (T7 reads every `push-in` and `pull-out` row). The measured median push (×1.14) sits just under that line, so a gentler move is not a `push-in` row: write it as `drift`, the never-static motion T7 does not read.
- Measured: push ≥ 1.5 in 72/165 pieces, ≥ 2.0 in 29/165, 3% of push-ins.
- Tell: punching every beat (Moran's habit, contradicted). Fix: two, on named details.

## Pull-out reveal (grammar §2)

- When: from a detail to its context, a face to the room, the closing wide (`hex/DeYtNniiUHe`, `hex/DW522AEAhOq` scale reveal, `ee/DZuVqDpO0Um`); the brief's ending.
- How: `zoom.kind: "pull-out"`, `zoom.target` = the part the move starts on; the closing pull-out lands on a composition whose pieces were placed during the film (craft §2.10). List in the picture list which assets must be on the final frame.
- Measured: pull-out zoom median 0.87 (0.67–0.95); 115/165 pieces pull to ≤ 0.8 at least once.
- Tell: pull-out onto a smear or a tiny unreadable board (postmortem C6). Fix: a composed, readable final frame.

## Into the screen or frame (grammar §2)

- When: setup → product, person → their story, world → screen (`ee/DUGJjUEjO_I`, `ee/Da2XkSfOy7h`, `pin/350010`).
- How: `zoom.kind: "into-frame"`, `zoom.target` = `<hero>.screen` (or `.frame`, `.window`); the next row's hero is what the screen showed.

## Vertical move on a tall subject (grammar §2)

- When: a tower, a rope, a skyline: 9:16 shows it whole by moving, not cropping (`hex/DUQRqS2icUB`, `hex/DeTi33ICNIC`, `hex/DcapWBnCHCh`).
- How: `zoom.kind: "tilt"`, target = the part the move ends on.

## Match cut on shape or object (grammar §3)

- When: a shape or object can carry across two pictures: circle to eyeball (`pin/350021` (C)), market → planet (`ee/DebtJlmO-89`), the same prop across two people (`hex/DcF_qVxqsaA`), each exit object the next entrance (`ee/DdI5hwFuoI6`).
- How: `join: "match"` on the incoming row; both rows name the matching part in `zoom.target` (`a.disc` → `b.eye`); keep the motion direction across the cut (`moran/DPcvDgNDNM4`).

## Container opens (grammar §4)

- When: "one condition", a file, a ledger: the content comes out of its container (`hex/Dc3B4rcCH18`, `hex/DdvgHQcIWYy`, `ee/DcJM47zIj-t`).
- How: row with `device: "container"`, hero = the container, supports = what comes out (≤ 2; more become a grid).

## Multiply one cut-out into a crowd (grammar §4)

- When: "thousands", "everyone", "nine in ten": one figure becomes many (`hex/Db-UqYwiqT5` 1 → 40; `hex/DeOZeaQCs6q` 3 → 12 → 24; `hex/DXEP5DogtTK` 9 of 10 vanish).
- How: rows repeat `hero.asset`, `device: "crowd"`, one row per count step on the spoken number; the archivist needs one clean cut-out, not many.

## Position-locked swap (grammar §4)

- When: same frame, one spot changes: role words on one figure (`ee/DcijzMlOiKS` ~1.1 s), faces in one slot (`ee/Ddn42dGOwnB` 0.4 s), the claim replaced in the same box (`ee/DUZvCOriq0d`).
- How: rows keep the hero (the frame), the swapped item is `support[0]`, `device: "position-swap"`.

## Evidence board (grammar §6)

- When: the line says who links to whom (`hex/DY4QF50i64w` string pin to pin with a ×1.9 push; `hex/DeL0qoEvYmD` (C)).
- How: one board hero held across rows; each link is a row on the word that names it, `device: "evidence-board"`, the two linked items as supports; the board grows, it is not shown complete.

## Grid or mosaic for "many" (grammar §6)

- When: a count the eye should feel: 16 tiles = "900 paintings" (`hex/DbNcjZ2iwUc`), a 6×5 wall with one circled (`hex/DWlRxTpAkLW`), one corrupted tile is the point (`ee/DRzcFdBjDPG`).
- How: `device: "grid"`; hero = one grid asset (or a reused plate), the off-pattern hero as `support[0]`, a `push-in` or `punch-in` into it.

## Scale contrast (grammar §6)

- When: small against vast, one against many, the underdog (`hex/DTICqkGibPm` ~3% figure; `hex/DZ7O_jiit4O`; `ee/DcijzMlOiKS` many small, then one at 80% width).
- How: `device: "scale-contrast"`; the `why` says which is small and which is big; the picture list names both sizes for the archivist (resolution for the big one).

## Reuse one plate or asset (grammar §6)

- When: one place or object carries several beats; only the population changes (`hex/DeOZeaQCs6q` one corridor for 6 beats; `hex/DaaSLUAidHC` one map for 5).
- How: the same `hero.asset` across rows; it is one manifest entry, used by several beats. Also the bookend: the close reuses the opening plate (`ee/DdlOmjlOR0b`).

## Shared rules

- Hierarchy: one hero, ≤ 2 supports per row (grammar §6 "One hero on a quiet ground"; §11 #2 "No focal point"). "Many" is a grid, a crowd or a burst, never a pile.
- Zoom target: a visible, named part with room around it (postmortem K1, C7); the animator must be able to frame it inside the safe margin (T9).
- `zoom.kind` varies between adjacent rows (`research/external-skills.md` "Storyboard", anti-monotony); a word-speed burst may hold the camera still and let the cut be the move (grammar §2 "Never-static still", exception: `hex/DXUEoamgkj5`).
