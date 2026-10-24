# Machine-wide heavy-job lock (renders, image generation, music, TTS: one at a time). Source it, then:
#   heavy_lock_acquire [label]   # blocks; breaks a lock whose holder PID is dead; sets the EXIT trap to release
#   heavy_lock_release
# The lock is a directory (mkdir is atomic); `<lock>/pid` holds the holder's PID and `<lock>/cmd` its
# label, so a waiter can say who it waits for and recover when the holder was killed. A lock with no
# `pid` file yet is waited on, never broken (its holder is between mkdir and the pid write).
# `tools/render.sh`, `studio/films/clone-van-gogh/audio/gen-music.sh` and `assets/make-assets.py` share it.

MOTION_STUDIO_LOCK="${MOTION_STUDIO_LOCK:-/tmp/motion-studio-render.lock}"

heavy_lock_acquire() {
  local label="${1:-$0}" told="" holder
  while ! mkdir "$MOTION_STUDIO_LOCK" 2>/dev/null; do
    holder="$(cat "$MOTION_STUDIO_LOCK/pid" 2>/dev/null || true)"
    if [ -n "$holder" ] && ! ps -p "$holder" >/dev/null 2>&1; then
      # Dead holder: move the lock aside (atomic, so only one waiter wins) and take it. Re-read the PID
      # first so a lock a faster waiter just took is not removed.
      if [ "$(cat "$MOTION_STUDIO_LOCK/pid" 2>/dev/null || true)" = "$holder" ] \
        && mv "$MOTION_STUDIO_LOCK" "$MOTION_STUDIO_LOCK.stale.$$" 2>/dev/null; then
        rm -rf "$MOTION_STUDIO_LOCK.stale.$$"
        echo "heavy-job lock: removed stale lock of dead PID $holder" >&2
      fi
      continue
    fi
    if [ -z "$told" ] && [ -n "$holder" ]; then
      echo "waiting for heavy-job lock held by PID $holder ($(cat "$MOTION_STUDIO_LOCK/cmd" 2>/dev/null || echo unknown))" >&2
      told=1
    fi
    sleep 3
  done
  echo "$$" >"$MOTION_STUDIO_LOCK/pid"
  echo "$label" >"$MOTION_STUDIO_LOCK/cmd"
  trap heavy_lock_release EXIT
}

heavy_lock_release() {
  if [ "$(cat "$MOTION_STUDIO_LOCK/pid" 2>/dev/null || true)" = "$$" ]; then
    rm -rf "$MOTION_STUDIO_LOCK"
  fi
}
