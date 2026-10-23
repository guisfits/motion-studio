#!/usr/bin/env bash
# Fetches Remotion's official agent skills (github.com/remotion-dev/skills) at a pinned commit
# into skills/remotion/<skill>/. The repo carries no licence, so the copies are never committed
# (skills/remotion/*/ is gitignored); only this script and skills/remotion/SOURCE.md are tracked.
#
#   tools/skills/sync-remotion-skills.sh            # the pinned commit
#   tools/skills/sync-remotion-skills.sh <sha>      # another commit (then update SOURCE.md)
set -euo pipefail

PINNED=6c67adcd9cdbe6eb84d76342da89b225f9161cb2
SHA="${1:-$PINNED}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEST="$ROOT/skills/remotion"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

curl -fsSL "https://codeload.github.com/remotion-dev/skills/tar.gz/$SHA" | tar -xz -C "$TMP"
SRC="$TMP/skills-$SHA/skills"
[ -d "$SRC" ] || { echo "sync-remotion-skills: no skills/ dir at $SHA" >&2; exit 1; }

find "$DEST" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} +
cp -R "$SRC"/. "$DEST"/
echo "sync-remotion-skills: $(find "$DEST" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ') skills at ${SHA:0:12} → skills/remotion/"
