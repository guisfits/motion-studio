# Voices the clone phrase by phrase on the reference's word times (film-writer take.md 5b).
#   python3 voice/build-vo.py            → voice/vo.wav (mono 48 kHz, reference length)
# One designed take (takes/de_000.wav, OmniVoice --instruct with attribute keywords only: a
# descriptive instruct is read aloud) is the speaker reference for every other phrase.
import hashlib, json, os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
TAKES, REF, OUT = f"{HERE}/takes", f"{HERE}/../crew/words.json", f"{HERE}/vo.wav"
TRANSCRIBE = os.path.join(HERE, "../../../../tools/captions/transcribe.mjs")
TTS = "/Users/guisfits/llm-models/venv_mlx/bin/mlx_audio.tts.generate"
END = 50.375
SPEAKER = (
    f"{TAKES}/de_000.wav",
    "In 1800s London, people queued up on weekends to watch mental patients like zoo animals.",
)
SPOKEN = {"1800s": "eighteen-hundreds", "12": "twelve", "38": "thirty-eight"}

w = json.load(open(REF))["words"]
chunks, a = [], 0
for i, x in enumerate(w):
    if x["w"].endswith((",", ".")):
        # A one-word phrase comes back silent from OmniVoice: it rides with the next one.
        if i > a or i == len(w) - 1:
            chunks.append((a, i))
        else:
            continue
        a = i + 1
if a < len(w):
    chunks.append((a, len(w) - 1))


def dur(f):
    return float(
        subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "csv=p=0",
                f,
            ]
        )
    )


inputs, filt, free, words = [], [], 0.0, []
for k, (a, b) in enumerate(chunks):
    text = " ".join(SPOKEN.get(x["w"], x["w"]) for x in w[a : b + 1])
    # Never on top of the previous phrase: a long one pushes the next start a little later.
    start = max(w[a]["s"], free)
    slot = (w[b + 1]["s"] if b + 1 < len(w) else END) - start - 0.04
    # Cache key = the text, so re-chunking never reuses a stale take.
    key = "p" + hashlib.sha1(text.encode()).hexdigest()[:10]
    raw = f"{TAKES}/{key}_000.wav"
    if not os.path.exists(raw):
        subprocess.run(
            [
                TTS,
                "--model",
                "mlx-community/OmniVoice-fp32",
                "--lang_code",
                "en",
                "--ref_audio",
                SPEAKER[0],
                "--ref_text",
                SPEAKER[1],
                "--text",
                text,
                "--output_path",
                TAKES,
                "--file_prefix",
                key,
            ],
            check=True,
            capture_output=True,
        )
    trim = f"{TAKES}/pt{k:02d}.wav"
    subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-y",
            "-i",
            raw,
            "-af",
            "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
            trim,
        ],
        check=True,
    )
    d = dur(trim)
    # Tempo stays natural: 0.92-1.1, up to 1.3 for a 1-2 word phrase; a slower take is left as is.
    cap = 1.3 if b - a < 2 else 1.1
    tempo = min(d / slot, cap) if d > slot else 1.0
    over = d / tempo - slot
    free = start + d / tempo + 0.03
    print(
        f"p{k:02d} {start:5.2f} slot {slot:4.2f} ours {d:4.2f} tempo {tempo:.3f}{f'  OVER {over:+.2f}s' if over > 0.02 else ''} | {text}"
    )
    # Word times come from each short phrase (whisper drifts ~0.8 s on the whole track), placed at
    # the phrase's start and scaled by its tempo.
    pj = f"{TAKES}/{key}.json"
    if not os.path.exists(pj):
        subprocess.run(["node", TRANSCRIBE, trim, pj], check=True, capture_output=True)
    for x in json.load(open(pj))["words"]:
        words.append({"w": x["w"], "s": round(start + x["s"] / tempo, 3), "e": round(start + x["e"] / tempo, 3)})
    inputs += ["-i", trim]
    filt.append(
        f"[{k}]aresample=48000,atempo={tempo:.4f},adelay={int(start * 1000)}|{int(start * 1000)}[a{k}]"
    )
total = round(max(END, free + 0.1), 3)  # the last phrase is never clipped
filt.append(
    "".join(f"[a{k}]" for k in range(len(chunks)))
    + f"amix=inputs={len(chunks)}:normalize=0,apad=whole_dur={total}[o]"
)
subprocess.run(
    [
        "ffmpeg",
        "-v",
        "error",
        "-y",
        *inputs,
        "-filter_complex",
        ";".join(filt),
        "-map",
        "[o]",
        "-ac",
        "1",
        "-t",
        str(END),
        OUT,
    ],
    check=True,
)
json.dump({"words": words}, open(f"{HERE}/words.json", "w"), indent=0)
print("→", OUT, len(words), "words")
