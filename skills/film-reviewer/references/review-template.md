# review.md template

Copy into `<film>/crew/review.md`. Keep every heading. Facts and frames, no fixes. Times in seconds (`12.40`), frames at `NORMS.fps`. A row without a `t`, a frame, a norm and an owner is not a defect yet.

````markdown
# Review — <film> — round <1|2> — <animatic|draft|final>

**Verdict: NOT APPROVED**   <!-- APPROVED | NOT APPROVED | ESCALATE (animatic: CLEAR | NOT CLEAR) -->
Lowest score: D<n> <name> = <n>   · 🔴 <n>  🟠 <n>  🟡 <n>
Gate: zero 🔴 [yes/no] · every applicable score ≥ 8 [yes/no] · inputs complete and fresh [yes/no] · three passes done [yes/no]

One line why: <the one sentence a director can read aloud>

## Inputs seen
- render: <path>, <duration s>, <WxH>, <fps>, <size>
- sync sheet: <path>, <n> beats
- checks: <checks-stage>.md — <PASS/FAIL, 🔴 n 🟠 n>, newer than render [yes/no]
- not given / not read: code, brief, crew notes, conversation (by design)
- could not hear: <yes/no, what>

## Cold read (written before the sync sheet)
- About: <one sentence>
- Claim in the first 3 s: <one sentence>
- Frame I remember: <t, what>
- Lost or bored at: <t, why>

## Measures (render only)
- Cuts: <n> in <D> s, mean shot <s>; per 10 s: <list>; longest hold <s> at <t>; dissolves: <n, where>
- Last 5 s: <cuts> against body <cuts per 10 s>; last shot <s>
- Checks said R1 <value> R2 <value> R3 <value> R4 <value>: agree with the measure [yes/no, gap]

## Scores
| Dim | Name | Score | Evidence (one line, with t) |
| --- | --- | --- | --- |
| D1 | Hook and opening | | |
| D2 | Voice = picture = lettering | | |
| D3 | Rhythm | | |
| D4 | Captions | | |
| D5 | Lettering, type and annotation | | |
| D6 | Composition and focal point | | |
| D7 | Camera | | |
| D8 | Motion of pieces | | |
| D9 | Material | | |
| D10 | Colour, register and consistency | | |
| D11 | Sound | | |
| D12 | Ending | | |

`not heard` / `not seen` / `not assessed (reason)` goes in the Score cell with the cap applied (≤ 7).

## Defects, ranked
Order: 🔴 before 🟠 before 🟡; inside a level, first-watch visibility, then earlier `t`.

| # | Sev | t (s) | Frame | Dim | What the viewer sees | Norm broken | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 🔴 | 14.00 | `review-frames/t14.00.png` | D2 | <fact: what is on screen against what is said> | H1 | storyboard and archivist |

A row: **What** is an observation with numbers (a duration, a coverage %, a word and where it is), never a remedy. **Norm** is a `NORMS.*` key, a gate code, `odd #n` / `grammar §x`, `tell n` / `C3` / `K4`, or `none` plus what a check would measure. **Owner** is one role (two with "and"). **Frame** is a file you saved.

## Checks files said (and the eye)
- <code> <t>: <copied from checks-*.md, with its severity> — included as #<n>
- Green gate, broken picture: <t, what, why the gate missed it>
- Red on the checks file I could not see in the render: <code, t>
- Gate against grammar (e.g. T5 on a quiet ground): <t, the gap>

## Unverified
- <suspicion you could not frame-verify, with t>

## Round 2 only: previous defects
| Round-1 # | Status | Frame at the same t |
| --- | --- | --- |
| 1 | closed / open / regressed | |

## Handed to the Director
<NOT APPROVED: the ranked list above is the hand-off. APPROVED: the 🟡 for the record. ESCALATE: the one-line reason.>
````

APPROVED is written only when the Gate line reads "yes" four times. "Approved with notes", "ship it", "minor" and "basically" do not appear in a NOT APPROVED review.
