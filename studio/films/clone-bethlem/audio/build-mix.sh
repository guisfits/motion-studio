#!/bin/zsh
# Rebuilds the clone-bethlem track from audio/cues.json + the chosen bed + voice/vo.wav.
# Run from media/video/studio:  studio/films/clone-bethlem/audio/build-mix.sh [bed.wav]
# Output: audio/mix.wav (gitignored) at the film's exact length, audio/mix-report.txt.
set -e
A=studio/films/clone-bethlem/audio
# cand-22: the steadiest drone (LRA 0.4); cand-11 swells 5 LU
BED=${1:-$A/music/cand-22-56.wav}
FRAMES=$(node -e "const a=require('./studio/films/clone-bethlem/lib/anchors.json');console.log(Math.ceil((a[a.length-1][1]+0.175)*24))")
DUR=$(python3 -c "print(round($FRAMES/24,4))")
SAMPLES=$(python3 -c "print(round($FRAMES/24*48000))")
OUT_AT=$(python3 -c "
import json;a=json.load(open('studio/films/clone-bethlem/lib/anchors.json'))
t=45.5
for p,q in zip(a,a[1:]):
  if t<=q[0]: print(round(p[1]+(t-p[0])/(q[0]-p[0])*(q[1]-p[1]),2)); break")
ffmpeg -y -loglevel error -f lavfi -i color=c=black:s=64x64:r=24 -frames:v $FRAMES -c:v libx264 -pix_fmt yuv420p $A/silent.mp4
# Bed: 0.4 s fade-in; out under "It took another 38 years" (reference 45.5-46.0 s, mapped), padded to the film.
ffmpeg -y -loglevel error -i $BED -af "afade=t=in:st=0:d=0.4,afade=t=out:st=$OUT_AT:d=0.5,apad=whole_dur=$DUR,atrim=end_sample=$SAMPLES" -ar 48000 -ac 2 $A/music.wav
node tools/audio/sfx.mjs $A/cues.json $A/sfx.wav --dur $DUR --no-thin
node tools/audio/mix.mjs --video $A/silent.mp4 --out $A/mix.mp4 --voice studio/films/clone-bethlem/voice/vo.wav --music $A/music.wav --sfx $A/sfx.wav --music-gain 0.55 --sfx-gain 2 --fade-out 0.1 --report | tee $A/mix-report.txt
# mix.mjs muxes AAC (priming trims ~75 ms): decode, pad, cut to the exact film length
ffmpeg -y -loglevel error -i $A/mix.mp4 -vn -af "apad=pad_dur=0.3,atrim=end_sample=$SAMPLES" -ar 48000 -ac 2 -c:a pcm_s16le $A/mix.wav
ffmpeg -nostats -i $A/mix.wav -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E "I:|LRA:|Peak:" | tee -a $A/mix-report.txt
