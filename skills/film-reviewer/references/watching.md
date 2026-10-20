# How to watch: three passes at phone size, plus the measures

You are the viewer. You hold no stake in the film and no memory of how it was made. Scripts ran before you (the checks files); your job is what scripts cannot do: meaning, taste, and the order in which a stranger experiences the film.

Every command runs on the render only (`ffmpeg`, `ffprobe`, `awk`). `F` is the render path (`<film>/out/animatic-9x16.mp4`, `draft-9x16.mp4` or `final-9x16.mp4`, as the Director names it). Work in `<film>/crew/review-frames/`; it is yours. Frame `n` = `round(t * NORMS.fps)`; the commands below assume 30 fps, replace 30 with `NORMS.fps` if it differs.

## 0. The cold read, before anything else

1. Make the 360 px whole-film sheets (section 1) and look at them before opening the sync sheet.
2. Write in `review.md`, under "Cold read", one sentence each: what the film seems to be about; the claim of the first 3 s; the one frame you remember; where you got bored or lost.
3. Only then open the sync sheet and the checks. Your first impression is the only fresh-eyes evidence you have; it does not come back.

## 1. Pass A: picture with sound, at 360 px

360 px wide is a phone in a hand. What you cannot read or recognise at 360 px, a viewer cannot.

```
# one sheet per 15 s: 5 columns x 3 rows, 1 frame per second
for s in 0 15 30 45 60 75; do
  ffmpeg -v error -y -ss $s -t 15 -i "$F" -vf "fps=1,scale=360:-2,tile=5x3" -frames:v 1 sheet-$(printf %03d $s).png
done
ffmpeg -v error -y -t 1.5 -i "$F" -vf "fps=4,scale=360:-2,tile=6x1" -frames:v 1 hook.png          # the hook
ffmpeg -v error -y -sseof -3 -i "$F" -vf "fps=4,scale=360:-2,tile=6x2" -frames:v 1 end.png        # the ending
ffmpeg -v error -y -sseof -0.1 -i "$F" -frames:v 1 last-full.png                                  # the last frame
```

Then, for every `key` and every `lettering.lands` in the sync sheet, a strip of 5 frames from 6 before to 6 after the word (3 frames apart). `T` is the word time in seconds:

```
N0=$(awk -v t=$T 'BEGIN{printf "%d", t*30+0.5-6}')
ffmpeg -v error -y -i "$F" -vf "select='between(n,$N0,$N0+12)*not(mod(n-$N0,3))',scale=360:-2,tile=5x1" -vsync 0 -frames:v 1 key-$T.png
```

The frames are -6, -3, 0, +3, +6 around the word. The hero must be on screen (opaque, not fading in) in the third frame; first visible in the fourth or fifth = late (H1). Lettering must be complete within `NORMS.sync.letteringToleranceFrames` of the third frame; first visible in the fifth or never = S5. For a doubtful word drop the `not(mod(...))` factor and use `tile=13x1`.

Sheets answer: where the eye lands; is the lower third used; is text cut; does anything look like a box with a label; does the caption read; is a face cut. Take full-size frames only for D9 texture checks and for the evidence frame of a finding:

```
ffmpeg -v error -y -ss $T -i "$F" -frames:v 1 t$T.png
ffmpeg -v error -y -ss $T -i "$F" -vf "crop=270:480:X:Y,scale=1080:-1:flags=neighbor" -frames:v 1 edge-$T.png   # 200-400% of an edge
```

Look for placeholders explicitly in every sheet: a flat box, a labelled grey rectangle, a missing-asset tile, a "PORTRAIT" label, a watermark, software UI. One is a 🔴.

## 2. Pass B: sound off

Most Reels are watched muted.

```
ffmpeg -v error -y -i "$F" -an -c:v copy picture-only.mp4
```

Use the Pass A sheets and the captions only. Do the captions alone carry the claim, in order, at a readable pace (read each aloud at normal speed; if you cannot finish before it changes: T1/T2)? Does the lettering alone make sense? Does the picture tell the turn? Anything that only works with sound is fine; anything confusing without it is D2 or D4.

## 3. Pass C: picture off

```
ffmpeg -v error -y -i "$F" -vn -c:a pcm_s16le audio-only.wav
ffmpeg -hide_banner -i audio-only.wav -af ebur128=peak=true -f null - 2>&1 | tail -16      # integrated, LRA, true peak
ffmpeg -hide_banner -i audio-only.wav -af silencedetect=n=-40dB:d=0.3 -f null - 2>&1 | grep silence
```

Compare with `NORMS.audio` (M2, M3 are in `checks-final.md`; your numbers must agree, a disagreement is a finding). With a speech-to-text tool, transcribe the mix against the `says` lines: an unrecoverable word is an intelligibility defect. Check that no SFX masks a key word (M5, orange, flags each cue span over a word) and that SFX density stays under `NORMS.audio.maxSfxPer4s`. What needs an ear and you cannot hear: `not heard`, cap 7. At draft and animatic D11 is `not assessed (no mix)`; at final a missing mix is 🔴.

## 4. Measure what the eye estimates (rhythm, holds, ending)

The gates R1-R4 and M1 ran before you; these measures are yours, from the render alone, so a gate that is wrong or missing is visible. Cuts only: scene detection sees picture changes, not caption chunk changes or camera moves, so it is a lower bound of the event count. Compare with the gate, do not replace it.

```
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F")
ffmpeg -hide_banner -i "$F" -vf "select='gt(scene,0.08)',showinfo" -an -f null - 2>&1 \
 | grep -o "pts_time:[0-9.]*" | cut -d: -f2 \
 | awk -v D=$D '{t[NR]=$1} END{n=NR; printf "cuts %d, film %.1f s, mean shot %.2f s\n", n, D, D/(n+1);
     for(w=0; w<D; w+=10){c=0; for(i=1;i<=n;i++) if(t[i]>=w && t[i]<w+10) c++;
       e=(w+10>D)?D:w+10; printf "  %3d-%3d s: %d cuts (%.1f per 10 s)\n", w, e, c, c*10/(e-w)}}'
ffmpeg -hide_banner -i "$F" -vf freezedetect=n=0.003:d=1.5 -an -f null - 2>&1 | grep freeze_   # frozen windows
```

Read it against the model (grammar section 10; the gate values are `NORMS.rhythm`, not these): a body of about 8 events per 10 s, bursts and holds rather than one density, the longest hold earned by the point, the last 5 s about half the body rate. A window with 0-1 cuts under an explanatory line is fine only if the caption or a camera move changes (check the strip); a window with no change of any kind for `NORMS.frames.deadWindowS` is M1, and one with no edit event and a still camera for `NORMS.rhythm.maxStillHoldS` is R1's still hold. Count the dissolves and compare with the sheet's `join: dissolve` rows: each needs a time jump, chapter turn or payoff; a dissolve in the render that the sheet does not list is a finding too. Count the sheet's rows against the picture changes you see: a row is one picture event, so a row with no visible change is a D2 or D3 finding.

The ending: the cut times of the last 5 s against the body mean above, and the length of the last shot (last cut to `D`).

## 5. Order of writing

1. Cold read (before the sync sheet). 2. Pass A findings with `t` and frame. 3. Pass B. 4. Pass C. 5. Measures. 6. Scores (rubric). 7. Rank (`severity-routing.md`). 8. Verdict. 9. Self-check: for every 🔴 the evidence frame exists in `review-frames/`; every row names an owner; no row says how to fix.
