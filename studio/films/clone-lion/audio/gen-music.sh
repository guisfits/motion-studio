#!/bin/zsh
# ACE-Step candidates for the clone-lion bed (sequential, under the shared heavy lock).
# Reference (breakdown 10): quiet tonal pre-roll, a sub-bass drop at f68 (2.27 s) on the first title
# stroke, then a ~130 BPM sub-bass bed with a tonal lead ~f165-205. Our own composition from a genre
# caption only.
cd "$(dirname "$0")"
source ../../../../tools/heavy-lock.sh
PY=/Users/guisfits/llm-models/ace-step-1.5/repo/.venv/bin/python
GEN=/Users/guisfits/llm-models/ace-step-1.5/gen.py
CAP="cinematic motivational hip hop instrumental, soft airy intro then a heavy 808 sub bass drop, slow confident beat, minimal, dark piano lead, no vocals"
run() { # seed key duration
  heavy_lock_acquire "clone-lion gen-music.sh seed $1"
  $PY $GEN --out music/cand-$1-$3.wav --duration $3 --seed $1 --bpm 130 --keyscale "$2" --caption "$CAP" > music/cand-$1-$3.log 2>&1
  heavy_lock_release
}
run 61 "A minor" 24
run 72 "D minor" 24
run 83 "E minor" 24
