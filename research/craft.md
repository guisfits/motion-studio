# Craft research: Vox-style paper cut-out collage (9:16 Reel, 60-90 s)

Scope: numbers-first rules for camera, timing, piece motion, captions, sync, pacing, sound, endings.
Complements `skills/_shared/moran.md` (tag ANI; recipes from Chris Moran's AE presets: gate weave, flicker, jitter, callouts, textures). This file does not repeat those; it covers craft and measurable thresholds.

Tags in rules: `[n]` = source id. `[own]` = my synthesis/judgment, not stated by a source (treat as a starting value to tune against references, not a fact). `[web-blog]` = creator blog, no primary data.

Research gaps (honest): no source opened for Chris Moran's own tips, School of Motion articles, Premiere Gal, Jake in Motion (search returned none/paywalled), nor a Vox-published "how we make" video (only a Vox art director interview and Joss Fong Q&A). Gumroad pages for Ben Marriott / Motion Nerds had no body text. Kinetic-typography study PDF (Dolic 2024) was unreadable binary. Numbers for camera easing in cut-out specifically come from UI-motion and AE sources plus [own].

## 1. Sources (all opened and read)

1. https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617 : Netflix Timed Text General Requirements. Min 5/6 s (20 frames @24) per event, max 7 s, max 2 lines.
2. https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977 : Netflix English (USA) style guide. 20 cps adult, 17 cps children, 42 chars/line, 2 lines.
3. https://clevercast.com/bbc-subtitling-guidelines : BBC subtitling summary. 160-180 wpm (0.33-0.375 s/word), ~0.3 s/word minimum, 68% width of 16:9 frame, 2 lines, 1.5 s min gap.
4. https://md-subs.com/blog/tis1-reading-speed : Why cps/wpm alone mislead. Short captions need more time (gaze shift), busy picture/audio needs more time, caps/italics slow reading.
5. https://www.storybench.org/?p=21229 : Vox art director Joey Sendaydiego. 2-3 weeks per video, design starts at scripting ("what is the essential thing to show"), construction-paper style, "don't aim for perfection... looks like an ad", retention is the KPI.
6. https://www.theopennotebook.com/2020/01/07/videogram-how-a-vox-video-explains-the-science-behind-the-first-photo-of-a-black-hole/ : Joss Fong (Vox). Music swapped ~every 20 s, track edges as cues, hook early, write for the ear, delay the reveal, gentle camera moves, a script editor flags confusion.
7. https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/ : Replicating Vox motion graphics. 12 fps graphics in a 24 fps timeline, EasyEase camera peaking at the edit point, short blur shorter than the move, jagged step-wise mask reveals, 2-3 textures per second as background.
8. https://huehd.com/stop-motion-animation-frame-rates-explained/ : Stop-motion fps basics (10-12 fps typical, fewer frames = choppier). Low value; used only for the fps floor.
9. https://publish.obsidian.md/mister-chad/animation/animating+on+the+ones%2C+two%2C+and+threes : Ones = 24 drawings/s, twos = 12 (default), threes = 8 (stylized), fours+ = deliberately choppy; mix them.
10. https://darkskiesfilm.com/how-to-do-cut-out-animation/ : Cut-out: 8-12 fps for simple movement, ease in/out, arcs, overlapping action, 2+ lights, depth layers small-back/large-front, multiple hand/mouth variants.
11. https://pexo.ai/tutorial/how-to-make-a-paper-animation : Five paper-illusion breakers: no shadows, single-piece characters, impossible camera moves, clean vector edges, 24 fps. 3-4 depth layers, 12 fps, >=1080p.
12. https://blog.cg-wire.com/12-principles-animation/ : Principles in prose: anticipation, slow in/out, overlap/follow-through, uniform timing = wrong weight, stopping everything at once looks stiff.
13. https://m1.material.io/motion/duration-easing.html : Motion duration/easing spec. 300 ms typical, 225 ms enter, 195 ms exit, >400 ms feels slow; curves with control points; AE velocity influence values (standard 40%/80%, decelerate 0%/80%, accelerate 40%/0%).
14. https://valhead.com/?p=2978 : UI animation duration. 200-300 ms small, 400-500 ms large distance, <200 ms is barely perceived (~230 ms perception).
15. https://www.provideocoalition.com/tip_create_cinematic_motion_blur_in_after_effects_and_in_life/ : 180 degree shutter = 1/48 s at 24 fps; AE shutter phase = -90.
16. https://www.wipster.io/blog/debunking-the-180-degree-shutter-rule : Blur = (angle/360)/fps; staying near 1/48-1/60 s; too far gives staccato strobe; add blur in post if rendered without.
17. https://morphic.com/resources/how-to/how-to-sync-sound-effects-to-video : Sound sync: align the transient not the file start, zoom to frame level, nudge 1-2 frames earlier if late, judge the export not the scrub.
18. https://www.opus.pro/blog/ideal-instagram-reels-length : Reels rules of thumb [web-blog, no cited studies]: hook window 1.5 s, cut/visual change every 1.5-3 s, static >4 s is a danger zone, text overlay 1-2 s, retention falls with length.
19. https://www.remotion.dev/docs/text-highlights : Rough-notation defaults: highlight draws over 25 frames, underline over 21 frames, strokeWidth 10, 3 iterations, roughness 2.3, highlight alpha ~0.62.

Secondary (search-result snippets only, not opened): NN/g animation durations via second-hand quotes (feedback ~100 ms, modal 200-300 ms); Material 3 emphasized curves `cubic-bezier(0.05,0.7,0.1,1)` / `(0.3,0,0.8,0.15)`; Dolic et al. 2024 (word rate and interpolation in kinetic type, no usable numbers). Use as hints only.

## 2. Rules by area

### 2.1 Camera / zoom

- Every camera move = ease-in-out, never linear. Linear reads mechanical [13][14]. Starting curve `cubic-bezier(0.4,0,0.2,1)` (AE influence 40% out / 80% in) [13].
- For a "punch" feel, use a hard ease-out (decelerate): `cubic-bezier(0,0,0.2,1)`, or sharper `(0.05,0.7,0.1,1)`; the move spends most of its time settling, so the eye reads the destination [13][own].
- Duration scales with distance: small push 200-300 ms, large 400-500 ms, past 400 ms feels slow in UI [13][14]. For a narrated Reel the camera has room to be slower: push-in 0.8-1.5 s, big pull-out 1.5-2.5 s [own, match to reference timings].
- A "weak" zoom is usually too small and too slow. Scale delta: small beat 1.0 -> 1.15 (15%), punch-in 1.0 -> 1.35-1.6, emphasis hit 1.0 -> 2.0+ on a single object [own]. Measure references: if reference moves 40% scale in 0.5 s, yours at 8% in 1.2 s will feel dead.
- Fast move needs motion blur, or it strobes. 180 degree shutter = 1/48 s at 24 fps, phase -90 [15][16]. Blur grows with speed; if a hard punch-in still strobes, raise samples or shutter to 270 degrees [16][own].
- Hide the cut inside the move. Tracking transition: two scenes as 3D layers, camera EasyEase so peak speed lands exactly on the edit point, blur keyed up at the edit and gone a few frames later, blur window much shorter than the camera move [7].
- Zoom-through / match cut: end shot A on a shape (circle, window, page) that the next shot fills, so the push goes through it. Keep the shape centered +/-5% of frame [own].
- Parallax: 3-4 depth layers; back layers move less (e.g. 0.3x, 0.6x, 1.0x of the foreground) [11][own]. A 2.5D camera move on a single flat layer reads as a Ken Burns slide, not collage.
- Keep camera gentle when the content is the point (maps, documents): slow drift 3-6% scale over the whole shot, not a shake [6][own].
- Pair every push-in with a reason: a word is spoken, a detail matters. Camera moves with no narrative cue read as filler [own].
- Anticipation for camera: a 3-6 frame pull-back (1.00 -> 0.97) before a big push makes the push feel bigger [12][own].

### 2.2 Easing & timing

- Entering pieces: decelerate (ease-out), 225 ms typical; leaving: accelerate (ease-in), 195 ms, shorter because they need less attention [13].
- Never one duration for everything: scale to distance and size [13][14]. Under ~200 ms is barely perceived [14], so a 4-frame (@24) pop is a flicker, not an entrance. Minimum visible entrance: 6-8 frames @24 (250-330 ms) [14][own].
- Hold time after an arrival: the eye needs ~0.5 s of stillness to register a new picture [own]. Moving everything continuously with no rest reads as noise.
- Stagger: offset starts of grouped elements by 2-4 frames @24 (80-170 ms) per item; max total stagger spread ~0.5 s so the last item is not late for its word [own, concept from 12].
- Overlap / follow-through: secondary parts start 2-5 frames after the main body and settle ~3-6 frames later; "stopping everything at once looks stiff" [12][10][own for frame counts].
- Anticipation: bigger action = longer wind-up; a piece that pops in should dip ~5% (scale 0.95) over 2-3 frames first or overshoot ~8-10% then settle in 4-6 frames [12][own].
- Overshoot only on pieces that are light and friendly (stickers, labels); heavy paper, maps and documents settle without bounce [12][own].
- Weight via timing: heavy = slow in, long settle; light = fast, snappier [12].
- Time the whole beat on the audio waveform, not on the timeline grid. Place the arrival frame (end of ease) on the spoken word's onset or up to 3 frames before it [17][own].
- Work in a 24 fps timeline, animate cut-out motion on twos (12 poses/s) as the default and drop to ones only for the fastest camera moves [9][7][11]. Threes (8/s) for jitter accents and "stop-motion boil" [9][10].

### 2.3 Piece motion (cut-out)

- Cut characters and figures into separate pieces (head, torso, upper arm, forearm...) with pivots at joints; one-piece figures can only slide/rotate [11][10].
- Motion vocabulary of paper: slide, rotate, fold, swap between a few poses; no turning away from the camera, no perspective change without a new piece [11].
- Provide variants for hands/mouths/expressions so the swap, not a warp, creates change [10].
- Move along arcs, not straight lines [10].
- Accent with step-wise reveals: wipe/mask a block in jagged increments, skipping frames here and there, text offset a few frames later than its plate [7].
- Pieces entering from off-frame: slide with ease-out and a small rotation (2-6 degrees) toward rest; pure translation looks like a UI panel [own].
- Idle life: held pieces get subtle 2-4 px jitter on threes (8 Hz) instead of dead stillness (see `skills/_shared/moran.md`, jitter) [9][own].
- Depth by size: smaller cutouts back, larger front [10]; 3-4 layers [11].
- Never let two big pieces move in the same direction at the same speed at the same time; offset speed 20-40% or timing 3+ frames [own].

### 2.4 Texture & paper realism

- Single directional light, soft shadow under every layer: "shadow separation is the entire illusion" [11]. Keep one angle across the whole film [11][own].
- Shadow grows with lift: a piece mid-flight gets a larger/softer shadow (e.g. offset 4 px resting -> 14 px lifted, blur 3 -> 10 px) and lands back [own].
- Over-used drop shadows on everything also read fake; shadows only where a piece sits over another (judgment from search snippet, own).
- Keep paper grain visible, uneven torn/cut edges; perfectly clean edges read as vector art [11].
- Texture variety: rotate/flip textures; 2-3 distressed textures per second for animated backgrounds (not one static texture) [7].
- Export >= 1080 px wide; check the encoder is not smoothing the grain [11]. For 9:16 that is 1080x1920.
- Photos in a collage must share the treatment of the cutouts (same grain, edge, shadow, limited palette); one untreated photo kills the illusion [11][own].
- Limit palette to 3-4 hues plus paper neutrals [own].
- Imperfection is intended: "an overly polished look can look more like an ad than an editorial piece" [5].
- Subtle lens character (edge chromatic aberration + 3.5 blur at 50 feather) adds film feel, but keep it subtle [7].

### 2.5 Typography / captions / lettering

- Reading speed ceiling (English subtitles): 20 cps adult, 17 cps children, 42 chars/line, 2 lines max [2]. For a mobile Reel with a busy picture, plan for <= 15 cps [4][own].
- Time per word: 0.33-0.375 s/word (160-180 wpm); floor ~0.3 s/word [3]. 4-word caption >= 1.2 s [3].
- Minimum on-screen time of any caption: 5/6 s (20 frames @24) [1]; for a 2-3 word chunk in a Reel, hold >= 1.0 s after fully legible [1][own]. Chunk text overlays: 1-2 s each in blog guidance [18].
- Maximum: 7 s [1], but for Reels aim <= 3 s per chunk (a 4 s static hold is a danger zone) [18].
- Entrance must be shorter than half the hold: 6-10 frames in, legible hold >= 20 frames, 4-6 frames out [own]. "Caption changed before I could read it" = hold < the 0.3 s/word floor or counted from the start of the entrance instead of from full legibility [3][own].
- Short captions need MORE time per character than long ones (gaze shift to the text) [4]; add ~0.25 s flat to 1-2 word chunks [4][own].
- Busy shot or loud audio -> longer hold; caps, italic, script fonts are slower to read [4]. Avoid decorative blackletter for narration-carrying text (mission, not caption) [4][own].
- Text width: <= 68% of frame width on 16:9 [3]. On 9:16 keep chunks inside the 80% central width (864 of 1080 px) and clear of the UI safe zones (about top 250 px, bottom 420 px) [own].
- Size: x-height readable at phone size: cap-height >= 4% of frame height (>= 77 px at 1920) for body captions [own].
- Contrast: every caption on a plate or heavy outline; collage backgrounds are noisy [4][own].
- Max 2 lines [1][2][3]; for Reels, 1 line of 2-5 words is better [own].
- Lettering that is a design element (a drawn word) must be spoken at its appearance: the word arrives within +/- 3 frames of the voice saying it [own, see 2.7].
- Mixing styles per word: only one emphasis style (one color or one font weight) per film [own].
- A stagger-in of letters/words must finish before the speaker finishes the phrase: total reveal time <= 60% of phrase duration [own].

### 2.6 Annotation (scribble / highlight / underline)

- Draw-on duration: highlight ~25 frames (@30 = 0.83 s), underline ~21 frames (0.7 s) as library defaults [19]. For narrated emphasis use 0.3-0.6 s [own]; the stroke should finish as the word ends, start it just before the word is spoken [own].
- Underline stroke 10 px (at 1080 wide: ~12-14 px), 3 passes, roughness 2.3 for a hand look [19]. Highlight alpha ~0.6 so text stays legible [19].
- Highlighter sits behind the text; offset slightly lower-left (padding 20 px each side) [19].
- Mark only the one word that carries the claim. More than one active annotation at once splits attention [own].
- Direction: left-to-right (right-to-left only for RTL text) [19].
- Step the draw on twos/threes with slight width jitter so it looks hand-made rather than a perfect vector wipe [7][9][own].
- Ink should bleed/rough at ends; flat mathematically perfect lines read as UI [11][own].
- Annotations must remove themselves or fade before the next caption lands, within <= 8 frames [own].

### 2.7 Picture-voice sync

- Script design first: ask "what is the one essential thing to show here" while writing the script [5]. One idea per picture; every sentence gets a named visual before animation starts [5][own].
- Plan with a two-column table: script on the left, visual on the right [own]. Add a third column: exact timestamp of the keyword.
- Picture arrives on or up to 3 frames before the spoken noun; never after [17][own]. The ear tolerates visuals a bit early, not late (sound sync "a hair early reads better than late" [17]).
- Leave it for the narrator to say: a picture that shows a different concept than the narrator's words is worse than a plain card. If no honest picture exists, show the lettered word, not a decorative one [own].
- Hold the picture for the whole clause that refers to it; do not cut away mid-sentence [own].
- Delay reveals: set up the difficulty before showing the payoff [6].
- Camera/scale carries emphasis too: the word being stressed gets the push-in [own].
- Write for the ear; if dense, a viewer cannot take picture and words at once; use a script editor [6].
- Verify with a timing sheet: per beat, words, start/end second, picture id, caption chunk, camera move; automatic check that no caption chunk is shorter than its floor and no picture start is later than its keyword [3][own].

### 2.8 Pacing / structure

- Hook inside the first 1.0-1.5 s: strongest picture + a claim; skip the logo and slow pan [18][6].
- Visual change (cut, camera move, new piece) every 1.5-3 s; any static shot > 4 s is a danger zone [18]. For a thoughtful educational topic stretch to 2.5-4 s with continuous micro-motion (drift, idle jitter), but never a frozen frame [18][own].
- A 60-90 s Reel has more drop-off than a 15-30 s one [18, blog]; compensate with 3-4 micro-beats (reveal, close-up, surprising detail) at fixed intervals (~every 15-20 s) [18].
- Vary rhythm: alternate fast stacks (3-4 pictures in 4 s) with a held beat (3 s) at key claims [own]. All-fast = noise; all-slow = lecture.
- Keep at most 1 new idea per 8-10 s; one number or name per beat [own].
- Music: change texture roughly every 20 s, use start/stop edges as cues, keep it out of the voice's frequency range [6].
- Retention metric is the target, not polish [5].

### 2.9 Sound

- Align the transient, not the file start; trim silence first, zoom to individual frames, set a marker on the action frame [17].
- If it feels late, nudge 1-2 frames earlier; check on export, not scrub [17].
- A whoosh peaks on the edit/arrival point, ending on a dull impact so the move has a destination [17 (product page, practitioner view)].
- Layer on separate tracks, same marker, each transient aligned [17]; paper = airy slide/flick body + short transient (tap/slap) [own].
- Weight by pitch: low dropping rush = heavy, thin = light [17].
- One paper sound per visible motion; do not sound every tiny jitter (noise); sound only entrances, big camera moves, annotation draws [own].
- Duck music 6-10 dB under voice; keep SFX peaks 3-6 dB under the narrator's peak [own].
- Vary variants (3+ per sound) so repeated paper sounds do not machine-gun [own].

### 2.10 Endings

- The final camera move must reveal or resolve something: pull out onto a complete composition (all key pieces present, readable), never onto empty paper [own, from client note "final pull-out showed nothing"].
- Hold the last composition >= 1.5-2.5 s, with the closing line/CTA legible for the caption floor (>= 1.0 s after legible) [3][own].
- Pull-out sets scale 1.0 -> 0.55-0.7 so the viewer sees "all that came before" arranged as a collage [own]; pieces must already be placed on the final frame (build them during the film).
- The last spoken word lands on the apex of the final move; finish the music with an edge cue [6].
- Loop-friendly: end composition similar to opening framing so replay is seamless (replay counts for ranking per blog claims) [18, unverified].

## 3. Amateur tells (top 15) and how to detect them in a render

| #   | Tell                                                                                                  | How to detect in a frame/strip                                                                                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Captions change before readable (hold < 0.3 s/word, floor 5/6 s) [1][3]                               | Sample the caption text every 6 frames @24 into a strip; any caption visible fully in < 5 consecutive samples (< 1.25 s) with > 2 words fails. Compute cps per cue: > 17 fails [2].       |
| 2   | Caption starts counted from the entrance, not full legibility [3][own]                                | Compare timeline: opacity==1 duration, not total. Strip: first frame at 100% opacity to last frame at 100% must be >= floor.                                                              |
| 3   | Picture does not match what is said [own]                                                             | Overlay the word timestamps on the frame strip; for each noun, frame at its onset must contain that concept; a human/LLM check on the 3 frames around each keyword.                       |
| 4   | Picture arrives after the keyword [17][own]                                                           | Frame diff (first frame of the new piece) vs keyword onset: > +3 frames late fails.                                                                                                       |
| 5   | Weak zoom: < 15% scale change or slow, linear [13][own]                                               | Log camera scale per frame; max(scale)/min(scale) per move; speed curve must be non-linear (peak-to-mean speed ratio > 1.5). Compare to reference numbers.                                |
| 6   | Linear or uniform timing everything same duration [12][13]                                            | Histogram of move durations: > 60% of moves within +/- 1 frame of the same length fails.                                                                                                  |
| 7   | No motion blur on fast moves, strobing [15][16]                                                       | Take two consecutive frames in a fast move; edge displacement > 40 px with no smear along motion axis.                                                                                    |
| 8   | Dead stills > 4 s [18]                                                                                | Frame-to-frame diff over a sliding window; mean diff ~0 for > 4 s fails.                                                                                                                  |
| 9   | Pieces slide like UI panels (no rotation, no overshoot, no settle), everything stops at once [12][11] | Pieces' rotation track constant; all pieces' velocities hit zero on the same frame (stop-sync).                                                                                           |
| 10  | Perfect vector edges, no grain, no/identical shadows [11]                                             | Zoom 200% on an edge: antialiased clean line, no fiber/roughness. Shadow offset identical regardless of lift.                                                                             |
| 11  | Photo not treated like the paper pieces (different grain/colour) [11]                                 | Strip: noise level/histogram of photo area vs neighbouring paper differ markedly.                                                                                                         |
| 12  | Lettering disconnected from narration (a drawn word appears on a different word) [own]                | Word-timestamp vs lettering appearance frame; > +/-3 frames or different word fails.                                                                                                      |
| 13  | Text too small or in UI-unsafe zone, low contrast [4][own]                                            | Render safe-zone overlay (top 250/bottom 420 px); cap-height < 77 px at 1920 fails; contrast ratio of text vs local background < 4.5:1 fails.                                             |
| 14  | Annotation too slow/fast or on the wrong word, multiple at once [19][own]                             | Draw-on frame count outside 7-18 frames @30; more than one annotation active within the same second.                                                                                      |
| 15  | Final pull-out reveals nothing / empty frame, abrupt end, no hold [own]                               | Last 3 s strip: pixel coverage of non-background pieces < 30% of frame on the last frame fails; last composition held < 1.5 s fails. Also check the last keyword lands on the apex frame. |

Also check (merged above): hook missing in the first 1.5 s [18] (frame 0-36 must contain the strongest picture and a caption/claim); sound late (transient vs motion apex > 2 frames after) [17].

## 4. Suggested hard checks to wire into a render QA script

- cps per caption <= 17, floor hold >= 20 frames @24, entrance <= 10 frames, 2-line max [1][2].
- Every keyword noun has a picture frame within [-3, 0] frames of onset [17][own].
- Camera moves: eased (no linear segment > 3 frames), scale delta >= 15% for emphasis moves [13][own].
- No static window > 4 s [18].
- Final frame non-empty (>= 30% coverage) and held >= 1.5 s [own].
