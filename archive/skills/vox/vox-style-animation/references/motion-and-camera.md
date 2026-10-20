# Motion and camera

Legend: **[S]** sourced · **[M]** measured in the 28-reel reference studies (`inspirations/`) · **[I]** inference.

## 1. The governing rule: motivated motion

A cut or a camera move must promise new information by its end; otherwise it is an unmotivated
move and "can cause lack of clarity, and confusion" [S editing-grammar course]. Murch's Rule of Six
ranks what a cut must serve: emotion (51 %), story, rhythm, eye trace, 2D plane, 3D space; break
the lowest first [S Murch via StudioBinder/NoFilmSchool]. Translated to explainers [I]:

- **Cut** when the noun changes (new object, new idea).
- **Move** (push, drift, parallax) when staying on the same evidence and asking the viewer to look
  closer.
- **Hold** when the viewer must read (document, number, UI).
- **Whip / montage** only under a spoken list ("creams, serums, treatments": ~1 s each) [M eb2,
  Zhylin 10.5–14.5 s].

"Constant motion" (Zhylin's trick 3) means *something* is always alive, not that everything moves:
the Trump cut-out held 5.5 s with a 1 s slow push is the longest hold in a 62 s reel and still reads
as motion [M].

## 2. Camera language

| Move | When | Numbers |
|---|---|---|
| **Slow push-in on evidence** | the document / photo / UI is the point | 1 s push for a short beat [M Zhylin]; a 10 % total scale over 5 s ≈ 2 %/s; below ~1 %/s reads static; keep total zoom 5–20 % over the clip, ease in-out [S general practice, unsourced numbers] |
| **Slow drift (Ken Burns)** | a hero held 5–17 s | camera stays alive with slow push/tilt, never static [M d08, eg9, yur] |
| **2.5D parallax** | an archival photo with clear subject/background separation | cut into layers, paint the hidden background, place layers at depths, animate the camera not the layers, keep secondary motion subtle, add grain to sell it; choose shallow-DOF images [S Motion Array, Filmbro, Tuts+] |
| **Pull-out on a map** | reveal scale | storyboard the end frame first (close on Paris → wide) [S NoFilmSchool]; "camera movements that weren't too crazy" [S Fong] |
| **Zoom-through transition** | one scene flows into the next | two sequences as 3D layers, camera keyed a few frames before the edit, Easy Ease shaped so velocity peaks at the cut, blur spike much shorter than the move [S PremiumBeat] |
| **Whip pan / slide** | list items, ground swap | same few transitions per film; never into an empty frame [M] |
| **Gate weave on stills** | archival photo should feel projected | two small wiggles (position + exposure flicker); removing it makes the photo "look dead" [M Da3YpRipHuF] |

Vox's 2.5D is mostly photos and documents in a shallow 3D space with a camera that drifts;
whole-scene camera moves are rare and slow [I from M].

## 3. Easing

- Ease-out for entering, ease-in for leaving, ease-in-out for moves within the frame [S
  madegooddesigns]. Default linear keys are the amateur tell; shape the curve in the graph editor
  [S Graduate School lesson].
- Overshoot is for playful work; editorial collage uses subtle anticipation + settle, or none
  [S]. On this engine: closed-form springs only; instant scale jumps ("punch-ins") are banned [engine
  rules].
- Durations: UI-scale moves 200–500 ms (5–12 frames at 24 fps) [S]; a cut-out slide-in ≈ 8
  frames with a blur that clears by frame 8 [S Motion Array Harris tip]; arrow draw 0.3–0.5 s;
  word-by-word title build 0.5 s per word [M Zhylin].
- Secondary motion lags: shadows and satellites follow the hero by a few frames [S].

## 4. Stepped / hand-made motion

The signature "Vox stutter" [S PremiumBeat, Adobe forums, NoFilmSchool]:

| Element | Rate | Why |
|---|---|---|
| Graphics / cut-out moves | 12 fps inside a 24/30 fps edit (nested comp with preserved frame rate, or Posterize Time 12) | reads as cel/stop-motion; "a little bit of personality" |
| Maps (WWII look) | Posterize Time 10 fps + 16 mm grain Overlay 35 % | period film feel |
| Page turn | posterise to 8 fps | tactile, printed |
| Paper edge wiggle | Wiggle Paths driven by a posterised expression at a low update rate (4–8 fps) | each frame is "a new sheet of paper" [S Marriott] |
| Lower third reveal | mask grows frame by frame irregularly, skipping frames | torn-paper feel [S PremiumBeat] |
| Text behind its plate | text layer a few frames after the lower-third | stop-motion offset [S PremiumBeat] |

Mix rates deliberately: stepped graphics over a smoothly drifting camera/background keeps the
judder from looking like a render error [S Adobe forum advice]. Never step the caption or the UI
recording.

## 5. Transitions (small vocabulary, repeated)

- **Match cut**: on shape (ring → disc), on text (same phrase centred across ≥ 12 images, clips
  shortening from 8 frames), on position [S Motion Array; M Zhylin 42–45 s].
- **Ground swap**: the new idea arrives as a new ground sliding/whipping in with its one object
  [M earn.edits].
- **Tear / torn plate**: paper tears to reveal; cheap and on-brand [M Dc1ShYsplyF].
- **Ring / shape wipe**: a white ring expands through the cut [M Zhylin].
- **Zoom-through**: see camera table.
- **Chromatic blur flash**: a brief RGB split on the cut, "occasional not constant" [S PremiumBeat;
  M human-academy].
- **Hard cut**: the default; cuts into black and dead frames are banned [M].

Rule: ≤ 3–4 transition types per film, reused; the viewer learns the grammar [M earn.edits "same
few per film"].

## 6. Holds and cadence (numbers)

| Measure | Norm | Evidence |
|---|---|---|
| Average shot length | 1.6–3.2 s (median ~2.0 s) chrismoran; 2.0–5.3 s earn.edits A | [M] |
| Minimum beat | ≥ 1.5 s, except an explicit spoken list (~1 s per item, ≤ 4 items) | [M] |
| Fast montage | ≤ 0.4–0.7 s per shot, only under one list sentence, ≤ 4 s total | [M Zhylin] |
| Hero hold | ≥ 5 s at least twice per film; up to 17.8 s with slow drift | [M earn.edits] |
| Key proof (page, number, UI) | held ≥ 2.5 s after the mark lands, uncovered | [M chrismoran rule] |
| Explanatory sentence | 3–5 s hold on one scene with ≤ 2 moves | [M Zhylin 28–33 s] |
| Chapter card | 1.5–2.5 s | [M Zhylin] |
| Closing calm beat | ~2.5 s, text alone on a plain ground | [M eg9] |
| Talking-head reset | 3–4 s, 2–4 per reel | [M chrismoran] |
| Moves per scene | ≤ 2 (e.g. arrow draw + slide-in); everything else holds | [M chrismoran] |
| Same move repeated | ≤ 2× per film ("same whip 5 times" is a defect) | [M] |

Vox long-form: Fong changes music roughly every 20 s as a structural/attention cue; fast at the
top because viewers have alternatives [S]. Vox's success metric is retention; ~4 min average watch
time is the bar [S Storybench].

## 7. What to animate and what to leave still

**Animate** (because it carries information): the camera into evidence; the arrow/circle/underline
landing; the number ticking to its value; the cut-out arriving (one slide-in); the map region
filling; the page turning; the texture breathing at low amplitude.

**Leave still**: the document while it is being read; the caption box position; the UI recording
(no jump cuts, no punch-ins); the ground during a hold; faces in archival photos (gate weave only).

**Never**: everything fading in; particle bursts; glow on UI chrome; corner labels and frame
borders; a centred title on a gradient; punch-in scale jumps; pieces of a product UI "jumping out"
[engine rules; consistent with M].

## 8. The Vox moves (tools, not quota)

Visualize everything · motion design to explain (maps, newspapers, diagrams, cut-outs) · constant
but motivated motion · seamless transitions (match cut, zoom-through) · cursor click · counters ·
radio waves · highlighter · red arrow · page turn · vintage TV frame · gate weave · stepped 12 fps ·
texture breathing [M Zhylin, chrismoran DaNlGAcgYsD; S PremiumBeat]. Use the one the sentence
needs; a film that uses all of them is a showreel, not an explainer [I].
