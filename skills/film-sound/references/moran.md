# Chris Moran: what this role must know (20 lessons)

Source: Chris Moran (`@chrismoran__`), professional motion designer teaching the editorial-collage look in After Effects, 52 tutorial reels.
Every lesson below was extracted from the reel's transcript and its on-screen panels (OCR at 2 fps); the full ledger is `tutorials/chrismoran/lessons.jsonl`.
Values are his (After Effects units); `~` = read uncertainly; "not stated" = he gave none. `Build` says how this engine does it.
Lessons marked *(shared)* are owned by another role; know them, do not execute them.

Where a lesson and `core/checks/norms.mjs` disagree, the norm gates the render; raise the conflict to the Director.

## Hook and first seconds

1. **Hook: play the sound, name it, promise three reasons** *(shared)* — Opens with a question over the marimba itself, names it, then promises three reasons (two practical, one psychological).
   - question with the sound audible
   - name it in the next line
   - promise a numbered list of reasons
   - Values: `reasons` 3 (2 practical, 1 psychological); `hook length` ~2s question
   - Why: the viewer hears the subject before it is explained
   - Source: reel `DLnuz5ZJ6Ys` 0:00-0:11
2. **Hook: music tells the audience how to feel, shown as a mood mixer** *(shared)* — Open with the claim that music changes the whole emotion of an edit, visualised as a mixing desk whose channels are labelled with moods (Investigative, Hopeful, Sad).
   - state the claim in the first seconds
   - visual metaphor: faders named after emotions
   - Values: `mood channels seen` Investigative, Hopeful, Sad
   - Why: music dictates emotion; the metaphor makes it concrete
   - Source: reel `DecbrespqWe` 0:00-0:12

## Structure, pacing, retention

1. **Start soft: out-of-focus leaves and atmos** *(shared)* — Prime emotion with soft footage and atmospheric sound before the memory clips; waves or a train window also work.
   - out-of-focus leaves
   - atmospheric sound
   - alternatives: waves, train window
   - Why: primes the brain for emotion
   - Build: blurred nature loop plus ambience bed
   - Source: reel `DMDyGp6Jwwx` 0:05-0:12

## How pieces move

1. **Wave Warp on an adjustment layer so the frame ripples** *(shared)* — Wave Warp (Distort) on an adjustment layer makes the whole frame ripple gently with the music.
   - adjustment layer on top
   - Effect > Distort > Wave Warp
   - Values: `Wave Warp values` not shown
   - Why: everything vibes with the music
   - Build: whole-frame sine displacement (SVG feDisplacementMap or shader)
   - Source: reel `DR0HIWTiTkJ` 0:18-0:24

## Film and screen treatments

1. **Handycam footage for nostalgia** *(shared)* — Home-video footage from a consumer handycam (Sony, Carl Zeiss Vario-Tessar, optical 12x shown) reads as personal memory.
   - use or emulate consumer handycam footage
   - Values: `camera shown` Sony handycam, Carl Zeiss Vario-Tessar lens, optical 12x
   - Why: nostalgia comes from the camera of the era
   - Build: handycam treatment: low res, soft focus, interlace/colour bleed, date-stamp optional
   - Source: reel `DMDyGp6Jwwx` 0:00-0:13
2. **Refresh-rate micro flicker via Exposure expression** *(shared)* — Real screens flicker with their refresh rate; a tiny random Exposure pulse makes the screen feel real instead of pasted on. A 'NO FLICKER vs REAL SCREENS' card compares.
   - Exposure effect on the screen adjustment layer (after Venetian Blinds, Quick Chromatic Aberration 3, Curves)
   - Exposure expression:
   - seedRandom(index + time, true); flickerStrength = 0.03; freq = 2; holdTime = 1/freq; floorTime = Math.floor(time / holdTime) * holdTime; randomVal = random(-flickerStrength, flickerStrength); randomVal
   - Values: `flickerStrength` 0.03 (adjust 0.02-0.1); `freq` 2 per second; `Exposure base` 0.00, Offset 0.0000, Gamma 1.00; `stack order` Venetian Blinds > Quick Chromatic Aberration 3 > Curves > Exposure
   - Why: you do not notice it but you feel it
   - Build: per-frame brightness gain 2^random(-0.03,0.03); seed by floor(t*2) if the value should hold
   - Source: reel `DNmGyQupPlQ` 0:16-0:27

## Maps and data

1. **Audio Waveform effect on a solid: exact settings** *(shared)* — New Solid, add Generate > Audio Waveform, pick the music in Audio Layer, choose a display style and raise Maximum Height.
   - Layer > New > Solid
   - Effects & Presets search 'wave' > Generate > Audio Waveform
   - Audio Layer dropdown = the audio track
   - Display Options: Digital, Analog lines or Analog dots
   - raise Maximum Height
   - Composite On Original left on
   - Values: `Start Point` 108.0,960.0; `End Point` 972.0,960.0; `Path` None; `Displayed Samples` 120; `Maximum Height` 120 -> 152; `Audio Duration (ms)` 125.00; `Audio Offset (ms)` 0.00; `Thickness` 3.00; `Softness` 50.0%; `Waveform Options` Mono; `Display Options` Analog lines
   - Why: audio layer makes it reactive; height makes amplitude visible
   - Build: Web Audio/ffmpeg amplitude samples (120 per window, 125 ms) -> canvas polyline from (108,960) to (972,960)
   - Source: reel `DVRV9hiCX4F` 0:07-0:19

## Sound

1. **Tactile sound design is the reason Vox satisfies** — Sounds you can feel, not generic whooshes, carry the satisfaction: paper rustles, felt marker, film camera snaps, clicks.
   - use physical sound categories tied to the material on screen
   - Values: `categories` paper, film camera, felt marker, VHS tape (on-screen tiles at 0:11)
   - Why: tactile cues make the visuals feel physical
   - Build: foley library tagged by material: paper, marker, shutter, tape, clicks
   - Source: reel `DLR8e0NuUh9` 0:00-0:11
2. **Tactile SFX search list** — He shows a 'screenshot this' list of tactile search terms to pull from sound libraries.
   - search these terms one by one
   - Values: `terms` paper movement, circuit breaker on, quick page flick, sticky note peel, film camera shutter snap, polaroid eject pop, VHS cassette snap-in, typewriter, mechanical button click, pencil scratch, chalk drag, zipper, cloth movement, coin spin on table, wood block tap, drawer slam, light switch flick, velcro rip, box lid pop open, match strike
   - Why: specific physical actions give crisp, believable cues
   - Build: seed the SFX manifest with these 20 tags; one cue type per visual event
   - Source: reel `DLR8e0NuUh9` 0:11-0:13
3. **Layer several SFX per event and balance levels** — Stack several clips per moment (e.g. a paper movement plus a circuit-breaker click) and set each level.
   - place clips under the picture edit
   - layer 2+ clips per event
   - adjust each clip's level
   - Values: `example layers` Paper Movement + 'Circuit Breaker Reverb' (Freesound id 381447); `level seen` 4.0 dB on one clip
   - Why: layering brings the animation alive
   - Build: ffmpeg amix of per-cue SFX tracks with per-clip gain in dB
   - Source: reel `DLR8e0NuUh9` 0:14-0:21
4. **Marimba is the documentary sound, shown as a decade timeline** — Marimba has been the explainer sound across TV decades; he shows it as a timeline of decades and channels ending at Vox today.
   - timeline card by decade: 1950s-1970s, 1980s-1990s (Discovery Channel), 2000s (National Geographic Channel), 2010s-today (Vox)
   - Values: `timeline` 1950s, 1960s, 1970s, 1980s, 1990s, 2000s, 2010s, today; `channels` Discovery Channel, National Geographic Channel, Vox
   - Why: decades of TV made it the unofficial sound of education
   - Build: choose marimba-led tracks for explainer beds
   - Source: reel `DLnuz5ZJ6Ys` 0:02-0:11
5. **Marimba sits below the voice band (~1 kHz)** — On an EQ graph the marimba range sits low, left of the 1 kHz mark, while the voiceover clarity band is boxed above it, so the two do not compete.
   - pick music whose energy sits below ~1 kHz
   - keep the voice-clarity band above it free
   - Values: `marker` 1k hertz; `marimba range` below ~1 kHz (graph); `voice clarity band` above ~1 kHz (boxed)
   - Why: a calm voiceover stays clear
   - Build: ffmpeg: duck music under VO (sidechaincompress) and dip ~1-4 kHz on the music bed (equalizer)
   - Source: reel `DLnuz5ZJ6Ys` 0:13-0:19
6. **Emotionally neutral, and conditioned attention** *(shared)* — Neutral emotion keeps focus on information; long exposure has trained viewers to lean in and expect information when they hear it.
   - choose a neutral timbre, not a mood score
   - Why: psychological conditioning (his personal take)
   - Source: reel `DLnuz5ZJ6Ys` 0:19-0:31
7. **Search terms for the marimba explainer bed** — Vox uses the KPM library (often $500+ per track); he gives search terms that find the same sound on cheaper libraries, and a layering tip.
   - search: 'marimba documentary music', 'marimba documentary underscore'
   - similar and less cliche: 'pizzicato strings score', 'pizzicato strings documentary', 'classical orchestra'
   - pro tip: stack with soft strings or synth pads so it feels more modern and less reality TV
   - Values: `Vox library` KPM, often $500+; `search terms` 5 listed; `layering` soft strings or synth pads
   - Why: same function at a regular budget
   - Build: music-sourcing keyword list in the sound skill; bed = marimba + soft pad layer
   - Source: reel `DLnuz5ZJ6Ys` 0:31-0:39
8. **Distant-memory audio: High-pass + Low-pass + Studio Reverb** — On the home videos stack a Highpass, a Lowpass and Studio Reverb (Premiere audio effects); an OFF/ON card compares the result.
   - Audio Effects > Filter and EQ > Highpass
   - Audio Effects > Filter and EQ > Lowpass
   - Audio Effects > Reverb > Studio Reverb
   - A/B with an 'AUDIO EFFECTS: OFF / ON' card
   - Values: `effects` Highpass, Lowpass, Studio Reverb (Premiere Pro)
   - Why: carves EQ space for the music and makes the footage feel like a distant memory
   - Build: ffmpeg highpass=f=~300,lowpass=f=~3000,aecho/afir reverb on the clip audio (cutoffs are our guess, not his)
   - Source: reel `DMDyGp6Jwwx` 0:12-0:26
9. **Same cut, different track, different story** — On the same documentary animation, a marimba reads curious and playful (good for discovery); pizzicato strings make it feel investigative, like uncovering something.
   - marimba for discovery beats
   - pizzicato strings for investigative beats
   - audition tracks against the same timeline before changing the cut
   - Values: `instruments` marimba vs pizzicato strings; `marimba track seen` 'Worrying Rhythm' (44100 Hz)
   - Why: music steers the emotion the footage carries
   - Build: music bed chosen per beat mood from a tagged table (curious/playful vs investigative)
   - Source: reel `DecbrespqWe` 0:12-0:28
10. **Search music by mood tags and audition against the timeline** — Search 'documentary music', read each track's mood tags and BPM, and preview several against the timeline before licensing; pizzicato tracks cluster under Suspenseful/Quirky/Mysterious/Playful.
   - search by genre + use ('documentary')
   - scan mood tags and length
   - preview over the edit, compare, then license
   - Values: `example track` Leo Delibes Sylvia Pizzicato, 2:17, 134 BPM, Quirky/Happy/Playful; `other tags seen` Suspenseful, Quirky, Mysterious, Playful (e.g. 'Sneaky Villain' 1:00)
   - Why: mood tags narrow the search; testing in context beats guessing
   - Build: keep a local music library tagged by mood and BPM; pick per beat
   - Source: reel `DecbrespqWe` 0:28-0:46

## Workflow and tools

1. **Free SFX sources, or record it yourself** *(shared)* — Sources: Freesound and Soundly, or record the sound yourself.
   - freesound.org
   - getsoundly.app
   - record your own
   - Values: `sources` freesound.org, getsoundly.app, self-recorded
   - Why: free and specific
   - Build: archivist pulls CC0 clips from Freesound with licence noted in the manifest
   - Source: reel `DLR8e0NuUh9` 0:13-0:14
2. **Music platforms ranked A/B/C, and adjacent instruments** *(shared)* — Ranked by best options and ease of finding these tracks: A Audio Network, AudioJungle, Epidemic Sound; B YouTube, Pond5, Musicbed; C Artlist (only for this style). Adjacent searches: pizzicato cello and pizzicato violin.
   - try tier A first
   - adjacent: 'pizzicato cellos documentary score', 'pizzicato violin score'
   - Values: `tier A` Audio Network, AudioJungle, Epidemic Sound; `tier B` YouTube, Pond5, Musicbed; `tier C` Artlist; `adjacent` pizzicato cello, pizzicato violin
   - Why: where these tracks are easiest to find
   - Build: archivist sourcing order for music beds, licence recorded in the manifest
   - Source: reel `DLnuz5ZJ6Ys` 0:37-0:43
3. **Template: drop audio into one comp, both visualizers react** *(shared)* — The free template has an 'AUDIO HERE' comp: drag the audio in and both stylised visualizers update.
   - one input comp feeds all visualizers
   - Values: `visualizers` 2
   - Why: one input, many outputs keeps it reusable
   - Build: single audio input parameter shared by all visualizer components
   - Source: reel `DVRV9hiCX4F` 0:33-0:37
