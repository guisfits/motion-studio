#!/bin/zsh
# Render our stills at the given 0-based frames (= reference frames, 1:1) and build the
# ref-above / ours-below sheet.   studio/films/clone-lion/lib/stills.sh <prefix> <frame...>   (from the studio root)
F=studio/films/clone-lion
pre=$1; shift
mkdir -p $F/out/stills
for r in "$@"; do
  npx remotion still studio/index.ts F-CloneLion $F/out/stills/$pre-$r.png --frame=$r --scale=0.5 --log=error
done
python3 -I $F/lib/pairs.py $pre "$@"
