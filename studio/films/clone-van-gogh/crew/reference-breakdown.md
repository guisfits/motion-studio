# Reference breakdown: earn-edits-van-gogh (34.6 s, 1080x1920, 16 fps, 554 frames)

Source: `inspirations/earn-edits-van-gogh/media/src.mp4` (VP9 + AAC 44.1 kHz stereo). Voice: `media/words.json`.
Frames: `inspirations/earn-edits-van-gogh/frames/%04d.jpg` (1-based). Contact sheets (label = frame number): `frames/sheets/*.jpg`.

Conventions
- Frame `f` is 1-based; time `t = (f-1)/16` s. "f33" = first frame of a shot. Voice words quoted as `word(s-e)` in seconds, then frame = `s*16+1`.
- Percentages: x of frame width (1080), y of frame height (1920), top-left origin. Camera numbers are visual estimates (+-5 %), derived from frame matching; marked `~`.
- Colours are eyeballed from frames (+-8 per channel); verify with a picker on the listed frame before final.
- Native 16 fps: every one of the 554 frames is unique (only the last 4 frames 546/549/552/554 are held, the end card). Nothing is on "twos". All motion, text and camera steps run at 16 fps. Render the clone at 16 fps (or 32 with steps of 2) for the same stutter; smoothing it to 60 fps changes the look.

## 1. Cut table

Hard cut = one-frame change (frame diff > 30 on 108x192 grayscale mean abs diff). Transition = multi-frame span.

| # | Shot | Frames | Seconds | Len (f / s) | Entry | Voice inside |
|---|---|---|---|---|---|---|
| 1a | Drowning, wide | f1-10 | 0.00-0.56 | 10 / 0.63 | start | he was |
| 1b | Drowning, punch-in + PAIN stamps | f11-32 | 0.63-2.00 | 22 / 1.38 | hard cut f11 (diff 35) | drowning in pain |
| 2 | Portrait wall (frames fly in) | f33-56 | 2.00-3.50 | 24 / 1.50 | hard cut f33 (diff 54) | and somehow turned |
| T2>3 | Paper-tear holes wipe | f53-60 | 3.31-3.69 | 8 / 0.5 | overlaps end of 2 | turned it |
| 3a | Blossom profile + falling leaves | f57-71 | 3.50-4.38 | 15 / 0.94 | tear (above) | it into some |
| 3b | Same, head replaced by framed Starry Night | f72-105 | 4.44-6.50 | 34 / 2.13 | hard cut f72 (diff 35), camera punch | of the most beautiful art ever created |
| 4a | Clock hall, full figure | f106-129 | 6.56-8.00 | 24 / 1.50 | hard cut f106 (diff 81) | Van Gogh struggled with severe |
| 4b | Clock hall, punch to head, skull lifts | f130-148 | 8.06-9.19 | 19 / 1.19 | hard cut f130 (diff 35) | mental and |
| T4>5 | Radial zoom blur through | f149-152 | 9.25-9.44 | 4 / 0.25 | overlap | physical |
| 5 | Balance scale, brain falls | f150-181 | 9.31-11.25 | 32 / 2.0 | zoom blur | physical health problems, though |
| 6a | Maroon velvet, brain + THOUGH THE | f182-197 | 11.31-12.25 | 16 / 1.0 | hard cut f182 (diff 32), match cut on falling brain | the exact |
| 6b | Same, label box + camera punch | f198-211 | 12.31-13.13 | 14 / 0.88 | hard punch f198 (diff 41) | diagnoses remained debated |
| 7 | 1888 clock ring, dolly | f212-234 | 13.19-14.56 | 23 / 1.44 | hard cut f212 (diff 50) | In 1888 |
| 8 | Gauguin vs Van Gogh studio (video clip) | f235-289 | 14.63-18.00 | 55 / 3.44 | hard cut f235 (diff 45) | after a violent argument with Paul Gauguin, he mutilated |
| 9 | Ear / sunflowers | f290-316 | 18.06-19.69 | 27 / 1.69 | hard cut f290 (diff 66) | part of his left ear. Later |
| T9>10 | Scene slides up, bottom goes black | f316-317 | 19.69-19.75 | 2 / 0.13 | whip | Later |
| 10 | Door, man walks away (video clip) | f318-348 | 19.81-21.69 | 31 / 1.94 | hard cut after whip | he voluntarily entered the Saint- |
| T10>11 | Keyhole zoom-through | f349-361 | 21.75-22.50 | 13 / 0.81 | hard cut f349 into keyhole, plate parts f357-361 | Rémy |
| 11 | Green mat, framed asylum painting, brushes | f357-375 | 22.25-23.38 | 19 / 1.19 | keyhole | Rémy asylum, and there |
| 12 | Painted man on plinth, spotlight | f376-400 | 23.44-24.94 | 25 / 1.56 | hard cut f376 (diff 38) | surrounded by his |
| 13 | Painter at easel, Cambridge court | f401-433 | 25.00-27.00 | 33 / 2.06 | hard cut f401 (diff 61) | own struggles, he painted |
| T13>14 | Dark pillar sweeps through | f430-436 | 26.81-27.19 | 7 / 0.44 | right to left, cut at f434 (diff 60) | "The |
| 14 | Starry Night in gallery, rope | f435-457 | 27.13-28.50 | 23 / 1.44 | pillar | Starry Night. |
| 15a | Puzzle pieces, small | f458-475 | 28.56-29.63 | 18 / 1.13 | hard cut f458 (diff 78) | Every great edit |
| 15b | Puzzle, scaled up, HAS A STRUCTURE | f476-492 | 29.69-30.69 | 17 / 1.06 | hard punch f476 (diff 28) | has a structure. |
| 16 | Desk, folder, URL end card | f493-554 | 30.75-34.63 | 62 / 3.88 | hard cut f493 (diff 78) | Discover it with project files on earnedits.com |

Prior README list (cuts at 2.0, 6.6, 9.2, 11.2, 13.2, 14.7, 18.0, 19.8, 21.7, 23.5, 25.0, 27.0, 28.5, 30.7) verified: all 14 match within 1-2 frames. It missed these sub-cuts: 0.63 (f11 punch), 4.44 (f72 head-to-painting swap + punch), 8.06 (f130 punch), 12.31 (f198 label punch), 29.69 (f476 punch), plus real transition spans at 3.31-3.69, 9.25-9.44, 21.75-22.50, 26.81-27.19.

Rhythm: 18 pieces in 34.6 s, median 1.5 s, shortest 0.25 s transition, longest 3.9 s end card. Roughly one visual event (cut, punch or transition) every 1.1 s.

---

## 2. Shots

### Shot 1a/1b: drowning (f1-32, 0.00-2.00 s)
Voice: he(0.12) was(0.22) drowning(0.55-1.44) in(1.44) pain(1.66-2.12). Frames f2-f26 words.

Layers back to front
1. Night sky: deep navy (#12254A) painted/textured paper, small pale-yellow stars (#C8D87A, ~30 dots), faint swirl lines (Starry-Night style), grain.
2. Clouds: 4-5 hand-drawn engraving-style cumulus clouds, grey-white (#E6E4DC) with ink hatching, sit on the horizon at y 22-30 %, cut-out, separate layer.
3. Water: flat saturated blue (#1B4FD0 to #153A9E gradient downward) with a lighter wave line (#4FA9F0, 1.2 % H thick) at y ~38 % (wide) / ~33 % (punch). Painted texture, fine grain.
4. Fish (cut-out, photo, desaturated roach: silver body #A9A39A, orange-red fins #D8573A): big foreground fish bottom-left y 82-90 %, width 38 % W; 2 small fish mid-left; 2 blue silhouette fish (#2D5FB8) mid-right behind the man (low contrast).
5. Van Gogh: full-body photo-real cut-out, black frock coat and trousers, red beard, floating head-up with right arm raised toward the surface, legs bent, body diagonal. Tiny in f1-10, big in f11+.
6. PAIN text stamps (see below), in front of man.

Camera
- f1-10 wide: man centre (35 %, 40 %), height 10 % H; slow drift down-right; scale 1.0 to ~1.04; man sinks ~2 % H over 10 f.
- f11 hard cut to punch-in: camera scale ~2.2x vs wide, man centre (45 %, 48 %), height ~22 % H. f11-32 slow push scale 1.00 to ~1.06 and slight upward drift (waterline y 33 % to 36 %). Easing: linear-ish (looks constant velocity).
- Fish and clouds drift horizontally (parallax): clouds move left ~0.4 % W per frame, big fish move right ~0.6 % W per frame; blue fish opposite direction.

Text: "PAIN" x8 stamps
- Font: heavy rounded grotesk, closest Google Font `Lilita One` or `Chango`; colour crimson #D92B46, ~85 % opacity (reads as slightly blended into water), no outline, soft dark shadow (2 px, 40 %).
- Size: cap height ~2.5 % H, width ~16 % W each (some 22 % W at large). Rotation scatter -20 deg to +15 deg.
- Timing: first stamps f21 (1.25 s), voice "pain" begins f27 (1.66 s): text leads the word by ~6 f. Stamps appear 2-3 new per 2 f up to ~8 visible by f27, re-positioned every 2 f (jitter in position by ~2 % W), all gone by f32 with the cut. Positions (f24): (24 %, 49 %), (63 %, 40 %), (24 %, 68 %), (58 %, 66 %), (49 %, 61 %). Placement: over the man's torso, in front of the man and fish.
- Entrance: pop (scale 1.4 to 1.0 in 2 f). Exit: removed by cut.

Transition out: hard cut f33 (impact: sub-bass +13 dB, high-band +13 dB at t=2.0).
Grade/texture: strong paper grain on sky, slight vignette (corners -15 %), saturated blues, warm skin highlights. 16 fps stepped.

### Shot 2: portrait wall (f33-56, 2.00-3.50 s)
Voice: and(2.12) somehow(2.38-3.06) turned(3.06).

Layers
1. Wall: dark walnut wood panelling (#3A2416 to #5A3A22), vertical panel mouldings every ~33 % W, soft light streak from top-left (window shadow) at f33-37, grain.
2. Frames (gold ornate baroque, cut-outs with drop shadow, each a separate moving layer):
   - A: oval gold frame, centre (50 %, 35 %), width 24 % W, height 22 % H, inner blue (#4C8FD8) background, flat painted portrait of Van Gogh (orange-red hair/beard, sunflower in hair at his right ear).
   - B: small oval, top-left (13 %, 15 %), landscape (green wheat field, blue sky).
   - C: rectangular, top-right (80 %, 12 %), Cafe Terrace at Night (yellow awning, blue night).
   - D: tiny oval cropped at left edge (3 %, 36 %), Starry Night over the Rhone.
   - E: bottom-left rectangle (24 %, 76 %), white house in green field.
   - F: heart-shaped gold frame bottom-right (80 %, 75 %), irises on cream.
3. Text "&" then "SOMEHOW" (see below).

Camera: static to slow push scale 1.00 to ~1.05 (f33-52). Entry: at f33 only frame A is visible, scaled ~1.15x and rotated ~-8 deg; frames C (top-right, rotated +25 deg, partly offscreen), F (right, rotated -20 deg) are mid-flight. By f38 all six frames are settled (spring in, overshoot ~3 %) at final rotation 0 to +-3 deg. Entry speeds: 4-5 f from off-edge to rest. Frame D at f38 is half-visible then settles x 3 %.
Element motion: frames hang with tiny continuous sway (+-0.5 deg, period ~1 s).

Text
- "&" (word "and"): white, ~1.2 % H cap, at (14 %, 59 %) in f34-38, then moves/continues as prefix to SOMEHOW (the ampersand stays left of the word at x 14 %).
- "SOMEHOW": white (#FFFFFF) heavy rounded grotesk (`Lilita One` / `Baloo 2 ExtraBold`), cap height 3.0 % H, width 35 % W (x 33 %-68 %), y 59 %, over the lower edge of frame A, in front of frames. Typed letter by letter f35-f46 (1 letter per ~1.5 f: S at f35, SOM at f38, SOMEHOW at f44), each letter pop scale 1.3 to 1.0 in 2 f. Dark shadow (0 3 px, #000 60 %). Relation: "somehow" voice starts f38; text begins f35 (lead 3 f), completes f46 (voice end f50).
- Exit: replaced at f53 by "TURNED IT / INTO SOME" (see shot 3).

Transition out: paper-tear holes (see T2>3 below). Grade: warm brown, strong vignette (corners -25 %), grain.

### Transition T2>3: torn-paper hole wipe (f53-60, 3.31-3.69 s)
Mechanics (steps)
1. f53: 4-5 irregular organic holes open at once on the wall scene, sitting at (14 %, 18 %), (50 %, 30 %), (80 %, 70 %), (60 %, 55 %), (45 %, 80 %). Hole edge = ragged torn paper, light cream (#EDE8DE) rim 1-1.5 % W thick, with brown paper fibre; inside the hole = next scene (white background, dark blossom branches).
2. f54-58: holes grow ~3x in area (about 0.4 % W per frame radial growth each) and merge; the next scene's content (Van Gogh blue-coat cut-out facing left) rises with the holes, he is already in place at f55 (head at (28 %, 30 %)) inside a hole, i.e. he is a cut-out layer overlapped across the hole edge.
3. f59-60: holes cover full frame; remaining wall pieces are small flecks at the left edge; new scene fully visible f61.
4. Text swap: "SOMEHOW" (white) gets replaced mid-tear by orange "TURNED IT INTO SOME" at f54 (text layer is above the transition mask, only content swaps).
Build as: mask = animated metaballs / SVG turbulence displacement on a circle set, edge stroke = torn paper texture PNG (needs a paper-edge asset).

### Shot 3a/3b: blossom profile, leaves (f57-105, 3.50-6.50 s)
Voice: it(3.32) into(3.44) some(3.64) of(3.88) the(3.96) most(4.13) beautiful(4.36-5.00) art(5.00-5.36) ever(5.36) created(5.68-6.32).

Layers back to front
1. Background: off-white (#EDEBE6) smooth paper with soft shadow; at f57+ bare dark branches (brown-black #3B2A22, cherry-blossom twigs) fill the frame, 3 depths: back (blurred, small), mid (sharp), front-top (right).
2. Van Gogh: painted style bust cut-out, profile facing left, red/orange hair and beard (#D86A2C), blue coat (#2E5FB0 with brush strokes). Head at (35 %, 30 %), width 45 % W. Hair has small pink blossoms; coat covered with blossom clusters (pink #E9B5A8 white-peach) as a separate overlay layer (foreground, in front of the coat, behind text? text sits over blossoms).
3. Blossom twigs front layer: bottom-right big branch with 12-15 blossoms; sways ±1 deg.
4. Leaves: 12-16 maple leaves (photo, red-brown #8E2D1E and orange #E6741C), sizes from 4 % W (far, sharp) to 28 % W (near, blurred 4 px). Enter from top-right f58, fall diagonal down-left at 1.0-2.2 % H per frame (near leaves faster), slow rotation 2-5 deg per frame; keep entering through f105 (continuous shower). In front of everything but text? Text is behind the biggest leaves (leaf overlaps "TURNED IT" at f92) so leaves are above text.
5. At f72: framed "Starry Night" (gold ornate frame, painting inside) appears covering the head position (replaces his head), centre (52 %, 38 %), width 61 % W at f73 growing to 69 % at f92 and ~75 % at f105. It is placed behind the leaves and in front of the body, the head cut-out is hidden (no head visible).

Camera
- f57-71: scale 1.00 to ~1.07 (push), frame centre slightly drifting right; ease out.
- f72: hard punch scale ~1.35x relative to f71, centre moves to the framed painting (centre y 35 %); then slow push scale 1.35 to ~1.55 through f105 (linear), +x drift 1 % W.

Text
- "TURNED IT" / "INTO SOME": two lines, centred x 50 % (the first line x 40-58 % in f62 where it is small, later 25-75 % when camera has punched), y 64 % and 69 % (per-line cap height 3.0 % H). Colour `#E8A33A` (orange-gold), heavy rounded grotesk (`Lilita One`), 2 px dark-brown shadow, slight bevel. Appears f54 (during tear) full text; letters "TURNED IT" visible f54, "INTO SOME" f55 (typed in 2 f). Voice: "turned" f50, "it" f55, "into" f56, "some" f58: text is complete at f55 (0 to +5 f ahead of voice for the tail words).
- "EVER CREATED": white (#FFFFFF), heavy rounded, cap height 2.6 % H, centred on the painting at y 49 % (over the Starry Night), x 37-100 % cropped by camera at f87 (reads "VER CREATED"), appears f86-88 (typed from left, "EVER" f86, "CREATED" f88). Voice: "ever" f87 ✓ ("ever" 5.36 s = f87), so zero lag. "created" f91-f101. Text in front of painting, behind leaves.
- Words between ("of the most beautiful art") are carried by the painting appearing at f72 (voice "beautiful" f70-80).
Exit: hard cut f106 on "created" end (voice 6.32 = f102; the cut is 4 f after the last word).

Grade: warm paper grain, slight vignette, orange/blue complementary, blossom bokeh blur on back branches.

### Shot 4a/4b: clock hall, skull lift (f106-148, 6.56-9.25 s)
Voice: Van(6.32) Gogh(6.56-6.87) struggled(6.87-7.58) with(7.58) severe(7.90) mental(8.37) and(8.84).
Layers back to front
1. Room: dark olive-brown painted wall (#2C2A20), heavy grunge texture, light centre pool, small speckles; a pale beige floor haze at the bottom (y > 80 %).
2. Clocks (6-7 photo cut-outs of antique clocks, cream face #D8CBA8, brass bezel; sizes 5-25 % W, parallax depths; rotation different per clock): big bottom-left clock (22 % W at (18 %, 85 %)), big top-right (22 % W at (88 %, 8 %)), small ones in between. They float slowly: vertical drift +-0.3 % H per frame, hands do not move.
3. Van Gogh full-figure cut-out: dark green suit, hands clasped at chest, red beard, wearing a thin gold crown/laurel. Stands centred (x 50 %, y 5-85 %), a white-flowered vine (green stems, white 5-petal blossoms) wraps the body, drawn as a separate overlay layer growing up from the feet (f106 partial -> f128 up to the head).
4. Text "VAN GOGH" (in front of figure).
5. f130+: close-up crop of the head: skull top (hair + scalp cap) cut layer, brain (pink-grey, veined; separate PNG), yellow ring line (#E0D43A, 3 px) at cap level.

Camera
- f106-129: static wide, scale 1.0 to 1.04 (very slow), figure height 80 % H.
- f130: hard cut/punch to scale ~2.6x centred on the head (head centre at (45 %, 55 %) after punch). f130-148: slow push to ~2.8x.
- Skull lift f131-146: cap + hair lift ~8 % H over 14 f (ease out), brain emerges behind the cap, yellow ring ellipse stays at the neck.

Text: "VAN GOGH"
- White-cream (#EFE9D6), classical high-contrast serif caps (Trajan-style; `Cinzel Regular` closest), letter-spacing wide, glowing edge (blur 6 px, white 30 %) and thin construction/guide lines (typography grid: baseline + cap line + small tick marks, 1 px, light grey) around the letters. Cap height ~4.5 % H at wide, width ~84 % W at f128.
- Entrance: letters reveal L to R with fade, 2 letters per frame: "V" f107, "VA" f108, "VAN GO" f113, full f120. Voice: "Van" f101, "Gogh" f106-111; text lags the word by ~6 f.
- Position wide: y 47 %, x 50 %; behind nothing (in front of figure, since it crosses the body, but low alpha edge so figure still visible).
- After punch the text lives in the world layer: scales with the camera 2.6x, now at the bottom (y 92 %), cut by the frame edges, reads "AN GOGH" at f131-148.
Exit/transition: radial zoom blur f149-152 (see T4>5).

Grade: grunge overlay, strong vignette (corners -35 %), desaturated olive, slight sepia.

### Transition T4>5: radial zoom blur (f149-152, 9.25-9.44 s)
Steps
1. f149: scene scales ~1.6x (extra ramp over 1 f) with radial blur from the centre, the figure becomes a streak at (50 %, 45 %); text at the bottom also blurred horizontally ("VAN GOGH" smeared, f149).
2. f150: full-frame radial blur, mostly a golden-brown radial streak pattern, gold bowl (the scale pan) glimpse at the left (f151).
3. f152-153: blur resolves into the balance scene, scaled 1.2x to 1.0x over 3 f (settles, ease out).
Implement: zoom ramp 1.0 to 2.0 in 2 f on shot 4b with radial blur (directional, 12-20 samples), then shot 5 starting at scale 1.3 and radial blur 80 % to 0 in 3 f. Cross-dissolve on f150-151.

### Shot 5: balance scale (f150-181, 9.31-11.25 s)
Voice: physical(9.08-9.71) health(9.71-10.18) problems,(10.18-10.92) though(10.92).
Layers back to front
1. Painted Baroque background (olive-umber #5A4A22 gradient to near-black bottom third), soft light from upper-left, painterly grain.
2. Woman's arm (pale skin, white sleeve) from top-left holding the scale's beam: arm at (20 %, 3 %) top-left; fine chain / strings from the beam.
3. Beam + two brass pans: left pan (centre (30 %, 38 %)) holds a gold brain (the "gold" object); right pan lower (60 %, 64 %) holds a small oil lamp/candle holder (brass, smoke wisp).
4. Gold brain (photographic cut-out, rendered as gilded, laurel-leaf edges): sits in the left pan f150-165, then tilts the pan: f166-176 the scale beam rotates (left pan up, right down; ~15 deg), and the brain slides off/falls: f173 rolling, f176-181 falls down and out the bottom (y 40 % to 110 %), small bounce f181 off-frame.
5. No text.

Camera: starts scale ~1.25 (from the zoom blur) settling to ~1.05 by f155, then static; no rotation. The beam sways ±2 deg.
Transition out: hard cut f182 as a match cut: the brain falls out the bottom of f181 (partly visible at x 45 %, y 100 %) and in f182 a brain enters from the top (x 45 %, y -2 %) in a new scene (continuous downward motion).

Grade: heavy dark vignette (corners -45 %), warm sepia, grain.

### Shot 6a/6b: maroon velvet, brain, THOUGH THE (f182-211, 11.31-13.13 s)
Voice: though(10.92) the(11.04) exact(11.25-11.60) diagnoses(11.60-12.17) remained(12.17-12.70) debated.(12.70-13.36).
Layers back to front
1. Burgundy velvet curtain (#5A0F24 to #3B0A18), vertical fold shading, dust speckle grain.
2. Ornate copper-brown (#9A5F3F) baroque scrollwork ornaments (3 cut-outs: eye-shaped ornament at (30 %, 80 %) with an engraved eye at the centre (visible f182-195), heart shape right (88 %, 84 %), left top (2 %, 8 %)); drift slowly, with soft shadow.
3. Gold brain with laurel ring (same asset as shot 5), centre (50 %, 42 %), width ~40 % W (f185) to 52 % W (f200).
4. White label box (rounded rectangle #F5F5F0, radius 6 px) with yellow bold text "REMAIN / DEBATED", centre (50 %, 52 %), width 30 % W (f200) to 36 % W (f208), height 7 % H (f200) to 8.5 % H.
5. Type "THOUGH THE", "EXACT DIAGNOSES".

Motion
- f182-189: brain falls from top (f182 y -8 %) to y 40 % with rotation 25 deg to 0, decelerating (ease-out, bounce at f190 ~1.5 % overshoot).
- Ornaments float +-1 % per 8 f.

Camera: f182-197 static scale 1.0 (brain 40 % W). f198: hard punch (scale 1.35x), text and box all 35 % bigger; then slow push 1.35 to 1.45 until f211.

Text
- "THOUGH THE": white-to-grey vertical gradient (#FFFFFF to #B4B4B4) heavy wide grotesk with soft shadow (`Archivo Black` or `Poppins ExtraBold`), cap height 3.3 % H, width 68 % W (f185) / 94 % W after punch (f208), centred, y 30 % (f185) / 28 % after punch. Typed L to R f183-f186. Voice "though the" ends f196 but text is in at f184 (voice 'though' started f176: lag +8 f).
- "EXACT": 5 % cap, y 77 %; "DIAGNOSES": 2.7 % cap, y 80.5 %; same gradient/shadow, width 20-26 % W ("EXACT") typed f186-192: "EXA" f188, "EXACT" f190, "DIAGNOSES" f190-196 (word "exact" starts f197 ⇒ text leads voice by ~8 f).
- "REMAIN DEBATED" (inside the white box): yellow #E4B924, heavy grotesk (Lilita One style), 2 lines of cap 2.2 % H; box pops f198 (empty white rectangle first at f198, scale 0.6 to 1.0 in 1 f) then "RE" f199, "REMA" f200, "REMAIN / DEB" f203, "REMAIN / DEBATED" f206. Voice: "remained" f195-f204, "debated" f205-f213: text leads by 0-5 f.
Exit: hard cut f212.
Grade: velvet noise grain, vignette corners -35 %.

### Shot 7: 1888 clock ring (f212-234, 13.19-14.56 s)
Voice: In(13.36) 1888,(13.50-14.52).
Layers back to front
1. Dark olive-brown wall/floor (#2A2620), horizon fade at y 70 % (floor lighter brown #4A3A28 below).
2. Ring of Roman numerals (white #F2F2EE, serif bold, I to XII), tilted on a 3D disc (elliptical, ~70 % W wide, centre at (50 %, 38 %)), each numeral separately rotated to face the ring centre; the ring rotates clockwise ~4 deg per frame (numerals visibly orbit), numerals at the camera-near side are large (12 % H) and out of focus (blur).
3. Frames (cut-outs, flat illustrations): top-left Starry Night in gold rectangle (centre (22 %, 12 %), 18 % W), top-right round gold medallion with Starry Night over the Rhone ((75 %, 8 %), 14 % W), bottom-left tall oval frame with green landscape ((18 %, 78 %), 18 % W x 26 % H), bottom-right rectangle with a white house ((82 %, 76 %), 18 % W).
4. Centre frame: rectangular gold frame holding "1888" (see text), centre (50 %, 38 %), width 20 % W at f213 growing 16 % per... to 35 % W at f234.

Camera: dolly-in on the centre: scale ~1.0 (f212) to ~1.8 (f234): background frames fly outward and past (parallax: foreground frames scale 2.2x, background 1.4x). Ease: ease-in then linear (speeds up). Slight camera roll +4 deg over the shot (numerals' ring rotates).
Text "1888": orange-gold #E8A21A, heavy condensed numeral (Lilita One / `Bowlby One`), cap height 3 % H at f213, 6.2 % H at f234, in front of the dark centre of the gold frame; present from f212 (frame content, no entrance), voice "1888" starts f215 (word 13.50 s = f217) so the text is up 5 f before the voice. Numerals "II/III/VI" pass in front of the frame (depth: numerals nearer than frame).
Exit: hard cut f235 (diff 45).
Grade: strong vignette, slight motion blur on near numerals (radial), warm shadows.

### Shot 8: Gauguin vs Van Gogh (f235-289, 14.63-18.00 s)
Voice: after(14.52) a(14.89) violent(14.95-15.46) argument(15.46-16.07) with(16.07) Paul(16.34-16.63) Gauguin,(16.63-17.20) he(17.20) mutilated(17.41-17.98).
Layers
1. Photoreal/AI painterly video clip (16 fps): artist studio, tall arched window with pale light at left (x 15-25 %), burgundy walls, two plaster busts on shelves at (55 %, 25 %) and (28 %, 27 %), easel with a landscape (green/blue) at (48 %, 62 %), painter's palette on a table bottom-left. Two men facing each other: Gauguin (left; black hair, moustache, brown jacket, red cravat, pointing finger) and Van Gogh (right; red hair/beard, grey-blue jacket, open hands). Both gesticulate through the clip (subtle looping body motion, 16 fps stepped).
2. Name tag (see below).
Camera (applied on a baked clip, scale grows): f235 wide, both visible, scale 1.0 (Gauguin x 12 %, VG x 62 %). Pan right and push: f260 scale ~1.35, Gauguin centred (x 38 %); f270 scale ~1.6; f289 scale ~1.9 centred on Van Gogh (x 62 %), Gauguin leaving left edge (his hand at x 3 %). So scale 1.0 to ~1.9, centre drifts from (35 %, 55 %) to (65 %, 48 %), continuous ease-in-out; no cuts in f235-289.
Text/tag: "PAUL GAUGUIN"
- Name tag: yellow box #D9C82B (fill 95 %), dark text #2A2C1C, caps heavy sans (Montserrat ExtraBold ~ 1.2 % H cap), box 25 % W x 2.2 % H, slight tilt +1 deg; appears f260 above Gauguin's head at (36 %, 21 %) (pop scale 1.2 to 1.0 in 2 f). It tracks Gauguin's head: slides left with the pan and exits off the left edge by f289 (x -5 %).
- Voice "Paul" starts f262: tag leads by 2 f.
- No other text (no "mutilated" caption).
Grade: filmic warm AI look, slightly soft, vignette corners -25 %, visible grain.

### Shot 9: ear / sunflowers (f290-316, 18.06-19.69 s)
Voice: part(17.98) of(18.26) his(18.40) left(18.61) ear.(18.89-19.31) Later,(19.31-19.85).
Layers back to front
1. Sky: Van Gogh swirl sky (blue #7A9CCB / cream #E8DDB8 / teal; painted impasto), full-bleed.
2. Sunflower field (photo/painted, yellow #E8B820, green leaves, brown centres), many flowers across the bottom 55 % H, foreground flowers 8-12 % W, bigger and blurred (shallow DOF).
3. Van Gogh bust: painted, 3/4 left profile, dark jacket (#26262A), red beard; centre (35 %, 42 %), head height 14 % H at f291.
4. Left hand (pink-beige, photo) entering from top-left holding something that grabs his ear (f299+) and a right hand with a knife (blade silver) at (62 %, 22 %) rising behind his head; at f301-315 the hand lifts a cut ear (grey-metal ear shape; a small red wound on the ear side f303).
Camera: push-in: scale 1.0 (f290) to ~1.55 (f315), centre drifting up-left to (35 %, 28 %) so that the head moves from y 45 % to 12 %; ease-in (accelerating). Also camera tilt: a slight clockwise roll of 2 deg.
Element motion: knife enters f291 (from right at x 100 %, moves in 8 f to (62 %, 25 %)); hands (both) cross to the ear by f301 (ease out), pull away f313-315.
Transition out T9>10 (f316-317): the whole frame slides up (+36 % H f316, +60 % f317) fast (whip), the bottom region fills with a dark vignette gradient (#1A1A18) as the image slides, then hard cut to f318 (door scene, dark). Implement: translateY from 0 to -60 % in 2 f with motion blur vertical (8 samples), fade-to-black at the bottom edge, cut on f318.
No text on screen. Grade: saturated, painterly, heavy DOF, soft vignette.

### Shot 10: door, "LATER ... VOLUNTARILY ENTERED THE" (f318-348, 19.81-21.69 s)
Voice: Later,(19.31-19.85) he(19.85) voluntarily(19.95-20.74) entered(20.74-21.24) the(21.24-21.45) Saint-Rémy(21.45).
Layers
1. Video clip (16 fps): corridor, wood wall/door at left (a door swings open f318-326 revealing a bright small window at the end, x 52 %, y 12 %), warm light shaft on the floor (#E6D9A8), dark walls (#1C1A14 to #353428). Van Gogh seen from behind in a teal-blue jacket (#2F5A5E) with red hair, walking away along the corridor (centre x 38-52 %, y 35-85 %), slight walking sway.
2. Text layers (see below).
Camera: slight push 1.0 to 1.12 f318-348, camera drift right 2 % W; the man's position shifts to the right as the clip proceeds (door and wall slide). Light flicker none.

Text (all white #FFFFFF, no outline, soft shadow)
| Word | Frames in | Frames out | Pos (% x, y) | Cap h (% H) | Font |
|---|---|---|---|---|---|
| LATER | f319 ("LA" fade) to f327 full | fades f329-333 | centre (40 %, 41 %) | 2.8 % | heavy rounded (Lilita One), 90 % opacity |
| VOLUNTARILY | f333 | stays to f348 | left (5-61 %, 50 %) | 1.1 % (smaller, lighter weight ExtraBold) | Poppins ExtraBold |
| ENTERED | f341 | stays | right (46-91 %, 29 %) | 1.9 % | Lilita One |
| THE | f345 | stays | (18-36 %, 37 %) | 1.6 % | Lilita One |
- Letters reveal L to R at 1 letter/frame with fade; "LATER" is partly occluded: "TER" overlaps the man's back and is semi-transparent (blend mode "overlay"/60 % alpha) at f321 (text sits behind the man? "LA" is in front, "TER" is behind the jacket at f321 then moves in front), i.e. text is tucked between wall and man at first and then pops in front. Keep it simple: text above man, alpha 70 %.
- Timing vs voice: "later" voice f309 (text f319-327 lags 10-18 f); "voluntarily" voice f320 (text f333 lags 13 f); "entered" voice f333 (text f341 lags 8 f); "the" voice f341 (text f345 lags 4 f). Text trails the voice here (the cut had to wait for the sunflower shot to finish), lag shrinks 13 f to 4 f.
Exit: hard cut f349 into the keyhole (impact: sub-bass +15 dB).
Grade: dark teal/orange, strong contrast, vignette corners -45 %, film grain, 16 fps.

### Transition T10>11: keyhole zoom-through (f349-361, 21.75-22.50 s)
Steps
1. f349: frame full of a blurred (defocused 12 px) ornate bronze lock plate (dark bronze #4A4034 with silver relief flowers), tiny keyhole opening at the centre showing a green mat and a gold frame through it; plate width ~170 % of the frame.
2. f351: sharp; keyhole opening is now 36 % W x 40 % H, centre (50 %, 45 %), plate scale ~3x vs f349, plate relief flowers (large rosettes at 20 % and 85 % W). Through the hole: green cutting mat (#2F9A4D with fine grid) and the gold frame with asylum painting.
3. f353-357: camera continues pushing through: opening grows to 60 %, 100 %; the plate splits visually into two halves that slide outward left and right (f357: left half at x -35 %..10 %, right half at 90 %..135 %); at f359-361 only dark slivers remain at the edges (the left sliver turns into a brush).
4. f361: clean green mat with paint brushes at the edges.
Mechanics: scale the plate image about the keyhole centre from 1x to ~6x over 10 f (ease-in), cross-fade as the hole exceeds the frame; background scene scales 0.8x to 1.0x (also ease-out) with a defocus blur 12 px to 0 px. Needs a high-res keyhole plate PNG with alpha hole.

### Shot 11: green mat, framed asylum painting (f357-375, 22.25-23.38 s)
Voice: Saint-Rémy(21.45-22.32) asylum,(22.32-23.28) and(23.28) there,(23.51).
Layers
1. Green self-healing cutting mat (#3FA05A to #2A8348 radial vignette), faint 1 cm grid lines (#6FC080 at 20 %), photo, vignette corners -30 %.
2. Paint brushes (photo cut-outs: wooden handle, bristles tan #C9A06A and dark) placed at the left edge (x 2 %, y 18 % and 80 %) and the right edge (x 98 %, y 22 % and 88 %), rotating gently (+-2 deg), they slide with the camera.
3. Gold ornate rectangular picture frame (cut-out, shadow), centre (50 %, 40 %), 62 % W x 36 % H at f361 (large when camera has punched) with a painting of the Saint-Paul asylum garden (cream building, big tree trunk left, black-clad man in the garden, blue sky).
4. Label tag.
Camera: f361 scale 1.0 (frame 62 % W) to f375 scale ~1.12; centre drifts left 2 % W. Frame itself tilts +1.5 deg to -0.5 deg over the shot (hangs). Lines move at 16 fps.
Text: tag "Saint-Rémy asylum" (white-on-yellow caption): chartreuse/yellow bar (#D6D82A), text dark (#2E3A12) in a rounded geometric sans, x-height tiny (cap 0.9 % H), bar 21 % W x 1.5 % H, rotated -3 deg to +1 deg, anchored on the painting's top-left corner at (14 %, 33 %). Appears f353 (wipes in from left in 3 f: the bar 'draws' L to R), text typed f355-f360, stays to f375 (moves with frame, drift +0.4 % W per frame). The text is behind the nearest brush layer, in front of the painting. Voice "Saint-Rémy" starts f343, "asylum" f357: text starts 10 f after "Saint".
Exit: hard cut f376 (broadband hit +28 dB mid / +20 dB high).

### Shot 12: painted man on plinth (f376-400, 23.44-24.94 s)
Voice: there,(23.51-24.07) surrounded(24.07-24.81) by(24.81) his(24.96).
Layers (AI video clip? Appears as a clip 16 fps)
1. Circular painted gallery (cylindrical room: stacked paintings, Van Gogh style night sky / Arles streets in blue #274A9E and yellow #E3B93C, a sculpted torso statue relief at lower left), photoreal 3D, dark brown (#2A2218) edges, spotlight cone from the top centre (soft yellow light, 60 % width at the floor).
2. Stone cylinder plinth (grey-green brick #6A6C5A) occupying the bottom 25 % H, glowing yellow edge (rim light #D9B53A) at the ground (y 80-90 %).
3. Painted Van Gogh figure (impasto style, full figure; teal-green suit #2E6B70, orange hair/beard, hands in pockets, brown shoes) standing on the plinth, centre (50 %, 55 %), height 55 % H at f376, rising to 70 % H at f400.
4. A canvas (painted; the coat flap turns into a painting 'cape' of a street scene; folds out to the right) bends away: f378 starts at x 70 %, f388 a rectangular painting hovering at the figure's right leg (rotated 35 deg), f399 the painting is a large tilted rectangle (60° rotation -> around 25° rotation) in front of the legs (x 40-80 %, y 45-80 %) = a flying painting canvas.
Camera: push-in scale 1.0 (f376) to ~1.45 (f400), centre moves from (50 %, 55 %) to (50 %, 42 %); background paintings revolve around (rotating cylinder ~2 deg per frame) so a vertical parallax; spotlight beams pulse at f386-396.
No text. Exit: hard cut f401.
Grade: warm gold highlights, deep blue/teal shadows, vignette.

### Shot 13: painter at easel (f401-433, 25.00-27.00 s)
Voice: own(25.19-25.41) struggles,(25.41-26.26) he(26.26) painted(26.41-26.95) "The(26.95).
Layers
1. Cambridge-style gothic courtyard (photo, beige limestone, blue sky gradient #8DB4E6 to #BCD5F0; people in the distance), green lawn bottom 30 % (#3E7A2C), grey-brown path.
2. Painter: painterly AI 3D figure facing right, red hair/beard, teal-green impasto jacket with paint smears, baggy brown trousers, holds a palette with colours in the left hand, brush in right hand, paints at the easel (f401-433 brush strokes loop).
3. Wooden easel with a Starry Night canvas (blue/yellow swirls, cypress), canvas at (63 %, 58 %), 30 % W.
4. Type (top).
Camera: push-in with pan: f401 scale 1.0 (painter x 25 %, easel x 62 %); f433 scale ~1.4 (easel x 85 %, painter x 15 %); constant velocity. Horizon drifts down 2 % per 10 f.
Text: "HIS OWN / STRUGGLES"
- Colour pale blue-white #E4ECF4 with slightly frosted look, 2 px soft shadow (#44566F 40 %), rounded heavy grotesk (`Lilita One`/`Chango`), cap height 2.7 % H per line, lines at y 11 % and 18 %, x centred 50 % (line 1 36-64 % W, line 2 24-76 % W at f416), the type scales with the camera (grows to ~1.35x by f433 and gets cropped at the right edge by the pillar transition). "HIS" f402-403, "OWN" f405-407 (typed), "STRUGGLES" f407-413 letter by letter each ~1 f with slight blur-in.
- Voice: "own" f404 ✓ (lead 0-1 f vs "his" from f400; this "his" was spoken at 24.96 = f400).
- Behind: sky, in front of buildings; no occlusion by the easel.
Exit: dark pillar sweep (T13>14).
Grade: bright, slightly desaturated blue, vignette corners -20 %.

### Transition T13>14: dark pillar sweep (f430-436, 26.81-27.19 s)
Steps
1. f430: narrow dark vertical bar enters from the right edge x 82-100 % (soft edge, near-black #0E0E0C, 4 % blur). Content to its left continues.
2. f431-433: bar widens to x 55-100 % (f433), left edge moving left ~9 % W per frame; at x 100-85 % there is a gradient (dark bar lighter edge).
3. f434: bar covers x 0-100 % except a thin gap on the right (x 87-100 %) showing the new gallery wall: the cut occurs here (hard cut under the bar).
4. f435-436: bar continues to the left edge, leaving through x -10 %; at f435 it still occupies x 0-13 %; f436 gone.
So a ~35 % W wide near-black "pillar" sweeps R to L in ~5 f (about 20 % W per frame) at speed ~ whip-pan; scene behind is swapped at f434. Implement as rect with horizontal gradient edges and 6 px motion blur; add sub-bass thump at f433 (audio).

### Shot 14: Starry Night in gallery (f435-457, 27.13-28.50 s)
Voice: Starry(27.25-27.71) Night.(27.71-28.48).
Layers
1. Mossy grey brick wall (#6B6B5E, green moss patches at y 5-25 %), museum spot light on the painting (radial lighter pool), grain.
2. Framed painting: ornate gold frame (#C79A38) with Starry Night (blue #1E4EA8, yellow moon #F2D43C, dark cypress); centre (50 %, 33 %), width 70 % W at f435 growing to 85 % W at f457 (scale ~1.0 to ~1.2). Slight shadow on the wall.
3. Red velvet rope (#9A1B1F) hanging between 2 brass posts at the bottom: posts at x 7 % and 93 %, rope sag to y 88 %; centre (50 %, 82 %). Rope sways ±1 deg.
4. Text "THE STARRY NIGHT".
Camera: push-in scale 1.0 to 1.2 (f457), centre (50 %, 40 %) constant, ease-out.
Text
- White (#FFFFFF) to light-grey gradient, heavy slab rounded (Lilita One), with thick black drop shadow offset (+3 px, +4 px, 60 %), cap height 2.6 % H, width 54 % W (f449) to 70 % W (f457), centre (50 %, 75 %), in front of rope and wall, below the painting. Typed: "THE" f437, "THE STARRY" f443, "THE STARRY NIGHT" f449, each letter pop 1.2 to 1.0 in 1 f, small up-slide 1 % H. Voice: "Starry" f442, "Night" f451: text leads/aligned (-1 f to 0).
Exit: hard cut f458 (impact: mid +14 dB, high +12 dB: "whoosh+hit").
Grade: cool dark vignette (corners -40 %), spotlit.

### Shot 15a/15b: puzzle structure (f458-492, 28.56-30.69 s)
Voice: Every(28.48) great(28.88) edit(29.28) has(29.62) a(29.85) structure.(29.92-30.99).
Layers
1. Graph paper: light grey (#D9DBD6) with 1 cm grid (#9FB5B0 lines), soft vignette, subtle paper grain, 3D paper shadow.
2. Four jigsaw pieces (glossy, embossed, with drop shadow offset (6 px, 10 px, 30 %)), placed in a 2x2: HOOK (navy #1E3A6E, eye photo inset, film-strip edge, cross hairs; top-left centre (30 %, 38 %)), CONTEXT (green #2E6B34, parchment + dome building inset; top-right (70 %, 38 %)), BUILDUP (orange-brown #9A4C20, audio waveform in gold + clapper board + small "3" circle; bottom-left (30 %, 56 %)), PAYOFF (red #A8142A, red silhouette of a person in a circle + city; bottom-right (70 %, 56 %)). Labels in white serif small caps (`Cinzel`/Playfair, cap 0.9 % H).
3. Type "EVERY GREAT EDIT" / "HAS A STRUCTURE".
Motion/Camera
- f458: pieces already in place at small scale (group scale 0.45, pieces ~14 % W each); no entrance animation visible, hard cut. f458-475 group sits at scale 0.45 and drifts +0.3 % per frame (slight drift).
- f476: hard punch to scale 1.0 (group width ~66 % W, each piece 30 % W) → 'punch-in', then f476-492 slow push to ~1.06.
Text
- "EVERY GREAT EDIT": white (#FFFFFF) with thick medium-grey extruded shadow (3-4 px, #4A4F52) and thin dark outline; heavy rounded (Lilita One), cap height 1.2 % H at f464 (scale 0.45 state), 2.5 % H after punch (f476-492), width 28 % W (small) / 62 % W (large); y 30 % (small) / 22 % (large); typed: "EVERY G" f460, "EVERY GREAT" f461-465, "EDIT" f466. The small version is complete by f467 (voice "edit" f468). Lead: -2 to +2 f.
- "HAS A STRUCTURE": same style, y 40 % (small, f470+ not shown: appears at f476) / 74 % (large), width 60 % W; typed from f476 ("HAS A" f476-477, "HAS A STRUCTURE" f478-482). The word "structure" starts at f479; text arrives 0-3 f early. Underlays (f476) show first letters as thin gray outlines before fill (fade-fill 2 f).
Exit: hard cut f493 (high band drop -26 dB: music ends, silence).

### Shot 16: desk end card (f493-554, 30.75-34.63 s)
Voice: Discover(30.99-31.53) it(31.53) with(31.69) project(32.01-32.58) files(32.58-32.98) on(32.98) ernedits.com.(33.14-34.48).
Layers
1. Wood desk (dark walnut #5A2C18 to #7A4426), top-down view, strong wood grain, light from top-left, vignette.
2. Objects (photo cut-outs with shadows): framed Cafe Terrace painting top-left (tilted -15 deg; (10 %, 10 %)), black calculator top-right ((82 %, 8 %)), pink wooden ruler vertical top (30 %, 12 %), blue pen lower-left ((24 %, 70 %)), tarot-style card "JUSTICE" with Batman-like figure bottom-left ((10 %, 76 %), -8 deg rotation), white keyboard bottom-right ((88 %, 82 %), -35 deg).
3. Folder: yellow manila icon-like folder (flat top-view, #F2CB4A to #D9A826 gradient, soft shadow 6 px), with 3 dark-blue Adobe After Effects "Ae" cards (#1F1F70) poking out the top; folder centre (50 %, 40 %). At f493 tiny (width 11 % W, at (45 %, 55 %)), scales to full (width 44 % W) by f499 (ease-out with 3 % overshoot) while the "Ae" cards slide up out of the folder f496-503.
4. Red hand-drawn ellipse around the folder: stroke #D42A2A, 3 px at 1080 scale (4 px), width 52 % W x 20 % H, centre (50 %, 40 %), drawn as a stroke reveal (clockwise) f506-f514, with a small tail loop at the top.
5. URL type.
Camera: static to a slow push ~1.0 to ~1.04 over the shot; desk objects fixed; very slight 1 % zoom pulse at f499.
Text: "{EARNEDITS.COM}" (brand mark for the clone: replace with AdScriptura handle)
- Font: geometric tech display (`Orbitron`/`Audiowide` Bold), white #F2F2F2, with 2 px dark outline and shadow; braces in vivid green (#27D13A) at the left "{" and white "}" at the right; cap height 3.3 % H, final width 86 % W, centred (52 %, 45 %) overlapping the folder (in front of the folder and ellipse).
- Typed letter by letter f521-f545 (1 char per ~1.4 f): "{E}" f526, "{EARN}" f532, "{EARNEDI}" f534, "{EARNEDITS.C}" f538, "{EARNEDITS.COM}" f541-546; braces move to the right as the word grows (brace follows end). Voice: "ernedits.com" starts f531; text leads by ~8 f at the start and ends f546 (voice end f553).
- Final hold f546-554 (4 held frames).
Grade: warm, desk spotlight vignette corners -35 %, grain.

---

## 3. Audio

Container: AAC-LC (HE-AAC listed), 44.1 kHz stereo, 66 kb/s. Integrated loudness -14.3 LUFS, LRA 2.2 LU (heavily compressed, voice-forward), true-peak not measured. Voice RMS roughly -21 to -25 dBFS throughout (0-34 s), last 0.1 s fade to -32 dB.

Voice: male documentary narrator, dry (no obvious reverb), continuous: the first word at 0.12 s, the last at 34.48 s (almost no gaps > 0.12 s). Pace ~3.5 words/s.

Music/SFX separation not possible cleanly (no stems); the findings below come from band-energy windows at each cut (+-100 ms) and an onset search outside voice windows. Confidence: medium for the cuts table, low for the music description. Install librosa or use a source separator (demucs) for a firmer breakdown.

Music
- Not isolable; a quiet bed under the voice is perceptible in the 150-400 Hz and 1-3 kHz region (cinematic cello / pad character, minor feel); loudness range tiny (2.2 LU) so the bed is ducked to ~-30 dB under the voice and is not exposed anywhere.
- Pulse in 50-250 Hz onset autocorrelation: 0.88 s (68 BPM; weak) and 0.37 s (161 BPM; weaker). Cuts do not sit on a regular grid (intervals 1.0-4.5 s), so the edit is voice-driven; at most the beat helps the 3-4 consecutive 1.4-1.5 s shots between 23.4 and 28.5 s.
- Music stops audibly at f493 (t 30.75): high band -26 dB, mid -16 dB within 200 ms of the cut: the bed ends/ducks for the end card (the last 3.9 s are voice + room tone only, plus UI-like clicks suspected for the typing).

SFX hits (time, frame, measured in a 0.26 s window starting 60 ms before the cut vs the 400 ms before; sub=30-110 Hz, mid=110-500 Hz, hi=4-10 kHz)
| Time | Frame | Sound (guess) | Evidence |
|---|---|---|---|
| 0.62 | f11 | big low "whoomp" / impact at the punch-in | sub +25.7 dB |
| 2.00 | f33 | impact + short whoosh into the wall | sub +13, hi +13 |
| 3.50 | f57 | paper rip / tear whoosh, low swell | sub +7, hi +6 (tear span 3.3-3.7 s) |
| 4.44 | f72 | soft tap (painting lands) | hi +6; sub -6 (not an impact) |
| 6.56 | f106 | low drone hit | sub +6 |
| 8.06 | f130 | bright shimmer / riser peak at the punch | hi +13.6 |
| 9.25-9.44 | f149-152 | zoom whoosh (pitched sweep) | sub +0.7, mid -7.5, hi -7.6 (i.e. whoosh hides under voice; not measurable) |
| 11.31 | f182 | thud (brain lands) | sub +10, hi +7.6 |
| 12.31 | f198 | click / pop (label box) | hi +6 |
| 13.19 | f212 | low boom | sub +17.3 |
| 14.62 | f235 | none measurable | - |
| 18.06 | f290 | low thud + brightness (ear/knife sting) | sub +6.6, hi +7.5 |
| 19.75 | f317 | whip whoosh (screen slides up) | mid +17, hi +5.7 |
| 21.75 | f349 | deep boom into keyhole | sub +15, hi +9 |
| 23.44 | f376 | big broadband hit, whoosh + impact | mid +28.6, hi +20.5 |
| 25.00 | f401 | low hit | sub +12 |
| 26.9-27.1 | f433-434 | pillar sweep whoosh, short low swell | hi -11 at 27.06 means whoosh already done; sub +1.9 |
| 28.56 | f458 | broadband hit | mid +13.7, hi +11.7 |
| 29.69 | f476 | click/thump (punch) | hi +8.8 |
| 30.75 | f493 | silence drop (music cut) | hi -25.6, mid -16 |
| 32.7-33.8 | f523-545 | typewriter/UI clicks under the typing (the 32.97 onset +6.9 sigma in the 30-150 Hz band; 33.34 +6.9; 33.59 +9.0; 33.83 +10.2) | low-band flux peaks rising with the letters; guess: keystroke clacks, 4-5 per second |
Also strong low-end flux candidates in gaps between words (sub-bass peaks +17-20 dB): 1.9 s, 3.3-3.9 s (voice zone), 9.2-9.4, 11.3, 13.2, 17.9, 21.7-22.1, 27.2, 32.7+ → same as the table; the 17.9 s thud sits just before the f290 cut (0.15 s early: audio leads picture by ~2-3 f).
No clock ticks, no burn crackle, no fire sounds were detected (the 'burn' / 'crackle' guess from the brief does not apply: the tear transition is paper rip/whoosh at 3.3-3.7 s).

## 4. Hardest to clone (top 8)

1. Image-to-video clips with consistent identity: shots 8 (Gauguin/Van Gogh argument, 3.4 s), 10 (door walk), 12 (rotating painted gallery, flying canvas) and 13 (painter at easel) are generated motion (16 fps), not layers; the hand/arm gestures and cloth motion cannot be built with Remotion transforms. Needs an image-to-video model per shot, same start frame and a style prompt; also lip/hand artefacts, 5 s limit, and the 16 fps stepped look must be matched by resampling.
2. Cut-out consistency across ~14 distinct generated images: the same Van Gogh (red hair, beard) appears as photo-real (drowning), painted profile (blossom), crowned figure (clock hall), full painted figure (plinth), painter, 3/4 bust (sunflowers). Identity, scale and lighting must be unified; most shots demand clean alpha cut-outs with soft shadows (frames, brain, clocks, leaves, folder).
3. Torn-paper hole transition (f53-60): organic hole growth with ragged paper rims, wall content on one side and next scene seen through the holes, while a cut-out figure overlaps the hole edge. Needs displacement/metaball masks plus a rim texture, 8 frames at 16 fps.
4. Keyhole zoom-through (f349-361): a high-resolution ornate plate with an alpha keyhole, defocus pull, scale 1x to 6x and a split-halves exit; the plate scale must be perfect or it reads as a crude zoom.
5. Skull-lift punch (shot 4b) and brain fall (5 to 6): multi-layer cut-outs (cap, hair, brain, yellow ring, vine overlay growing along the body) with a hard camera punch at f130, then a zoom blur (radial) into the balance shot and a match-cut falling brain at f181 to f182 across two different scenes.
6. Per-letter type choreography with depth: ~25 text blocks with typed entrances at 1-2 letters per frame, fake-3D shadows, gradient fills, text living in the camera world (VAN GOGH crops after the punch), text occluded by a figure (LATER/TER), text tracking a moving tag (PAUL GAUGUIN) and PAIN stamps jittering every 2 f; every timing is within +-3 f of the voice (except shot 10, where it trails by 4-13 f).
7. Roman-numeral clock ring with parallax frames (shot 7): numerals orbiting on a 3D disc, rotating each at its own angle, depth-of-field blur, and background frames at 4 depths during a dolly-in; requires true 3D (three.js / Remotion ThreeCanvas) rather than 2D scaling.
8. Falling maple leaves, blossom and impasto texture (shots 3a/3b, 9): 14 photographic leaves with depth blur, 3-axis rotation and collisions with text; Van Gogh impasto sky/sunflower textures and the heavy grain/vignette/film grade across all shots; the painterly 'tactile' look is easy to lose with flat compositing. Also audio: the voice-driven impacts and whooshes at every cut (sub-bass boom library) and the music drop at f493 must be recreated.
