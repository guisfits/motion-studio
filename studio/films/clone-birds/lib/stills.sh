#!/bin/zsh
# Render our stills for loop frames (0-based, = reference frames: the clone keeps the reference's
# timeline 1:1) and build the ref-above / ours-below sheet.
#   studio/films/clone-birds/lib/stills.sh <prefix> <frame...>   (run from the studio root)
F=studio/films/clone-birds
pre=$1; shift
for r in "$@"; do
  npx remotion still studio/index.ts F-CloneBirds $F/out/stills/$pre-$r.png --frame=$r --scale=0.5 --log=error
done
python3 -I $F/lib/pairs.py $pre "$@"
