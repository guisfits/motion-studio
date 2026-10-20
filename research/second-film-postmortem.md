# Second film postmortem: "Arrependei-vos" (AdScriptura, 2026-10-15 → 10-19)

The second film made with crew v2, and the first the client scored **10/10** ("ESSE VÍDEO É 10/10",
draft v18, 111 s, 9:16). It took 18 drafts. This file records what made it work, what cost rounds,
and the rules that came out of it, so the next film starts where this one ended. Ids: client notes
are quoted with the draft they were given on; `R<n>` are the rules (each lives in a skill now; R2 is unused).

## What worked (keep doing it)

| # | Practice | Evidence |
|---|---|---|
| W1 | **Paper events, not pasted pictures**: every scene is a verb the paper performs (tear, cut, stamp, drop, carry, page turn) | client "animação, áudio, recortes, tudo muito bom" (v12); 10/10 (v18) |
| W2 | **Show, don't ask**: every step went to the client as the artifact itself (frames, audio, mp4), never a question in text | 18 drafts, each answered with timestamped notes the crew could act on |
| W3 | **Client notes become skill rules the same turn** | ~25 rules added during the film; repeated notes stopped once a rule existed (except pop-ins, see E5) |
| W4 | **Focused script**: one objective sentence at the top; every line serves it; threads cut, not syllables | 314 → 163 words; "muito longo e cansativo… perde o foco" → fixed in one round |
| W5 | **Picture first, voice fitted** (R7): approved events keep their durations; the voice gets `pause`s, rephrasing, cuts | stopped the "fix one thing, break another" loop (v14 → v15 onward) |
| W6 | **Fresh agent per round with a lean brief + the client's words verbatim**; the director watches the result before sending | rounds v15–v18 each closed the notes they were given |
| W7 | **Fact-check every reworded line, pragmatically** (gaffes and lies only) | caught the one real error: the cross attributed to Thesis 1 (it is Lk 9:23) |
| W8 | **Real app takes in the 3D phone**, re-recorded when the data on screen is wrong | held works shown in a take → re-recorded with release visibility |
| W9 | **Free local voice tools** (OmniVoice draft, phoneme check, casting by cloning library previews) before any paid take | all drafts cost US$0 in voice; casting ≈ US$0.5 |

## What cost rounds (errors)

| # | Error | Cost | Root cause | Rule now |
|---|---|---|---|---|
| E1 | Story ran 135 s with a calm, slow read | v12 rejected by the client and friends: "longo, cansativo, a voz dá sono" | an earlier "instructive, 1–2 min, calm" rule pushed length and slowness | R1 story ≤ ~90 s + 15–30 s app; lively voice, joins 0.15–0.3 s (`NORMS.film`, director, writer) |
| E2 | Re-cuts compressed approved animations to fit the shorter voice (scissors lost, strips rushed) | v13–v14, "eu te peço pra arrumar uma coisa e vc estraga outra" | the sheet was re-derived from the words; events followed the voice | R7 picture first (director/storyboard/animator/writer Never) |
| E3 | Hard cuts between scenes | v13 "corte brusco" | editing grammar §3 says hard cut by default (true for the pros' pieces, wrong for this client) | R3 animated paper join between scenes; hard cut only inside a scene |
| E4 | Frozen cut-outs / strips hanging | client said it "10x" (v13–v15) | strips parked in frame waiting for their time | R4 a cut-out moves from its first visible frame (animator tell 12) |
| E5 | Pieces popping in | v13, v15, v17 (1:13, after two reviews) | reviews watched contact sheets at 1.5–4 fps; a pop-in lives between two frames; no gate checks entrances | R5 every piece enters from outside the frame or from under another piece; reviewer tell 0 (entrance audit from code + stills); gate wanted (H-1) |
| E6 | Misread a note ("replace the sheet with the cover") and removed the approved Vulgate page | one round (v15 → v16) | the director rewrote the note into a brief without checking which "folha" the client meant | R6 when a note names a piece ambiguously, find it on the frame at that timestamp and say which one in the brief |
| E7 | Enter-and-leave pieces and ground ping-pong (tan → red → tan in 3 s) | v14 1:05 | each scene built alone; nobody looked at the passage | R8 one ground per passage; a piece that enters only to leave is a defect (animator tell 13) |
| E8 | Generic stand-ins (a plain sheet for "the Vulgate") | v13 0:25 | archivist/animator used what was at hand | R9 the named object is shown, recognisable (animator tell 14) |
| E9 | "Mas" with nothing to contrast after a cut | v13 0:50 | lines shortened independently | R10 every connective earned (writer 8c) |
| E10 | Over-zoom cropped the hero out (door scene) | v16 0:09 | push sized to the sheet, not to the person | R11 the person stays in frame through any push (animator tell 4) |
| E11 | Visible action without its sound (scissors) | v15–v16 | the engine's `scissors` action had no `anchor`, so the cue played the file's lead-in | R12 every visible tool action has its cue at contact (sound tell 0a); engine `8d81651` |
| E12 | Music bed clashing with the closing bell | v15 | bed ran to the end | R13 bed fades to silence by the close line (sound step 6; `animatic-sfx.sh`) |
| E13 | Foreign/pt-BR words mispronounced ("léxico", metanoeîte) | v8, v15 | TTS guesses | R14 respell in `say`; phoneme check for foreign words; ear over metric (overlay voice.md) |
| E14 | Personal data sent in a download header | one request (v14) | an agent hand-built a user-agent | R15 downloads only through the kit tools; no personal data in headers/URLs (archivist) |
| E15 | Process: fix rounds stacked on a 350k-token agent; one wrong long brief = one wasted render (~30–50 min) | time | resuming tired agents; briefs without the client's exact words | R16 fresh agent per round, client words verbatim, director watches before sending |

## Harness gaps found (engine follow-ups)

| # | Gap | Proposed fix |
|---|---|---|
| H-1 | No gate sees a pop-in (closed: T12, `9dbe46b`) | a trace check: for each piece, its first visible frame's box must touch the frame edge or be covered by another piece |
| H-2 | (closed) T4 flags a slip entering from the edge (the move R5 asks for) | T4 exempts a piece in its entrance/exit motion |
| H-3 | (closed: arrivals counted) R1 counts sheet rows only, not in-scene events → red on every instructive film | count trace hero/piece events, or refit the instructive norm on this film |
| H-4 | (closed: S11) S3/S5 missed sheet rows that no longer matched the re-voiced words | a sheet check: each row's key word time in `words.json` inside the row's span |
| H-5 | (closed) SFX library files with lead-in (quill, post-it) play their silence | `anchor: "contact"` on every action whose file has a lead-in; a test |
| H-6 | (closed) Board media budget (13 MB total) is from an old host limit; the full draft can't go on the board | per-file limit (15 MB) instead of a page total |
| H-7 | (closed) T5 flags frame 0 on an approved bare-ground open | T5 ignores the first 0.3 s when the scene declares an entrance |
</content>
</invoke>
