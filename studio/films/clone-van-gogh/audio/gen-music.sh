#!/bin/zsh
# Generates ACE-Step candidates for the clone-van-gogh bed (sequential, under the shared GPU lock).
# Round 1 (31 s): seeds 11/22/33 ended their audio at ~29 s; round 2 asks for 40 s and the film cuts at 30.75 s.
cd "$(dirname "$0")"
PY=/Users/guisfits/llm-models/ace-step-1.5/repo/.venv/bin/python
GEN=/Users/guisfits/llm-models/ace-step-1.5/gen.py
CAP="dark cinematic instrumental, solo cello with long sustained legato notes, soft warm string pad, minor key, brooding documentary underscore, slow, sparse, very soft low pulse, gradually building tension, no drums, no vocals, no singing"
run() { # seed key duration
  until mkdir /tmp/motion-studio-render.lock 2>/dev/null; do sleep 3; done
  $PY $GEN --out music/cand-$1-$3.wav --duration $3 --seed $1 --bpm 68 --keyscale "$2" --caption "$CAP" > music/cand-$1-$3.log 2>&1
  rmdir /tmp/motion-studio-render.lock
}
run 11 "D minor" 40
run 33 "C minor" 40
run 22 "A minor" 40
echo done > music/DONE2
