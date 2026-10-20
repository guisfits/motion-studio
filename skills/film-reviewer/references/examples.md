# Worked examples

## 1. Reading evidence into rows (the five-defect scenario)

Evidence as a reviewer sees it: 0:00-0:20 a large grey box labelled "PORTRAIT" centre frame in two beats while the narration names a person; 0:14 the voice says one name, the picture shows a generic building, the lettering reads a word nobody says; 0:40 an eight-word caption on screen 0.6 s, white on light paper; 0:55 a lettered word runs off the right edge; 1:20-1:28 the camera pulls out to an almost empty table and holds. The editor says it is basically done.

| # | Sev | t | Dim | What the viewer sees | Norm | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 🔴 | 0.00-20.00 | D2 | A grey box labelled "PORTRAIT" fills the centre of two beats under the line that names the person | P1 | archivist |
| 2 | 🔴 | 14.00 | D2, D5 | Voice says the name; picture is a generic building; lettering shows a word not spoken in the beat | H1, S5 | storyboard and archivist |
| 3 | 🔴 | 40.00 | D4 | An eight-word, 40-character caption fully legible 0.6 s (67 cps; limits `NORMS.caption.maxCps`, `NORMS.caption.maxWords`), white on light paper, unreadable at 360 px | T1, T3, T11; `odd #3` | animator and art director |
| 4 | 🔴 | 55.00 | D5 | The last letters of the lettered word are outside the frame | T4 | animator |
| 5 | 🔴 | 80.00-88.00 | D12, D6 | The last 8 s hold a table where pieces cover about 5 % of the frame (red below `NORMS.frames.minCoverage`) | T5; R4 not applicable (the end is not slower, it is empty) | animator and storyboard |

Verdict: NOT APPROVED. Lowest score D2 = 3 (a 🔴 caps at 4; a placeholder held 20 s is below the cap). No remedy is written in any row, the thumbs-up is not given, and "basically done" is recorded as a claim and ignored.

## 2. A green gate and a broken picture

The checks file is all green. Cold read: the film feels like a slideshow. The measures (`watching.md` section 4) give 21 cuts in 60 s (3.5 per 10 s, mean shot ~2.7 s) against a body the model puts near 8; the longest hold is 3.9 s, just under `NORMS.rhythm.maxStillHoldS`. Row 1: 🟠 D3, t 0-60, "mean shot 2.7 s, 3.5 cuts per 10 s from scene detection (lower bound: caption changes not counted); caption chunk changes seen at 0.6 s on 9 of the 21 holds", norm R1/R2 (the gate counted caption chunk changes, so the film passes; the gap is written under "Checks files said"), owner animator and storyboard. Row 2: 🟠 D3, t 41.0-44.9, "3.9 s hold under a list of four names, no caption change", `grammar §1` burst then hold reversed (slow under a list), owner storyboard. D3 = 9 minus 2 = 7, so the film is NOT APPROVED with zero 🔴, and the gap between the gate and the eye goes to the Director.

## 3. Things that are not rows

At 22.0 s the film cuts while the camera is still, to a picture of a different place; the voice names it on the cut. At 31.0 s one 2x push lands on a ticket as the word is spoken. The caption is a small lowercase italic serif with no box. A flat red ground with fine grain carries one beat. None is a defect (`rubric.md`, "Not a defect": `grammar §12` #1, #2, #7, #6). Writing them as findings is a failure of the reviewer, not a safe call. A second 2x push at 40 s and a third at 52 s is a row: T7, `NORMS.camera.punchMax`, at most two per film, owner animator and storyboard.

## 4. Mapping the first film's defects to the rubric

The failed first cut (`research/first-film-postmortem.md`, scored 3/10) was reviewed from stills, counts and tests, never watched on a phone with sound. Its defects as rows you would write today:

| id | Dim | Row, in one line | Norm | Owner |
| --- | --- | --- | --- | --- |
| C1 | D2, D3 | 🔴 one flat rectangle held a third of the film under the voice that explains the product | P1; M1 | archivist |
| C2 | D4 | 🔴 one chip per word, swapped 2-3 words later; no readable line at any moment | T2, T3 | animator |
| C3 | D2 | 🔴 voice names a person and a place; the picture is an unrecognisable engraving and a street tagged with other words | H1; S5 | storyboard and archivist |
| C4 | D5 | 🔴 labels cut by the frame edge; two labels overlap | T4 | animator |
| C5 | D6 | 🔴 the composition lives in the top 55-60%; the lower 40% is empty with a tiny caption | T5, T6 | animator |
| C6 | D12 | 🔴 a motion-blurred smear, then tiny thumbnails on a visibly tiled ground | T5; D9 | animator and art director |
| C7 | D6 | 🔴 a portrait cropped at the forehead held large for 4 s | `odd #7`; craft 2.7 | archivist |
| K1 | D7 | 🟠 linear scale drift ends on a half-built board, a 0.7 s hold on a small board, a cut | T7, T8 | animator |
| K2 | D8 | 🟠 pieces fade or scale in smoothly; no settle, no stagger | tell 9 | animator |
| K3 | D6 | 🟠 six to ten equal-weight clippings per frame | `odd #2` | storyboard |
| K4 | D10, D9 | 🟠 flat fields swap by hard cut between acts; one tile repeats | `odd #4`; tell 10 | art director |
| K5 | D5 | 🟠 small light labels at random places, not on the spoken word | S5 | storyboard and animator |
| K6 | D5 | 🟠 thin uniform red ovals appear fully drawn | tell 14 | animator |
| K7 | D10 | 🟠 one red for stamps, ovals, dates and text alike | style-bible accent limit | art director |
| K8 | D5 | 🟠 five type voices at near-identical sizes | style-bible type limit | art director |
| K9 | D12 | 🟠 a cut-out building on a cream page with a template call to action | `odd #4` | art director |
| K10 | D1 | 🟠 the board is already built; nothing happens in the first 2 s | tell 16 | storyboard |
