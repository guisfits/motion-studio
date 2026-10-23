# Baseline: "Arrependei-vos" (owner 10/10, draft v18, 111 s) - acceptance bar for every Remotion demo

Status of evidence: **final mp4 NOT found** (`find` under the film folder: none; `out/`, `voice/words.json`, `voice/voice.wav` are gitignored, pending media-pull). Stills pending media-pull; timestamps below come from `crew/sync-sheet.json` (beat spans), `crew/sfx-cues.json` and the scene files. Duration = last beat end 112.69 s + 0.5 + END_HOLD 2.4 (index.html:36-38) ~ 115.6 s on the current sheet.

Paths: `F` = `media/video-short/films/ig-reforma-arrependei-vos`; `S` = `media/video/studio`. Engine v1 files are being moved to `S/archive/engine-v1/` and `S/tools/audio/` (core/audio is gone from `core/`); `core/lib/{motion,table,texture,rig,voice,torn,phone,clip}.js` still exist.

**Format caveat.** The film is 9:16, 1080x1920 (index.html:2, stage `formats: ["9x16"]`), Reels safe box x70-915, y220-1520. Demos are 1920x1080 / 30 fps: carry over ratios (scale %, seconds, fps, spring k/d), not pixel offsets. The film was authored as a pure function of t (no CSS transitions, `Math.random` banned, `M.rng(seed)`; scenes/README.md rule 3). Remotion must keep that: `frame/fps`, seeded noise only.

## 1. Techniques and exact parameters

| # | Technique | Parameters (exact) | file:line |
|---|---|---|---|
| 1 | Camera: bell legs | Smootherstep `p^3(6p^2-15p+10)` per leg; keys `[t, s, x, y]`; `s` stays 1.0-1.16 for readable scenes (max 1.42 only on b20 slip shot, 1.22 on seal push). Never a punch/shake. Frame never passes board edge (`x >= 540/s`) | scenes/ease.js:4-26; README.md:11 |
| 2 | Camera: scene paths | s01 drift +3 % to "indulgencias" then bell 1.6 s: +10 % scale, y+40. s02 +2 % drift, +13 % spring (k20,d9) on "palavra". s06 keys 1.0 -> 1.02 -> 1.09 -> 1.15 (bells 1.5-2 s, Luther's face always in frame). s08 1.0 -> 1.1 -> 1.03 -> 1.16 (smoothstep 1.5-2.5 s). s10 1.0 -> 1.14 -> 1.0 -> 1.04-1.085 -> 1.22 (seal push +15 % over 1.8 s), hard cut to 1.38-1.42. s11 1.0 -> 1.14 over 1.6 s then tilt down. s15 1.0 -> 1.12 -> 1.2 (END_CAM). s17 1.2 -> 1.05 -> 1.12 -> 1.0 -> 1.03 | s01.js:158-162; s02.js:123-127; s06.js:248-252; s08.js:170-186; s10.js:345-369; s11.js:187-196; s15.js:141-148; s17.js:325-336 |
| 3 | Camera: end-of-film lean | Close breathes in 2 % through the bell hold (END_HOLD 2.4 s) | index.html:36-38 |
| 4 | Parallax | **None as multi-plane.** Depth = z-class shadows only (`.z1-.z4`: 1-4 stacked drop-shadows, e.g. z4 `0 3px 3px .6 + 28px 40px 30px .4`), plus s09 fan with `depth` translate -1300 -> +62 via `carryIn(0.42)`. Flat table, camera moves the whole world | index.html:46-49; s09.js:571 |
| 5 | Paper set-down (carry in) | `carryIn(t, tLand, dur=0.55, over=0.04)`: cubic ease-out travel from OUTSIDE the frame, overshoot `0.04*exp(-14s)*sin(24s)`, back within ~0.25 s. Variants: dur 0.25-0.6, over 0 or 0.02. Pieces fall "from a hand's height", never a camera-close punch | ease.js:29-36; s01.js:121-126; s02.js:109; s06.js:224; s09.js:232-278 |
| 6 | Springs used | `sp(t,t0,k=170,d=26)`; named values: 150/20 (slip rise), 120/20 (lens, drop), 300/24 (row confirm), 70/15 (tab), 60/12-15 (sheet lift/slide), 38-45/11-12 (card out, touch), 160/14 (cross touch-down), 20/9 (slow camera push), 190/17 (strip), 95/19.5 (s18 strip) | s01.js:52; s08.js:151-160; s10.js:240,563; s17.js:221,286,298,310; s18.js:386 |
| 7 | Step fps (stop-motion) | **12 fps** for typed text, scissors snip (+-3 deg alternating), rig poses (`stepPose(t, keys, 12)`), leaf flip, `hand` springs (`stepped(t-tIn,12)`). **24 fps** for the hammer-blow jolt (`a*exp(-9s)*sin(stepped(s,24)*40)`) and s14 crack shiver (`1.1*sin(stepped(t,24)*9)`). **8 fps** breath (`0.004*sin(stepped(t,8)*2.2)`). Camera and big moves are NOT stepped (smooth) | motion.js `stepped`; s02.js:89,117; s10.js:230,532; s11.js:292; s06.js:158,238; s14.js:158 |
| 8 | Wiggle / paper life | Engine default `texture()`: wiggle 2 px, fps 12, seed 1. Film: continuous slow breathing (sheet corner `0.45*sin(1.4t)` deg, tag sway, `Math.sin(t*0.8)` card tilt 0.5 deg, ground slide 22 px over the scene tail). Holds >= 1.5 s must carry idle life | texture.js:64,140-152; s02.js:128-130; s14.js:24; s15.js:277; README.md:Rule 5 |
| 9 | Torn paper edge | Seeded clip-path polygon (`tornClip(seed, n=16, depth=3.5)`), `tornLine` field = 0.65 coarse fbm(3 oct) + 0.35 fine fbm(2 oct, x40), white fibre `#f4eee2` at edge, die-cut rim 6 px `#f6f2ea` (four 6 px drop-shadows), tear mask `tl-papel-rasgado-1/-2` | torn.js:6-26; index.html:44-45; style-bible.md:s4 |
| 10 | Tear event | s01 white dashed guide draws from left edge, then strip rips on "nao": jerk up, fall, land askew (-19 deg), +-0.04 scale lift, halves jolt apart and settle; cue `tear` t=tRip+0.02 g0.55. s11 tear across print at y=1040 and vertical x=300; s14 crack line then Latin column tears down, P1 papyrus under it | s01.js:92,129-145,216,231; s11.js:29-30,77; s14.js:70-79,258,286 |
| 11 | Tape / pin / tack | Pin (alfinete) drops on "teses", tack/tape pieces enter by motion (carryIn 0.25, over 0); tag sways on pin. Tape/pin appear in-place only where the gate flagged T12 (see sec 2) | s01.js:92,117; s02.js:206; checks-final.md |
| 12 | Scene join (paper) | Outgoing scene held on its last frame (`t1 - 1/120`) as one torn sheet (jagged clip polygon 24+40+24+40 pts), pulled off over the new scene, `JOIN_S = 0.75 s`, smootherstep; alternate odd = slide left (`-1240 px`, `-40`, `-8 deg`), even = lift up (`-2150 px`, `+60`, `+5 deg`); scale `1 + 0.03*sin(pi*min(1,1.2u))`; shadow layer rgba(20,12,6,.55) blur 28 px, offset 24+30*lift / 30+40*lift. `continues:true` scenes (s17 after s15, s10 shot) skip the join. Hard cut only inside a scene (b20, b25) | ease.js:38-40; index.html:215-262 |
| 13 | Texture / grounds | `.red` = `--sang #85362e` + cartolina grayscale(1) contrast 1.7 brightness 1.3 multiply .75 + riscos screen .14. `.cream` = jornal sepia .3 + amassado multiply .35. `.paperw` paper4 1400 px saturate .55. One ground per passage | index.html:25-30; style-bible.md:s2 |
| 14 | Grain / dust / finish | One film grain over all layers: `K.grain(stage,{strength:0.06})`, z-index 10, 24 fps default. `.dust` grunge-poeira screen opacity .08 on every scene. NO fringe/scan/vignette/flicker in any board (`finish()` not used). Phones, paper and type share one surface | index.html:197-201; style-bible.md:s3 |
| 15 | Kinetic type | Entrance by MOVE (drop, slide, slam, tear), never fade. Stamp word Cormorant 700 330/230/250 px, ink `--sangInk #621d18` broken by riscos; typed slip Special Elite 30-66 px; Old London 150 px; Pinyon 72-76 px rot -5..-8; IM Fell on prints. Max 5 voices, one accent red. Typewriter reveal: `floor((stepped(t,12)-tIn)/dur*len)+1` chars, e.g. 0.42 s slip | style-bible.md:s1; s02.js:117; s10.js:230; s15.js:153 |
| 16 | Marks | Pencil/ink stroke `#2a1a10` / `#2b2622`, 6 px, round caps, `rough` filter (feTurbulence 0.9, 2 oct, scale 5); stroke-dashoffset write-on (`strokeP(t,tPrim,0.7)`); `revealProgress` pen k40 d12.6; PEN_SECONDS 0.45 after word end; ring overshoots start and closes past it. Highlighter `rgba(214,96,70,.6)` 14 %-90 % band, multiply, one stroke, sweep 0.4 s | style-bible.md:s1; s17.js:517; voice.js:216-219; s08.js:240 |
| 17 | Captions / word timing | **No running captions in the 10/10 film** (review.md D4: "lettering carries the lines"; style-bible s1). Word times from `voice/words.json` via `ctx.word(w,{line,nth})`, sheet `key/lands` per row; every visual trigger lands on the spoken word | review.md:43; index.html:80-88; README.md rule 2 |
| 18 | Voice | TTS `will-sp`, start 0.05, gap 0.15, per-line `pause`; respelled foreign words (`say`: "Vitenberg", "Martinho Lutero,"); 163 words; joins 0.15-0.3 s | narration.json:2-4,22-32 |
| 19 | Diagrams / diagram-like | No node-edge diagrams. Equivalents: Vulgate/Thesis side-by-side align-and-click (b14), pair fan of 3 pairs landing on "Biblia/latina/epoca" (b38), numbered tags 95, 1 confissao, 2 satisfacao, 3 moeda (b16-b19) | s09.js:79; s10.js:7-8 |
| 20 | Puppet / rig | `loadRig/drawRig/stepPose`, rigs `cranach-lutero`, `durer-penitente`, `pauwels-teses`; keyed poses at 12 fps; scourge = 3 slow lashes + white ink arcs on "satisfacao"; hammer 3 blows on word beats; arm aiming bob until first wind-up. Hit lands on its word with its SFX | rig.js:109,167-185; s10.js:19,196,280-282,532; s06.js:93-95,150-170 |
| 21 | 3D | CSS 3D on paper: `perspective(1600px) rotateY(-ca)` Bible cover swing, `perspective(900px) rotateX(<=0.5 deg)` sheet tilt, `perspective(1600px) rotateX(1.6*lift)` strip edge lift, backface-hidden leaf. THREE phone (`phone3d`): fov 18, width 600, base scale 1.188, rest S0 0.9 at (540,1010), PUSH 1.22 (app-demo 1.18-1.25), TILT 15 deg alternating, eases 0.95-1.6 s, device swap 1.3 s, lie-down slots rz -3/+3 | s09.js:530; s15.js:277; s08.js:260; s18.js:21,28-29,302-336; phone3d.js:400,416 |
| 22 | App takes | Real app recordings (iPhone light, Android dark), taps shown as dots, one fling per screen, phone moves BETWEEN gestures only | s18.js:2-13; crew/app-takes.md |
| 23 | Organic FX | Ink soak spreading across a line (b11 "toda a vida"), wet ink drying, coin settling on its rim + pile shiver (b18), seal stamp warms (b19), peeled tag flip with gloss on back (b27), paper strip "breath" | sync-sheet b11,b18,b19,b27; s10.js:296 |
| 24 | SFX events | 37 cues, soft paper only (never knock/slap/clink). Heard-time `t`, anchored at contact (`anchor:"contact"`), type counts: paper-place 6, paper-slide 6, tear 4, thud-soft 3, pen 3, click 3, highlight 2, page 2, scissors, ding, postit-peel, rustle, whoosh-deep, seal, burst, bell-distant. Gains 0.12-0.6 (tear 0.4-0.55, thud 0.5-0.55, bell 0.6, seal 0.45, ding 0.12, click 0.2). Each join adds `paper-slide` g0.35 at span+0.08 | crew/sfx-cues.json; index.html:271 |
| 25 | SFX treatment | `highpass 90 Hz, lowpass 6.5 kHz, aecho 0.8:0.6:45|95:0.22|0.12` (short low room) | sound.sh:31 |
| 26 | Mix | `--sfx-gain 2.8 --music-gain 0.8 --music-duck 0 (fixed bed) --fade-out 1.5`. Engine balance: SFX 12 dB under voice, SFX duck 10 dB, fixed bed 12 dB under voice (ducked bed 10.5 under, duck 8), voice comp `threshold -30 dB ratio 3 att 10 rel 250`, limiter 0.89, **loudnorm -14 LUFS, TP -1.5**. Bed `beds/historia/bed.mp3` (89 s, 90 bpm, bar 2.6667 s) crossfaded into second copy at bar 2; bed fades out from start of l33 to "Baixe" (l34), silent before the bell; film ends on `bell-distant` t=114.09 g0.6 held under the 1.5 s fade | sound.sh:44-56; S/tools/audio/mix.mjs:59-73,183 |
| 27 | Hold / pacing | Event cadence >= 2.6 events per 10 s (R2 gate), no frozen hold > ~2.4 s without idle life | checks-final.md R2; index.html:36-38 |

## 2. Postmortem rules a technique must honour

First-film (C = coarse, K = craft), second-film (W = worked, E = error, R = rule, H = harness gap).

- **C1** no dead frames, no placeholder ever shown. **C2** any caption stays its reading time (~15-17 chars/s), never chip-per-word. **C3** voice = picture = lettering. **C4** words never clipped by frame edge; no text over text. **C5** fill the frame, hero in centre third. **C6** end on a composed frame (no smear). **C7** crop with eyes in frame.
- **K1** zoom is a push into a target, not a linear drift; no hold on unreadable small board. **K2** pieces have overshoot/settle, shadow lift, stagger, stutter on twos; never fade/scale at 30 fps smoothness. **K3** one hero, hierarchy (not 6-10 equal clippings). **K4** ground is a table, not a flat filter; no visible tile repeat. **K5** lettering big, lands on spoken word. **K6** marks hand-drawn write-on, timed to the word. **K7** accent discipline (one red). **K8** max ~5 type voices, varied sizes. **K9** outro is a collage close, not a template card. **K10** hook: something happens in first 2 s.
- **W1** every scene is a paper verb (tear, cut, stamp, drop, carry, page turn). **W4** one objective sentence; focused script. **W5/R7** picture first: approved events keep durations, voice is fitted with pauses/rephrasing.
- **R1/E1** story <= ~90 s + 15-30 s app; lively voice; joins 0.15-0.3 s. **R3/E3** animated paper join between scenes (hard cut only inside a scene). **R4/E4** a cut-out moves from its first visible frame; never hangs frozen. **R5/E5 + H-1** every piece enters from outside the frame or from under another piece; no pop-in (gate T12 checks first visible frame box touches edge or is covered). **R8/E7** one ground per passage; a piece that enters only to leave is a defect. **R9/E8** the named object is shown, recognisable. **R10/E9** every connective earned. **R11/E10** the person stays in frame through any push. **R12/E11 + H-5** every visible tool action has its cue at contact (`anchor:"contact"`). **R13/E12** bed fades to silence before the closing bell. **R14/E13** respell foreign words in `say`; phoneme check. **R15/E14** no personal data in headers/URLs. **R16/E15** fresh agent per round, client words verbatim.
- **Film-level**: sounds pleasant first (client 2026-10-17): depth, never a knock, punch or clink. Camera calm register: bell eases 1.2-3 s, no punches, no shake. Join `JOIN_S` raised 0.5 -> 0.75 s (v17 review #6: 2-3 frame smear). Dust + one grain over all layers (2026-10-19). Reels safe box for all lettering.
- **Known gate misses on the approved film** (not regressions to copy): T7 push-in only 6 % on b07/b35 (gate wants >= 12 %), T12 on pin/tack/tape (alfinete-vermelho 2.23 s, tachinha-branca-a 7.03 s, fita-transparente-b 20.30 s), M5 cues over spoken words, M3 LRA 3.9 LU > 3, T6 hero off middle third on several beats. A demo should do at least as well.

## 3. Per plan task: "matches baseline" + reference timestamps

Timestamps are film time (s), from sheet beats.

**Task 6 - camera** (refs 0.45-3.41 b01 drift then bell to 6.03; 14.08-17.95 b07/b35 push; 88.42-91.34 b43 phone push)
- matches baseline: smootherstep bell per leg (ease.js:4), keys `[t,s,x,y]`, 1.5-2.5 s legs, scale <= 1.16 (+13-15 % pushes, 1.22 on phone).
- matches baseline: no shake, no punch; subject (face/target) never leaves frame during push; frame never exceeds board edge.
- matches baseline: slow drift (2-3 % over the whole row) under every hold; camera NOT stepped.

**Task 7 - parallax** (refs 28.61-33.95 b12 cover swing/fan depth; 33.95-36.34 b38 pull-out)
- matches baseline: depth from z-class shadows (z1..z4) and a single translate-depth carry; no independent multi-plane scroll. A parallax demo must sit on the same flat-table + moving-camera model, layers differ only in shadow height and tiny drift.

**Task 8 - paper set-down / tape / tear** (refs 3.41-6.03 tear on "nao" (cue 3.43); 53.61-59.66 b53/b21 tear; 59.66-62.64 b25 tear down Latin column, cue 61.21)
- matches baseline: `carryIn` dur 0.55 (0.25-0.6), over 0.04 decaying `exp(-14s)` at 24 rad/s, enters from outside frame; z4-style shadow lifts with `lift` then flattens.
- matches baseline: tear = dashed guide first, seeded coarse+fine fbm edge (0.65/0.35), white fibre rim, halves jolt then settle; cue `tear` g0.4-0.55 at contact.
- matches baseline: pin/tape/tack enter by motion (no in-place appear, T12); die-cut rim 6 px.

**Task 9 - kinetic type + captions** (refs 8.66-14.08 b06 slip/tag "1517"; 20.30-24.17 b10 "fazei penitencia" pasted large; 62.64-72.24 b26/b27/b41 typed gloss)
- matches baseline: type enters by move, typewriter at 12 fps (`floor((stepped(t,12)-tIn)/dur*len)+1`), stamp 230-330 px Cormorant 700 with riscos-broken ink, lettering lands on the key word (`lands`).
- matches baseline: **no running word-by-word caption layer**; if a demo needs captions, readable line >= reading time (C2), cap height 0.025-0.045 of frame (NORMS.caption), no clipping (C4), inside safe box.

**Task 10 - transitions / joins** (refs 8.66 s s02->s06 join; 17.95 s; 28.61 s; 46.23 s; 84.4 s)
- matches baseline: outgoing sheet held on last frame, torn polygon, pulled off in `JOIN_S 0.75 s` smootherstep, alternate left (-1240 px, -8 deg) / up (-2150 px, +5 deg), cast shadow blur 28 px rgba(20,12,6,.55), paper-slide cue g0.35 at +0.08 s.
- matches baseline: no bare cut between scenes; hard cut only inside a scene at peak velocity (b20 56.45, b25 59.66).

**Task 11 - texture / grain** (any wide hold: 8.66-14.08, 72.24-84.4)
- matches baseline: `K.grain` strength 0.06 over ALL layers at z10 (24 fps grain step), `.dust` screen .08; paper textures at 12 fps wiggle 2 px (texture() defaults) or still; no fringe/scan/vignette/flicker.
- matches baseline: grounds red `#85362e` (cartolina multiply .75 + riscos screen .14) or cream (jornal sepia .3 + amassado .35); one ground per passage, no visible tile repeat.

**Task 12 - diagrams** (refs 40.12-43.43 b14 align-and-click; 33.95-36.34 b38 pair fan; 46.23-53.61 numbered tags)
- matches baseline: diagram pieces behave as paper (carryIn, shadows, tags), marks drawn by write-on (stroke-dashoffset 0.7 s) in `#2a1a10` 6 px with `rough` filter; one accent red; each element lands on its spoken word.

**Task 13 - puppet** (refs 48.01-50.43 b17 scourge; 8.66-17.95 hammer blows; 0.45-3.41 Luther head)
- matches baseline: cut-out rig, parts keyed at 12 fps (`stepPose(t,keys,12)`), hit on its word with its SFX at contact, damped jolt on 24 fps clock, idle bob on holds, die-cut rim.

**Task 14 - 3D** (refs 28.61-33.95 cover rotateY; 84.4-112.69 b52-b48 phones)
- matches baseline: phone3d fov 18, S0 0.9, PUSH 1.22, TILT 15 deg alternating, moves ease 0.95-1.6 s and happen BETWEEN taps, screen shows the real take frame, device swap 1.3 s; paper 3D = small `perspective` rotations (<= ~1.6 deg tilt, cover swing to open), same shadow language as flat paper.

**Task 15 - organic FX** (refs 24.17-28.61 b11 ink soak; 50.43-51.61 b18 coin; 51.61-53.61 b19 seal)
- matches baseline: ink soak/wet-ink drying spreads along the line over the word, coin settles on its rim with one pile shiver, seal stamp warms faintly; no extra particles; all seeded, closed-form in t.

**Task 16 - sound + mix** (refs cues 3.43 tear, 22.98 highlight, 51.04 ding, 109.21 seal, 114.09 bell)
- matches baseline: cues at contact (anchor), gains 0.12-0.6, soft paper vocabulary; SFX filter hp90/lp6500 + aecho; mix gains sfx 2.8 / music 0.8, fixed bed (duck 0), fade-out 1.5 s, loudnorm -14 LUFS / TP -1.5; bed gone before "Baixe", film closes on distant bell.
- matches baseline: cue not on a spoken word where avoidable (M5), LRA <= 3 LU.

**Task 17 - checks** (all refs)
- matches baseline gates: T12 first-visible-frame touches edge or covered (R5); T7 push-in >= 12 % where a push is declared; T6 hero in middle third; M5 no SFX over a spoken word; M3 LRA <= 3; R2 >= 2.6 events per 10 s; T5 ignores first 0.3 s of a declared entrance (H-7); T4 exempts pieces in entrance motion (H-2); no placeholder (C1), no clipped text (C4), ground changes only between passages (E7).
- The baseline film itself failed M3, T6, T7, T12 and M5 at final: set thresholds so these are reported, but treat the 10/10 film as the visual/sound reference, not the gate reference.
