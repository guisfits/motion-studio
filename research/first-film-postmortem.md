# First-film postmortem: what a failed first cut looked like

The first full draft of a 9:16 paper-collage Reel (about 88 s, 25 cuts) scored 3/10 from the client and from the
orchestrator's own review. Evidence: 1 fps contact sheets, full-resolution frames at key times, a 10 fps strip
around a zoom, a scene-cut detector and a freeze detector. The ids below (C = coarse, K = craft) are cited by the
film skills; keep them stable.

## Coarse errors (visible at first watch)

| #  | Where in the film | What was wrong | Norm it breaks |
|----|-------------------|----------------|----------------|
| C1 | last third, ~23 s | One flat coloured rectangle (a placeholder asset) sat on a ground colour while the voice explained the product. Dead frames for a third of the film | No dead frames; no placeholder ever shown |
| C2 | whole film | Captions were one white chip per word, typed in as the word was spoken and swapped for a new chunk 2-3 words later. Never a readable line; chip seams and baseline jitter | Caption on screen for at least its reading time (about 15-17 characters per second) |
| C3 | early, ~5 s | The voice named a specific person and place; the picture was an unrecognisable engraved man tagged with a role word, and a street tagged with a region word the narrator never said | Voice = picture = lettering |
| C4 | first 30 s | Labels cut by the frame edge mid-word; two labels overlapping each other | Words never clipped; no text over text |
| C5 | first 48 s | The composition lived in the top 55-60 % of the 9:16 frame; the lower 40 % was empty ground with a tiny caption | Fill the frame; hero in the centre third |
| C6 | last 2 s | The final pull-out was a motion-blurred smear, then a tiny row of thumbnails on a tiled pattern with a visible repeat | The ending lands on a composed frame |
| C7 | first 10 s | A portrait was cropped at the forehead and eyes, then held huge for 4 s: the face was cut off at the strongest moment | Crop on purpose (eyes in frame) |

## Craft problems (what made it look cheap)

| #   | Area | Finding |
|-----|------|---------|
| K1  | Zoom | Zooms were near-linear scale drifts that ended on a half-built collage and then hard-cut. No push into a target (a word, an eye, a date), no match-cut through it. One zoom-out held 0.7 s on a small unreadable board, then cut |
| K2  | Piece motion | Pieces appeared by fade or scale at 30 fps smoothness, which read as slideware, not paper: no overshoot or settle, no shadow lift, no stagger, no stutter on twos |
| K3  | Density | Every frame stacked 6-10 clippings of equal weight (map, text block, stamp, label, hand, disc). No hierarchy: the eye had no hero |
| K4  | Ground | Flat crumpled colour fields swapped between acts with hard cuts and looked like a digital filter, not a table; one tiled pattern visibly repeated |
| K5  | Lettering | Script labels were small, light and placed at random; they did not land on the spoken word and did not carry the argument |
| K6  | Annotation | Red ovals and underlines were thin and uniform and appeared fully drawn or faded in: no hand-drawn write-on, no highlighter swipe timed to the word |
| K7  | Colour | Each act was a different flat colour, and inside an act everything was beige or grey. No accent discipline: the accent colour was used for stamps, ovals, dates and text alike |
| K8  | Typography | Five or more type voices on screen (blackletter, typewriter label, script, serif, caption serif); chips and labels at near-identical sizes |
| K9  | Outro | A cut-out landmark, a flat cream page and a call to action: a template end card, not a collage close |
| K10 | Hook | In the first 2 s the board was already built; nothing happened that earned the scroll stop |

## Why it got through (process)

- The orchestrator reviewed stills, tests and counts; it never watched the film as a viewer, at phone size, with sound.
- There was no sync sheet (voice / picture / words) before the cut was shown.
- Placeholders were left inside a showable render.
- The rules were written to avoid repetition, not to explain; the gates measured code, not meaning.

## Where each finding went

Each defect maps to a rule in the film skills (`skills/film-*`) and, where measurable, to a gate in `core/checks/`;
the sources behind those rules are in `research/craft.md`.
