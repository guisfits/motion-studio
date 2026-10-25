# Pace playbook (director)

Each device: when to use it, how it travels through this engine (which artifact carries it, which
role executes it, which gate measures it), the measured range with its evidence ids, the tell and
its fix. Numbers are register A (grammar §0, §10) unless marked; ids are cited as in
`research/editing-grammar.md` ("Reading the citations"). Gate thresholds are named by their
`NORMS` key, never restated.

## Register

| Register | Pick it when | What changes |
|---|---|---|
| **A** narrated 9:16 collage explainer (default) | there is a narrator and the film is vertical | every rule below; `NORMS.rhythm` is A's p10–p90 |
| B music-led or silent | no narration: lyric type, sting, loop | events lock to the music, not to words; R1–R4 do not describe it (grammar §0: ASL 3.21 s, bimodal) |
| C narrated 16:9 essay | landscape, footage-led | ASL 0.96 s (0.49–4.18); one map or grade as the stage (`hex/DeL0qoEvYmD`, `hex/DeGwAnTCJqI`) |
| **A-i** instructive narrated explainer | the brief says "instructive", ≤ ~90 s story + 15-30 s app (client, 2026-10-19) | `NORMS.registers.instructive` replaces `NORMS.rhythm` and the camera caps (the sheet declares `"register": "instructive"`); the cuts follow the phrase, not the word |

- How: one line in the brief (`Register: A`) and why when not A. The crew reads it; the gates are calibrated for A only, so in B or C you write which R codes you waive and why.
- Tell: B's overlap and crop tolerance used under narration (`ee/DausEm8OxlC`, grammar §0). Fix: one register per film.

## Phrase-locked cut (grammar §1)

- When: always in A. Every clause gets its picture; the word-speed variant only for a run of names, stats or hype (`hex/DUiOWpiCare`, `hex/DPgS8B7CZoY`).
- How: the writer gives one new noun per clause; the storyboard makes one picture row per new noun, place, person or number (§10.2); the animator changes the caption chunk inside held pictures. R1 (`NORMS.rhythm.aslRange`), R2 (`NORMS.rhythm.eventsPer10s`) and R3 (`NORMS.rhythm.wordsPerEvent`) measure it on the animatic trace.
- Measured: 1 event / 3.5 words (2.1–5.5); ASL 1.17 s (0.71–2.05); events / 10 s 8.3 (4.7–13.8); new picture every ~4.5 words (2.7–8.3, `~`); the first 3 s cut at the body rate (ratio 1.03).
- Tell: the voice outruns the picture (`hex/DNDJyk8pizL`). Fix: the picture lands on or before its noun (H1, `NORMS.sync.heroWindowFrames`). Tell: hooking with faster cuts. Fix: the hook is the line and its picture (§1 "Opening-line formula").

## Burst, then hold on the point (grammar §1)

- When: "everyone says X" then the argument (`hex/DcG_IX3P3vI` (C)); a list that resolves into one idea (`ee/DdI5hwFuoI6`); the key number or conclusion (`hex/DUiOWpiCare` ~2.8 s); footage or a document that is itself the evidence (`hex/DdbK-PAT7O6` (C) 8.6 s).
- How: the pace plan names the hold points by brief beat; the storyboard writes the burst rows short (one per noun) and marks the hold row `device: "hold"`; the animator keeps the held picture alive (never-static still, idle life), because a hold never freezes (`NORMS.frames.deadWindowS`, M1; R-gates allow holds through the average).
- Measured: longest shot per piece 4.6 s (2.9–7.8); 6% of shots ≥ 3 s, 34% < 0.5 s; bursts of 3–12 sub-second events before the hold (`hex/Dc3B4rcCH18`, `ee/DZuVqDpO0Um`, `ee/DdI5hwFuoI6`).
- Tell: all-even pacing, or holds on beats that carry nothing. Fix: 2–4 holds per film (`~`), each on the point the brief names; still holds ≥ 4 s are rare (4/165) and need camera or idle motion.

## Paper breath card (grammar §1; placement is the storyboard's, the line the writer's)

- When: a date or one-line fact (`hex/DbnDiSLCtax` "It's 1932."), a statement with no honest picture (`hex/Dbc-vIXCCqe`), after the hook (`ee/Dbp5HyyOmsR`), an emotional low (`hex/DbNcjZ2iwUc`), right before the answer (`ee/DcaqrJkOiD3`), a one-word negation (`hex/DdI4HMVi99s`).
- How: the brief lists breath slots; the writer writes their lines; the storyboard places them as rows with `device: "breath-card"` and a shared card asset; the art director gives it paper, never flat white.
- Measured: cards 0.8–1.5 s; spacer words 0.3–0.5 s; one every 10–20 s (3 in 65 s `hex/DY_8VpvCpeO`; 6 in 56 s `hex/DbnDiSLCtax`). Instructive register: a settled hold of >= 1.0 s after every definition, number or answer (inferred; no Moran lesson).
- Tell: a film with no rest, or a card longer than its line. Fix: a slot every 10–20 s; the card cuts straight into a picture that already carries the next line.

## Hard cut on the sentence (grammar §3)

- When: only when the cut is itself continuous (the shape, direction or motion carries over it), or the project overlay names it as its default join. Otherwise the default is a carried, motivated transition (`film-animator` step 9); the project overlay on the `Film style:` line owns house joins.
- How: a sheet row with no `join` (or `join: "cut"`) is a hard cut on its first word. Flash, blur or paper-wipe frames over a cut are the animator's craft and stay short (grammar §3); they are not dissolves.
- Measured: soft transitions 0.28 / 10 s (hex median 0); 75/165 pieces have none; 99 shots all hard cuts (`hex/DX6M6NCCWyE`).
- Tell: a cut that jumps (no shared shape, direction or motion), or soft joins as decoration. Fix: carry the eye across, or list the reason in the brief.

## Dissolve reserved for time or mood (grammar §3)

- When: a time jump (`hex/DYy1TUWufoF` "dissolves signal time passing, cuts signal a new fact"; `hex/DcF_qVxqsaA` for "Today"), one chapter turn (`hex/DN-WcdHiZCs`, its only dissolve), a quiet argument (`hex/DaaSLUAidHC`), a sombre close (`hex/Daug-7bC4ZY`), the payoff (`hex/DbnDiSLCtax`, 2.7 s, "reserved for the payoff"). Footage cuts hard; graphics may dissolve (`hex/Dc-vZs9CkUT`).
- How: the brief's join list (beat → reason); the storyboard writes `join: "dissolve"` on the incoming row; the animator times it.
- Measured: of soft events 28% last ≥ 0.6 s; 61/165 pieces have at least one; 0–2 per film is the common case (`~`).
- Tell: a dissolve with no time, mood or payoff to carry. Fix: a carried transition or a continuous cut.

## Palette flip marks a structural turn (grammar §3, §8 "Grade carries the mood")

- When: the story turns: colour → B&W as it turns bad (`hex/DY_8VpvCpeO`), colour at the peak and B&W at the fall (`ee/Da2XkSfOy7h`), black card for the negative and white for the answer (`hex/DXOey6vghtu`), dark → light for the hopeful turn (`hex/DeL0qoEvYmD` (C)).
- How: the brief names the turn beats and the direction (warm → grey, dark → light); the art director sets the grounds and grades; the storyboard puts the turn on a row boundary.
- Tell: every act a different flat colour with no reason (postmortem K7), or a style switch at the end (`pin/349992`, grammar §11 #4). Fix: flips only at named turns; one colour world per side.

## Decelerating ending (grammar §1, §10.5)

- When: always in A.
- How: the brief says how the film closes: a bookend on the opening device (`ee/DcJM47zIj-t`, `ee/DdlOmjlOR0b`), the last word small and alone on paper (`hex/DPwBS-mCRuS`), a pull-out onto the composed whole (storyboard's "Pull-out reveal"; craft §2.10), a quiet card. R4 checks `NORMS.rhythm.endSlowdown` on the draft.
- Measured: last 5 s at 4.0 events / 10 s against 8.5 in the body (0.53×); last shot 2.2 s (0.3–5.6).
- Tell: the CTA breaks the register (`pin/350009`, `ee/DcD4mcfIgey`); a pull-out onto a smear or a tiny unreadable board (postmortem C6, K9). Fix: the close lives in the film's world; the last composition is built during the film and held.

## One word per card (grammar §7)

- When: a line delivered with deliberate pace, a tagline (`ee/DcD4mcfIgey` ~0.4 s per word; `ee/DdtaQr_O7w7`).
- How: name the line in the brief; the writer keeps it short; the storyboard writes one row per word with `device: "word-card"`.
- Tell: used for body narration, where it outruns reading. Fix: once per film at most (`~`).

## Contradictions you rule on (grammar §12)

- Moran "cut on action" (§12.1): contradicted for fast narrated collage, the voice covers the cut; in the instructive register a cut still needs both pictures in motion (drift or settle, never a dead hold), so the edit is not announced (`moran/DOb0h6VCSpM` 0:21-0:24).
- Moran "punch 1×↔2× a lot" (§12.2): a rare accent; T7 caps punches ≥ `NORMS.camera.punchMax` at 2 per film.
- Moran "Posterize 12 fps = Vox" (§12.3): a house style, not the genre rule; the art director and animator choose it per sources.
- craft §2.8 "hook inside 1.0–1.5 s" holds for the line, not the cutting (§12 note).
