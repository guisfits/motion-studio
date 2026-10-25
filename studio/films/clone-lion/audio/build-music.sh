#!/bin/zsh
# Bed for clone-lion: ACE-Step candidate 83 (gen-music.sh; the only one with a quiet pre-roll and a
# +25 dB drop, reference +23 dB), window 12.503-20.560 s so the drop (14.770 s) lands on f68 like the
# reference, short tail fade; loudness matched to the reference (-26.6 LUFS: a quiet master, kept
# for the side by side; a publish would sit at -14).
cd "$(dirname "$0")"
ffmpeg -v error -y -ss 12.503 -t 8.057 -i music/cand-83-24.wav -af "afade=t=out:st=7.75:d=0.3,loudnorm=I=-26.6:TP=-6:LRA=11" -ar 48000 music.wav
