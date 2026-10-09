"""Objective sound-sync check: is every picture event heard as an attack at its moment?

    python core/audio/sync_check.py <final.mp4> <cuts.json> [--music music.wav]

cuts.json lists the film's picture events in seconds ([2.5, ...] or [{"t": 2.5, "label": "..."}]).

With --music (the music stem, unmixed), an event passes when, within ±50 ms of it, either
  - the mix carries an attack the music alone does not (the SFX reads through: mix onset
    strength ≥ 1.4 × the music's), or
  - the music itself hits there (its local onset strength ≥ 0.6 of the loudest attack within ±1 s),
    i.e. the picture is cut on a musical hit.
Without --music it falls back to "nearest percussive onset within 60 ms", which a busy score
passes too easily; prefer --music. The film passes when ≥ 80% of events pass. Exit 1 on fail.
"""

import json
import subprocess
import sys
import tempfile

import librosa
import numpy as np
from scipy.ndimage import maximum_filter1d

SR = 22050
HOP = 512


def load(path: str) -> np.ndarray:
    with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-loglevel",
                "error",
                "-i",
                path,
                "-vn",
                "-ac",
                "1",
                "-ar",
                str(SR),
                wav.name,
            ],
            check=True,
        )
        y, _ = librosa.load(wav.name, sr=SR, mono=True)
    # Picture events are attacks (hits, pages, clicks): measure the percussive layer.
    return librosa.effects.percussive(y, margin=3.0)


def envelope(y: np.ndarray) -> np.ndarray:
    return librosa.onset.onset_strength(y=y, sr=SR, hop_length=HOP)


def local_norm(env: np.ndarray) -> np.ndarray:
    window = int(librosa.time_to_frames(2.0, sr=SR, hop_length=HOP))
    return env / (maximum_filter1d(env, size=window) + 1e-9)


def peak_near(env: np.ndarray, t: float, ms: float = 50) -> float:
    f = int(librosa.time_to_frames(t, sr=SR, hop_length=HOP))
    w = max(1, int(librosa.time_to_frames(ms / 1000, sr=SR, hop_length=HOP)))
    return float(env[max(0, f - w) : f + w + 1].max()) if f < len(env) else 0.0


def main() -> int:
    args = sys.argv[1:]
    music = None
    if "--music" in args:
        i = args.index("--music")
        music = args[i + 1]
        args = args[:i] + args[i + 2 :]
    video, cuts_path = args
    raw = json.load(open(cuts_path))
    events = [
        (c["t"], c.get("label", "")) if isinstance(c, dict) else (float(c), "")
        for c in raw
    ]
    mix_env = envelope(load(video))
    passed = 0
    if music:
        mus_env = envelope(load(music))
        n = min(len(mix_env), len(mus_env))
        mix_env, mus_env = mix_env[:n], mus_env[:n]
        # Compare shapes, not levels: the mix is loudness-normalised, the stem is not.
        mix_env = mix_env / (np.median(mix_env) + 1e-9)
        mus_env = mus_env / (np.median(mus_env) + 1e-9)
        mus_local = local_norm(mus_env)
        for t, label in events:
            gain = peak_near(mix_env, t) / (peak_near(mus_env, t) + 1e-6)
            hit = peak_near(mus_local, t)
            ok = gain >= 1.4 or hit >= 0.6
            passed += ok
            why = (
                f"sfx x{gain:4.1f}"
                if gain >= 1.4
                else (
                    f"music hit {hit:.2f}"
                    if hit >= 0.6
                    else f"sfx x{gain:4.1f}, music {hit:.2f}"
                )
            )
            print(f"{t:7.2f}s  {'ok ' if ok else 'OFF'}  {why:<24} {label}")
    else:
        local = local_norm(mix_env)
        frames = librosa.util.peak_pick(
            local, pre_max=3, post_max=3, pre_avg=10, post_avg=10, delta=0.25, wait=3
        )
        hits = librosa.frames_to_time(frames, sr=SR, hop_length=HOP)
        for t, label in events:
            off = float(np.min(np.abs(hits - t))) * 1000 if len(hits) else 1e9
            ok = off <= 60
            passed += ok
            print(f"{t:7.2f}s  {'ok ' if ok else 'OFF'}  {off:6.0f} ms  {label}")
    ratio = passed / len(events) if events else 1.0
    ok = ratio >= 0.8
    print(
        f"\n{passed}/{len(events)} events heard ({ratio:.0%}) → {'PASS' if ok else 'FAIL'}"
    )
    return 0 if ok else 1


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit("usage: sync_check.py <final.mp4> <cuts.json> [--music music.wav]")
    sys.exit(main())
