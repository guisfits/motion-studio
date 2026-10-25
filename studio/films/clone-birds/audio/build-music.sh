#!/bin/zsh
# Bed for clone-birds: ACE-Step candidate 42 (gen-music.sh), the 5.005 s window whose drop lands on
# loop frame 68 like the reference (drop measured at 7.380 s → window 5.111-10.116 s), repeated 3x
# with a hard seam (the reference audio is cut at the loop too), then -14.7 LUFS (reference).
cd "$(dirname "$0")"
ffmpeg -v error -y -ss 5.111 -t 5.005 -i music/cand-42-20.wav -af "afade=t=in:d=0.003,afade=t=out:st=5.002:d=0.003" -ar 48000 music/loop.wav
ffmpeg -v error -y -i music/loop.wav -i music/loop.wav -i music/loop.wav -filter_complex "[0][1][2]concat=n=3:v=0:a=1,loudnorm=I=-14.7:TP=-1.5:LRA=7" -ar 48000 music.wav
