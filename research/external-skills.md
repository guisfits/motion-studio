# Insights from the four AI-generation video skills

Reference only. All four are image-model -> video-model pipelines; we render in code from
cut-outs we make. Sources are named by folder + file (`pynk` = `pynk-vox-animation/.claude/skills/vox-animation/`,
`adv/vox` = `advibly/vox-explainer/`, `adv/coll` = `advibly/collage-motion/`, `adv/expl` = `advibly/explainer-videos/`,
`muapi` = `anil-matcha-muapi-director/`, `mega` = `megatroll-vox-collage-broll/`).
Crew rows refer to the film crew's roles (`skills/film-*`).

What they really are: a staged chat flow around a generator. Their craft lives in (a) script shape and
pacing, (b) a locked look carried by a style key, (c) approval gates before spend, (d) a small audio recipe.
Their weak side is exactly our strong side: they cannot control a frame, so they ban text, avoid precise
sync and QA by eye.

---

## Director

**Take**

- **Staged flow, one stage per message, wait between stages.** welcome -> topic -> settings -> voice -> brief -> style key -> scenes -> cut. (`pynk` SKILL.md, CLAUDE.md). Maps to: the Director owns the stage list in `film-director`; no stage starts before the previous gate is signed.
- **Brief gate before any spend.** Table (topic+angle, through-line object, look, length, aspect, narrator) + the script, loop until approved, then write everything to one `pack.md` (`pynk` Stage 5). Maps to: `brief.md` + owner OK; keep one on-disk pack so a new session resumes.
- **Angle = a question with a turn** ("topic locked as a one-line angle") (`pynk` Stage 2). Maps to: first line of `brief.md`: "the question this film answers, and the turn".
- **Three gates: metaphor -> still -> motion; each can approve a subset** (`mega` SKILL.md, "Mandatory approval protocol"). Maps to: our gates are brief -> sync sheet -> animatic -> cut; allow per-beat approval so a good beat advances while a weak one iterates.

**Push-back**

- "Never spend / never pick a topic yourself" (`pynk`) and "find one" topic search with top 3 hooks: the owner wants Michael as artist (M9) and one Director; topic search is a feature the Director may offer, not a rule.
- Their UI is chat-as-software for end users (emoji per stage, setup tables). Our owner talks in the reply shape already defined in the global rules; copy none of their wording.
- "Locked model, never offer a choice" (`mega`, `adv/vox`): irrelevant to us, we have one engine. The principle that survives is "one engine, one look, no mixing mid-film".

---

## Writer

**Take**

- **Script shape: cold open (most surprising fact, flat, no greeting) -> stakes -> evidence scenes (one idea, concrete number/date/place, escalating) -> the turn -> resolution + kicker that reframes the opening.** (`pynk` Stage 3; the 6-block food-waste example in `references/vox-prompts.md`). Maps to: the `film-writer` skeleton; the kicker must name something shown in beat 1.
- **Through-line object that appears in every scene and escalates** + **a question hook answered last** (`pynk` Stage 3). Maps to: one recurring cut-out (e.g. the 95 sheets) the storyboard must place in every beat; also fixes "no hierarchy" because it is the constant hero.
- **18-20 words per 10 s scene, numbers spelled out, plain spoken text** (`pynk` Stage 3); ~2.5 words/s generic, 3.5 for punchy (`adv/expl` pipeline-and-audio.md, mixed-media.md); 30 s ~70-80 words, 60 s ~130-150 (`adv/vox` beat-layer.md). Maps to: our budget is ~2.5-3 words/s of narration; for pt-BR measure with real voice, not the counter (pt-BR runs longer).
- **Hook lands in <=3 s; hook patterns** (surprising_stat, mistake_callout, direct_question, secret_reveal, pattern_interrupt, outcome_tease) (`adv/vox` beat-layer.md; `muapi` beat-layer.md). Maps to: pick one named pattern per film in the brief.
- **Arc menu with a claim-to-arc heuristic** (hook_payoff, myth_buster, timeline, man_in_hole, story_spine...) (`adv/vox` beat-layer.md). Maps to: "arrependei-vos" is `myth_buster` (a common belief about repentance, then the text) or `timeline` (the 95 theses); a menu stops us defaulting.
- **Proportions: hook 1-3 s, body 70-80 %, payoff 10-20 %, end 0-2 s; endings: hard_cut / loop_close / quick_cta** (`adv/vox`). Maps to: end on the kicker; loop_close = last line mirrors the first.
- **Research always, never narrate it; two sources per number; a vague true line beats a specific false one; keep a sources list** (`pynk` Stage 3). Maps to: gate "facts sourced" in the crew flow (`skills/film-director/SKILL.md`); sources list ships with the brief.
- **Tone: curious, precise, a little wry; explains, never hypes** (`pynk`). Maps to: tone line in the brief (adjust for sacred subject).

**Push-back**

- **Fixed 10 s blocks / one line per block** (`pynk` Stage 3, 9: "shorten the line if the take is >9.7 s, lengthen if <7.5 s") bends the words to the clip. We invert it: voice first, picture follows word times. Never pad or trim copy to fit a block.
- Numbers-spelled-out is TTS-specific. We feed OmniVoice/ElevenLabs but lettering needs digits ("95"): keep both forms in `words.json`.
- English-only voice rosters and edge-tts voices (`pynk` Stage 4, `muapi` voices.md): irrelevant, our voice policy is NAR-2.

---

## Storyboard / script supervisor

**Take**

- **Each narration line becomes one idea; the visual illustrates the idea, not someone saying it** (`pynk` vox-prompts.md "The scene must visualize the narration's idea"). Maps to: sync-sheet row = `says` + `hero`; reject a hero that only decorates.
- **Metaphor card per line: core meaning, emotion, one-sentence visual proposition, 3-6 key objects, background colour, assembly order** (`mega` Gate 1). Maps to: add `proposition`, `objects[3..6]`, `order` to the sync sheet as the pre-asset review format.
- **3-6 large separable groups per frame, not confetti; one metaphor per line; prefer everyday recognisable metaphors, the spoken line bridges to the real topic** (`mega` Phase 1-2). Maps to: hierarchy rule: hero + <=2 support + ground; the Storyboard fails a beat with >6 pieces.
- **Two shots per beat: wide establishing (headline) then detail cut-in (no headline); narration spans both, the cut falls mid-sentence** (`adv/vox` Phase 2). Maps to: a beat has wide + close on the key word; the cut = the push-in target on the key noun.
- **Cut/change every 3-5 s, never hold one poster >7 s; coverage ladder EST_WIDE > MEDIUM > CLOSE > DETAIL; move-in builds intensity, move-out reveals context** (`adv/vox` beat-layer.md). Maps to: dead-frame gate (no window >4 s with ~0 diff); shot-size column in the sync sheet.
- **Anti-monotony: no two adjacent beats share a camera move; reserve `static` for the payoff** and per-arc move-rhythm presets (`adv/vox` beat-layer.md). Maps to: sync-sheet validator `zoom.kind != previous.zoom.kind`; payoff beat is the only static.
- **Beat-map as editable JSON, approved before generation** (`adv/vox` Phase 2; `muapi` examples/sample-beats.json: id, title, bg, feel, hook, narration, shots[dur, shot_size, camera_move, scene, element_motion]). Maps to: our `sync-sheet.json`; borrow the fields `feel`, `shot_size`, `element_motion`.
- **One impact per ~3 s; one reveal shot the video is remembered by** (`pynk` Stage 3 + fake-oner prompt). Maps to: `impact` column (slam/stamp/snap/tear) on at most every 3 s, exactly one `reveal: true` beat.
- **Scale comparison, charts as pure shape, maps with animated route, redaction bars, spotlight** (`pynk` vox-prompts.md "visual vocabulary"). Maps to: the storyboard's device menu; all are code-drawable (SVG/canvas) and need no generation.

**Push-back**

- "No readable text in clips" (mixed style) and "no numerals" (`pynk` NEGATIVE, `mega` avoid list): that is a generator limit. Our rule is the opposite: lettering = the narrator's key words, drawn by us in sync (see Animator).
- "Do not put the script text verbatim into the frame" (`mega` Phase 1) is right for whole sentences but wrong for the key noun/number; ours puts the key word on screen exactly when it is said.
- The metaphor-first approach (kettle for a concept) suits abstract business topics; for a historical subject our pictures are real documents (portraits, woodcuts, manuscripts). Metaphor is the exception, evidence is the default.
- Their "wide + detail" pairs are generated stills; for us the "close" is a crop/zoom of the same cut-out, so both shots must hold the same asset at enough resolution (Archivist).

---

## Art director

**Take**

- **Style key = one image that locks the look; attach it to every scene** (`pynk` Stage 6). Maps to: `style-bible.md` + one rendered **style-key frame** (ground, paper, shadow, type, accent) approved by the owner before any beat is animated; every beat is checked against it.
- **Offer 3 named variants of the key, each one sentence, pick by eye** and **bake-off: render beat 1 once per candidate theme** (`pynk` Stage 6; `adv/vox` Phase 3; `muapi` scripts/style_bakeoff.py with 4 default themes). Maps to: art director renders beat 1 in 2-3 candidate style bibles (Michael picks, M9: owner does not get art questions; the reviewer ranks).
- **One dominant colour per beat, consistent accent palette across the film; colour carries meaning** (orange urgency, mustard warning, green cognition, purple rules, teal judgment) (`pynk` vocab; `mega` Color rules). Maps to: ground colour per beat from a palette of <=4 grounds, <=2 accents (matches our gate); meaning table is a starting point only.
- **Texture constant, colour variable** ("keep a consistent paper-texture language across posters: edge roughness, halftone density; colour may change, texture must not") (`adv/vox` prompt-guide §1). Maps to: paper grain, edge roughness and shadow parameters live once in the style bible.
- **Concrete shadow numbers: offset, softness, opacity (e.g. 6 px down-right, 25-35 %); halftone 25-45 lpi coarse vs 65-85 lpi fine; cream keyline around cut-outs** (`adv/coll` collage-dimensions.md; `mega`). Maps to: tokens in the style bible; hard offset shadow (mixed-media: "intense hard-edged black cast shadow bottom-right", `adv/expl` styles/mixed-media.md) separates layers better than soft.
- **Prop consistency: generate reusable prop assets once and re-attach them every time they appear** (`pynk` diorama-doc.md "Reusable prop assets"). Maps to: our manifest is exactly this; the through-line object is one asset id reused in every beat, never re-cut.

**Push-back**

- **Photoreal/plasticky is the model's failure; "NOT 3D, NOT CGI" negatives** (`adv/vox`, `pynk`). Not our problem; our failure mode is the opposite: flat, same-y, dead frames. Replace with measured gates (frame fill >=30 %, one accent, texture present).
- **Text baked into the image so video models do not smear it** (`adv/vox` models-and-gotchas; `adv/coll`: "no text-overlay tool"). We have exact text control; baking is the wrong default, and their headlines are 2-3 words max because the generator garbles more. We can set real type.
- **Greyscale halftone photo cut-outs everywhere** (`mega`, `adv/expl` mixed-media): good tool for unifying mixed archive sources (portrait scans of different tone), but for sacred art colour may be the point. Decide per film in the style bible, do not inherit.
- **"Bold flat background" as the only ground** (`mega`, `muapi`): our paper-collage can use textured/kraft grounds and layered paper; flat-only is a generator workaround for clean parallax.
- **Moderation-driven styling (censor bars over eyes)**, see Archivist.

---

## Archivist / cut-out maker

**Take**

- **Cut-out recipe: crisp cut edge + cream/white keyline + soft low-opacity shadow + paper grain; thick uneven white border like hasty scissor cuts** (`mega` Success criteria; `adv/expl` mixed-media.md failure modes: "blends subject into background instead of keeping the sloppy white border"). Maps to: the cut-out maker's edge spec: matte -> irregular 6-14 px white border (seeded wobble) -> offset shadow; one function, same params for all assets.
- **Subjects must be separable layers with their own shadow** so parallax can move them at different depths (`adv/vox` prompt-guide §3: "the more clearly layered the poster, the more layered motion"). Maps to: deliver each asset as an RGBA PNG at the size it will be zoomed to, plus a `depth` plane (bg/mid/fg).
- **The "isolate" prompt is their background remover: isolate exactly, do not redraw or restyle, place on a flat card with contact shadow** (`adv/vox` motion-collage.md §5). Maps to: in code we do the real thing (rembg/SAM + manual matte); their lesson is "never redraw the object": our cut-outs are the actual scan.

**Push-back**

- **Moderation lessons as styling: censor bars over eyes "sell the editorial look and defuse likeness issues"; swap close-ups for mid-shots; describe leaders without names** (`pynk` diorama-doc.md "Moderation map"). Our pictures are real historical portraits (Luther, Cranach), public domain, labelled: no censoring, no anonymising. The lesson that transfers: a _living_ person's likeness needs a decision; for dead historical figures from PD sources, use the portrait and credit it.
- **They generate every picture; none searches, licenses or credits.** Zero coverage of archive search, resolution, provenance, rights (Gaps).

---

## Animator / camera

**Take**

- **Fake-oner: each scene is one continuous camera move that starts and ends in motion blur, so hard cuts read as one shot** (`pynk` Stage 3 + diorama-doc.md fake-oner block prompt: "emerges from motion-blurred previous element ... ends fully motion-blurred mid-dive"). Maps to: boundary rule in the animator: every cut hides inside a directional blur (e.g. 3-5 frames of horizontal motion blur / whip on exit, same direction on entry) with the camera speed matched across the cut.
- **Camera-move vocabulary that is "flat-safe": static, push_in, pull_out, pan, tilt, parallax, element (one piece moves, rest still); uniform translate + uniform scale only** (`adv/vox` beat-layer.md §3; `muapi` beat-layer.md). Maps to: our primitives; since we render in code, we can also do rotations and perspective, but uniform scale/translate on a flat table is the reliable base.
- **Parallax = fg/mid/bg layers at different speeds ("living paper" signature); foreground moves much faster than background** (`adv/vox`; `adv/expl` mixed-media "multiplane"). Maps to: depth plane -> speed multiplier (e.g. bg 0.3x, mid 1x, fg 1.8x of the camera translation).
- **Assemble-from-empty: bare ground, then pieces fly in, overshoot slightly, snap with a paper thwack, headline lands last** (`mega` Phase 3; `adv/vox` motion-collage.md §1; `adv/coll` B3: "base structure -> figure/key cards -> connectors -> action -> final result"). Maps to: the beat's entrance choreography in a fixed order: ground, hero, support, connectors/marks, lettering last; ease-out with 4-8 % overshoot.
- **Impact kick: one small sharp frame shake that settles at once when a piece lands; never a continuous wobble** (`adv/vox` motion-collage.md §4). Maps to: 3-5 frame decaying translate (<=6 px) on the camera at hero landing, max one per ~3 s.
- **Stop-motion "on twos" ~12 fps with slight jitter/boil**, applied at final render, not asked of the generator (`adv/coll` Hard defaults; `adv/expl` pipeline-and-audio.md). Maps to: a global posterize-time option (hold every 2nd frame at 24 fps) + +-1 px/+-0.4 deg seeded jitter on pieces; but NOT on the camera move (their note for Cinematic 2D: global snap choppifies smooth camera pushes). Apply to pieces, keep camera on ones.
- **Rigid paper physics: pieces slide, flap, hinge, scatter; they never bend, morph or squash** (`adv/vox`; `adv/expl` mixed-media "zero organic squash-and-stretch"). Maps to: no scale-pulse or squash; allowed transforms are translate, rotate about a pivot, uniform scale-in with overshoot.
- **Big moves once or twice only; a film where every shot fires confetti and shakes reads as formula** (`adv/vox` motion-collage.md). Maps to: a punch budget in the sync sheet (<=2 starbursts, <=2 confetti, shake only on landings).
- **Easing rules: quick ease-out entrances with slight overshoot; slow deliberate push-ins on "listen to this" beats; whip-pans or page-flips between ideas** (`pynk` vox-prompts.md "Motion vocabulary"). Maps to: easing table; gate "no linear run > 3 frames" already in the Director's gates (`NORMS.camera`).
- **Whip as transition: end shot A on a whip-out, open B on a whip-in so the cut hides in the blur; or ffmpeg xfade whip** (`adv/vox` motion-collage.md §4). Maps to: one whip transition per ~3 beats at most; our engine does it natively.
- **Only one thing is loud at a time; something always moves** (`pynk`). Maps to: per-frame rule: one primary mover (the hero), others ambient (drift <=0.5 %/s).
- **Frame rate 24, tail pad 0.5 s after narration per beat** (`muapi` assemble.py: `FPS, TAIL = 24, 0.5`; beat length = narration + tail). Maps to: beat length = last key word + ~0.5 s, never a fixed 10 s.

**Push-back**

- **"No zoom / no camera movement / locked-off" in assembly clips** (`mega` prompts) and "avoid intense motion near text" (`adv/vox`): imposed by generator instability. Our owner's complaint is _weak_ zooms; we want emphasised eased pushes (>=15 % scale per crit gate) onto the word's picture.
- **Never write snap, slam, punch-in, quick zoom - video models produce a one-frame flash** (`adv/vox` prompt-guide §2). Generator-only; in code a fast ease-out punch-in is the standard emphasis.
- **"Smooth video model needs on-twos at final render"** is their workaround for AI interpolation; for us on-twos is purely an aesthetic option and must be tested against "dead frames".

---

## Sound

**Take**

- **Sound design inside the plan: 3-5 concrete diegetic events per scene** (fuse crackle, guillotine slam, page rips, stamp punch, wind) (`pynk` diorama-doc.md fake-oner shape). Maps to: SFX cue list per beat in the sync sheet, tied to impacts (paper slide, tape tear, marker squeak, cardboard thud, typewriter clunk - `adv/expl` mixed-media.md).
- **SFX sync is frame-accurate to every pop-on and text reveal; SFX may sit almost as loud as VO during transitions, music kept low under VO** (`adv/expl` mixed-media.md `audio.mix`). Maps to: SFX are derived from animation event times, not placed by hand; but gate "no SFX over a word" (`NORMS.audio.sfxWordMarginS`) overrides loudness here.
- **Ducking numbers: music bed ~0.22, ducked to ~35 % (~0.08) while VO speaks, ramp down just before each line and back after** (`adv/expl` pipeline-and-audio.md). Maps to: -9 dB duck (0.35 = -9.1 dB), 150-250 ms pre-roll attack, 300-500 ms release.
- **Sidechain chain**: `volume=0.6` music, VO `volume=1.25`, `sidechaincompress=threshold=0.08:ratio=6:attack=15:release=250` then `amix weights=1.2 0.7` (`muapi` scripts/assemble.py). Maps to: starting parameters for our ffmpeg mix; verify with the LUFS gate; threshold/ratio need tuning against our VO level.
- **Double-dip warning: do not set a low bed by hand AND rely on auto-duck (0.08 ducks to 0.03 and disappears)** (`adv/expl`). Maps to: define the bed level once as the between-line level, let the duck derive from it.
- **Music brief as measured numbers** (~46 BPM heartbeat pulse, sub-bass drone + low cello, 8 s breathing swells, loud open, single climax at 80 % of runtime, rapid decay to silence) (`pynk` diorama-doc.md "Music"); 120 BPM staccato strings + taiko for urgent explainers (`adv/expl`). Maps to: the sound role's music spec form: BPM, instrumentation, shape of intensity vs script's turn; since we cannot generate, pick/edit library music to this shape.
- **Trim trailing silence from TTS takes** (`mega`: `areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse`). Maps to: the writer's post-TTS step; needed before word-time alignment so beat ends are tight.

**Push-back**

- **`atempo` squeeze** (see Writer).
- **Loudness**: none of them measures LUFS; ours has -14 +-1 and LRA <=3 as a gate.

---

## Reviewer (fresh eyes)

**Take**

- **Contact-sheet QA**: `ffmpeg -vf "fps=1,scale=270:480,tile=5x1"`, per-second frames, plus first-frame and end-frame comparison (`mega` Video QA). Maps to: reviewer gets a sheet at 2 fps around each key word + the first/last frame of each beat; cheap to read, catches dead frames and placeholders.
- **Check the progression, not the end frame alone** (`mega`). Maps to: the reviewer samples at key-word times (hero changed? lettering landed?) and mid-beat, not only stills.
- **Pass criteria written per defect class** (empty opening, step-by-step entry, no fake lettering, final matches approved still, spec check with ffprobe) (`mega`). Maps to: rubric lines with PASS/FAIL tied to measurable facts; ffprobe check is deterministic, not an opinion.
- **Known-failure lists per style used as the review checklist** (`adv/expl` style `failure_modes`: "clay must show fingerprints, papercraft must show cast shadows"). Maps to: the style bible carries its own 3-5 "tells" the reviewer checks (hard offset shadow present, white border present, grain present).
- **Repair playbook mapping symptom -> fix** (weak assembly feel -> fewer elements + explicit order; end-frame drift -> restate target) (`mega`). Maps to: reviewer output names the owner role + the concrete fix, as in the Director's fix-round routing (`skills/film-director/references/briefing-specialists.md`).
- **Verdict files with reasoning**: `gate2-qa.md`, `gate3-qa.md` (`mega`). Maps to: `review.md` per round, kept (rounds <=2).

**Push-back**

- **QA by the same agent that generated, by eye** (all four). Our reviewer is a separate fresh context, reading only the render + sync sheet + rubric, with scripts first (`skills/film-reviewer/SKILL.md`). None of them separate producer and judge.
- **"Minor drift is a PASS, do not re-run"** (`mega`): fine for generation lottery, wrong for our sync rules where drift means picture != word. Tolerance must be numeric (frames), not narrative.

---

## Process / UX with the owner

**Take**

- **Zero internal chatter: never mention folder state, tool checks, file writes, timing math; speak only where the user must act or something is missing** (`pynk` Global UI rules). Maps to: the Director's reports show decisions and results, not logs.
- **Settings as a table with defaults pre-filled; `go` accepts all** (`pynk` Stage 2). Maps to: brief table with defaults (length, aspect, voice, style) and a one-word accept.
- **Show the finished file in chat + a small delivery table (topic, length, aspect, look, narrator, sources)** (`pynk` Stage 10). Maps to: closing report; sources list always included.
- **Contact sheets / numbered mapping shown to the owner at each gate** (`mega` Gate 2). Maps to: owner sees the animatic as a numbered storyboard strip first (M27).

**Push-back**

- **Owner as the hands (runs prompts, saves block01.mp4)** (`pynk`): the whole point of our crew is that nothing is delegated back to the owner.
- **Asking the owner to choose art** (style variants, themes, voice by sample): M9 says Michael is the artist; offer the choice only for NAR voice samples if at all.

---

## Gaps (what none of them covers; the crew must own)

1. **Word-level sync**: no word times, no alignment, no picture-on-word rule. They match "line to clip" at 5-10 s granularity. We need `words.json` (ASR forced alignment), picture changes within 3 frames of the key noun, lettering landing +-3 frames. (Writer, Storyboard, Animator, Reviewer)
2. **Lettering design as narration**: they only ban or bake text. Nobody designs which word gets written, how (underline, stamp, tape label), how long it stays, or caption reading speed (<=17 cps, <=4 words, >=0.83 s). `muapi` caption = 4.5 % of min(W,H), white PNG, no timing logic. (Storyboard, Art director, Animator)
3. **Archive research and rights**: finding, ranking, licensing and crediting real images; resolution vs planned zoom; hero vs support selection; fallback when no picture exists (no placeholders). (Archivist)
4. **Visual hierarchy rules**: hero/support/ground, frame fill, centroid in the middle third, one accent, how many pieces. They count objects (3-6) but have no measured layout checks. (Art director, Storyboard)
5. **Deterministic gates**: placeholders, clipped text, dead frames, easing, LUFS, caption legibility. Their QA is visual only. (Reviewer; scripts in `core/checks/`)
6. **Animatic stage**: nothing like a cheap stills-on-voice pass the owner approves before render. Their cheapest gate is a generated still. (Animator, Director)
7. **Zoom as meaning**: nobody says where a push-in goes and why (eyes, the word, the date). Their camera moves are decorative. We specify target + kind + ease + magnitude per key word. (Storyboard, Animator)
8. **Pt-BR specifics**: reading speed of pt-BR TTS, diacritics in lettering fonts, numbers/ordinals/scripture refs spelled in speech vs digits on screen. (Writer, Art director)
9. **Sacred/historical-subject sensitivity**: tone, depicting Christ or Scripture, quoting a verse exactly, source citations on screen. (Director, Writer)
10. **Reproducibility**: deterministic renders, seeded jitter, same input = same frames; theirs are lottery re-rolls. (Animator)
11. **Version and fix-round control**: who owns which artifact, one writer per artifact, defect routing. (Director)
12. **Fact checking tied to on-screen claims**: dates/numbers shown in lettering must match the sourced script. (Writer, Reviewer)
13. **Accessibility**: contrast, captions as an accessibility feature, flashing/shake limits. (Art director, Animator)

---

## Top 10 to carry into our skills

1. **Script skeleton**: cold open (flat, most surprising fact) -> stakes -> escalating evidence (one idea, concrete number/date/place each) -> the turn -> kicker that reframes the opening; hook lands in <=3 s (`pynk` Stage 3; `adv/vox` beat-layer).
2. **Through-line object in every beat + a question hook answered last**: one asset id, reused, escalating (`pynk`).
3. **Voice first, picture follows words**: ~2.5-3 words/s as a planning budget only; beat length = narration + ~0.5 s tail; never pad or stretch copy to a fixed block (invert `pynk` 10 s blocks; `muapi` TAIL).
4. **Style key + bake-off before any beat**: one approved frame locks ground, paper, shadow, type, accent; render beat 1 in 2-3 candidates and pick (`pynk` Stage 6; `adv/vox` Phase 3).
5. **Gates with per-item approval and written verdicts**: brief -> sync sheet -> animatic -> cut, each item can advance alone, every gate leaves a `gate-N.md` (`mega` three-gate protocol).
6. **Pacing and variety rules as validators**: change every 3-5 s, never hold >7 s, no two adjacent beats with the same camera move, `static` only on the payoff, one impact per ~3 s, exactly one reveal shot, punches budgeted (`adv/vox` beat-layer + motion-collage).
7. **Fake-oner boundaries**: each cut hidden in a matched directional blur/whip, entrance as assemble-from-empty (ground, hero, support, marks, lettering last) with overshoot and an impact kick that settles (`pynk` diorama; `adv/vox` motion-collage; `mega`).
8. **Layered cut-outs with one edge recipe**: irregular white border + offset hard shadow + grain, RGBA at zoom size, depth plane -> parallax speed; real pictures untouched (`mega`, `adv/expl` mixed-media, `adv/vox` prompt-guide §3).
9. **Audio recipe**: music bed ~0.22, duck to ~35 % (-9 dB) with fast attack/slow release (`muapi`: threshold 0.08, ratio 6, attack 15 ms, release 250 ms as a starting point), SFX cue per animation impact from a diegetic paper vocabulary, trim TTS silence at -45 dB, measure LUFS ourselves (`adv/expl`, `muapi`, `mega`).
10. **Fresh-eyes review on contact sheets at the key-word times plus scripted checks**, with each defect mapped to an owner role and a concrete fix; and a per-style "tells" list in the style bible (`mega` Video QA/repair playbook; `adv/expl` failure_modes). Push-backs to bake in: lettering = narrator's key words (not "no text"), no censoring of PD historical portraits, no generation lottery.
