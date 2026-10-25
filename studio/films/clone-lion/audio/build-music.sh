#!/bin/zsh
# Bed for clone-lion: ACE-Step candidate 83 (gen-music.sh; the only one with a quiet pre-roll and a
# +25 dB drop, reference +23 dB), window 12.503-20.560 s so the drop (14.770 s) lands on f68 like the
# reference, short tail fade; mastered at the engine's -14 LUFS (run-mp4 M2), not at the reference's
# quiet -26.6 (a first pass matched it and failed the gate).
cd "$(dirname "$0")"
ffmpeg -v error -y -ss 12.503 -t 8.057 -i music/cand-83-24.wav -af "afade=t=out:st=7.75:d=0.3,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 music.wav
