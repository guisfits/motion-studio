# Art director's worked examples

Project-agnostic. Token names stand where an overlay would put its colours and families.

## §1 A style bible, worked: "The canal that moved a city" (register A, 46 s, 14 plates)

The sheet (~30 rows, grouped here into 14 plates b01–b14 by shared hero): hook on a number (b01), the old town (b02–b04), the engineer (b05), the dig and its cost
(b06–b08), the turn: the canal opens (b09), the new trade (b10–b12), today (b13), close (b14). The
brief marks the turn at b09. Sources will be 19th-century engravings, a few period photos, one
newspaper clipping, one modern clip.

Decisions, each from the playbook:

- **Caption system:** small serif caption on the quiet area, italic for the one stressed word
  (the sources are archival prints: the serif system, grammar §7). Cap height 0.03 × 1920 = 58 px
  (inside `NORMS.caption.capHeight`); spot y 1180–1260, above the UI band; ink on paper, light with
  a 6 px glow on the modern clip. Darkest landing spot (b06, the dig engraving's lower third): ratio
  measured on the still, ≥ `NORMS.caption.minContrast`, else the caption moves to the paper margin.
- **Emphasis:** numeral hero for "40,000 workers" (b01) and "3 years" (b07) at 22 % of height,
  unit in the caption voice; size jump ×2 on "opens" (b09); name tag two tiers (who + what) on the
  engineer (b05). Highlighter on "cost twice the estimate" in the clipping (b08), the film's only
  highlighter colour. Script voice: none (three voices would be allowed; two are enough here).
- **Colour:** grey world, one accent = `accent` meaning "the water route" (the canal line on
  the map, the first barge, the tint wash on the trade route in b11). Never on dates, tags or the
  numeral. Grade: cool grey up to b08, warm from the turn at b09 (grade carries the mood).
- **Treatment:** every picture as an engraving or a halftone print (dot 8 px on photos), so prints,
  photos and the modern clip read as one film; the modern clip gets halftone + scanline at b13.
  frame finish: fringe 1, vignette 0.2, `Grain` 0.06.
- **Finish:** torn edge with fibre, 3 px at screen size, on every print; prints tilted ±3–6°;
  light from upper left, 315°; resting shadow 3 px / 4 px blur, lifted 12 / 14.
- **Grounds:** kraft (b01–b04), the period map as a desk surface under a top-down desk camera
  (b06–b08), river-blue flat colour with grain for the turn (b09), newsprint (b10–b12), off-white
  paper (b13–b14). Longest ground: the map at ~6 s, because the camera travels on it.

Per-beat table (first five rows):

| Beat | Line does | Ground | Stage | Loud thing | Empty % | Caption spot | Type device | Colour device |
|---|---|---|---|---|---|---|---|---|
| b01 | number | kraft | quiet ground | "40,000" | 55 | low band | numeral hero | accent: none |
| b02 | names a place | kraft | desk stage, prints at the edges | the old town print | 45 | low band | caption | grey |
| b03 | continues | kraft | same, push to the wharf | the wharf | 40 | low band | caption | grey |
| b04 | names a problem | kraft | disc stage (neutral disc 50 % w) | the silted river | 50 | low band | caption | grey (the river is not the story object yet) |
| b05 | names a person | map | one hero on a quiet ground | the engineer | 60 | low band | name tag | grey |

Style key: b06 at its key word, the dig engraving on the map with the torn edge, the caption on its
darkest landing spot, the grain and vignette on. The animator renders it with
`npx remotion still studio/index.ts <Id> <film>/out/style-frame.png --frame=<n> --gl=angle`; it is signed when sections 1–4 of the bible are visible in
that one still.

Manifest rows written: 11 pictures (heroes and supports), 5 grounds, 1 stage (the disc), 2 texture
files (fine grain, print). Each `minW` from the sheet's zoom: the engineer's portrait is 520 px wide
with a push to the eyes at ×1.6 → `minW` 832.

## §2 A note, answered: "too grey, more colourful, every beat a different colour"

Do not read the note as a palette order. Look at the last film's frames first:

1. Value range: if the grounds and the prints sit between 35 % and 70 % grey, the frame reads grey
   whatever the hue. Fix: real blacks in the ink and a light ground, one dark beat per section.
2. Focus: if no beat has one loud thing, the eye finds no colour event. Fix: the accent only on the
   focus, under ~5 % of the frame, so it reads as colour against the grey (grey world, one accent:
   52 pieces of the evidence do exactly this).
3. Ground swap per beat: the new ground every 3–6 s gives the film its colour changes (kraft,
   blue flat colour, newsprint, felt) without adding accents.
4. Grade carries the mood: warmth saved for the turn or the payoff.

Bible line: `"too grey, more colourful" → wider value range, the accent on each beat's focus, a
ground swap every few seconds, a warm grade from the turn; still one accent with one meaning.` A
hue per beat is odd tell #4 (a style break every cut) and postmortem K7; if the Director insists,
offer two styles with their own colour worlds separated by a word card, and say which you pick.
