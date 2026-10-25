#!/bin/zsh
# ACE-Step candidates for the clone-bethlem bed (sequential, under the shared heavy lock).
# Reference bed (breakdown 7): a dark wide drone / bowed-bass pad, minor, no drums, no tune, ~81 BPM felt.
cd "$(dirname "$0")"
source ../../../../tools/heavy-lock.sh
PY=/Users/guisfits/llm-models/ace-step-1.5/repo/.venv/bin/python
GEN=/Users/guisfits/llm-models/ace-step-1.5/gen.py
CAP="dark ambient drone, low bowed double bass, sustained wide string pad, minor key, brooding documentary underscore, slow, sparse, no melody, no drums, no percussion, no vocals"
run() { # seed key duration
  heavy_lock_acquire "gen-music.sh seed $1"
  $PY $GEN --out music/cand-$1-$3.wav --duration $3 --seed $1 --bpm 81 --keyscale "$2" --caption "$CAP" > music/cand-$1-$3.log 2>&1
  heavy_lock_release
}
run 11 "D minor" 56
run 22 "G minor" 56
