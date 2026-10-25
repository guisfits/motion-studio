#!/bin/zsh
# Render our stills for REFERENCE frames (0-based) and build the ref/ours sheet.
#   studio/films/clone-bethlem/lib/stills.sh <prefix> <refFrame...>   (run from the studio root)
F=studio/films/clone-bethlem
pre=$1; shift
for r in "$@"; do
  o=$(python3 -c "
import json;a=json.load(open('$F/lib/anchors.json'));t=$r/24
for p,q in zip(a,a[1:]):
  if t<=q[0]: print(round((p[1]+(t-p[0])/(q[0]-p[0])*(q[1]-p[1]) if q[0]>p[0] else q[1])*24)); break")
  npx remotion still studio/index.ts F-CloneBethlem $F/out/stills/$pre-$r.png --frame=$o --scale=0.5 --log=error
done
python3 -I $F/lib/pairs.py $pre "$@"
