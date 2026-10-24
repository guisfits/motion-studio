#!/bin/zsh
# Rebuilds the clone-van-gogh sound track from audio/cues.json + audio/music/cand-11-40.wav + voice/vo.wav.
# Run from media/video/studio. Output: audio/mix.wav (gitignored), audio/mix-report.txt.
set -e
A=studio/films/clone-van-gogh/audio
ffmpeg -y -loglevel error -f lavfi -i color=c=black:s=64x64:r=16 -frames:v 554 -c:v libx264 -pix_fmt yuv420p $A/silent.mp4
# bed: cut at 30.75 s (80 ms fade, silent by 30.78 s), +3 dB build 19-28 s, 0.4 s fade-in, padded to 34.625 s
ffmpeg -y -loglevel error -i $A/music/cand-11-40.wav -af "atrim=0:30.9,volume='pow(10,3*clip((t-19)/9,0,1)/20)':eval=frame,afade=t=in:st=0:d=0.4,afade=t=out:st=30.70:d=0.08,apad=pad_dur=5,atrim=end_sample=1662000" -ar 48000 -ac 2 $A/music.wav
node tools/audio/sfx.mjs $A/cues.json $A/sfx.wav --dur 34.625 --no-thin
node tools/audio/mix.mjs --video $A/silent.mp4 --out $A/mix.mp4 --voice studio/films/clone-van-gogh/voice/vo.wav --music $A/music.wav --sfx $A/sfx.wav --sfx-gain 4 --fade-out 0.1 --report | tee $A/mix-report.txt
# mix.mjs muxes AAC (priming trims 75 ms): decode, pad, cut to exactly 1 662 000 samples
ffmpeg -y -loglevel error -i $A/mix.mp4 -vn -af "apad=pad_dur=0.3,atrim=end_sample=1662000" -ar 48000 -ac 2 -c:a pcm_s16le $A/mix.wav
ffmpeg -nostats -i $A/mix.wav -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E "I:|LRA:|Peak:" | tee -a $A/mix-report.txt
