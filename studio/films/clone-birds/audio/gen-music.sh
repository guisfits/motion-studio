#!/bin/zsh
# ACE-Step candidates for the clone-birds bed (sequential, under the shared heavy lock).
# Reference bed (breakdown 9): dark electronic, sub bass + mid synth, ~131 BPM, quiet first ~2.3 s
# then a loud body; cut hard at the 5.005 s loop. We compose our own from a genre caption only.
cd "$(dirname "$0")"
source ../../../../tools/heavy-lock.sh
PY=/Users/guisfits/llm-models/ace-step-1.5/repo/.venv/bin/python
GEN=/Users/guisfits/llm-models/ace-step-1.5/gen.py
CAP="dark electronic trap beat, deep sub bass, gritty mid synth stabs, tense spy thriller mood, punchy drums, minor key, instrumental, no vocals"
run() { # seed key duration
  heavy_lock_acquire "clone-birds gen-music.sh seed $1"
  $PY $GEN --out music/cand-$1-$3.wav --duration $3 --seed $1 --bpm 131 --keyscale "$2" --caption "$CAP" > music/cand-$1-$3.log 2>&1
  heavy_lock_release
}
run 31 "F minor" 20
run 42 "C minor" 20
run 53 "G minor" 20
