# Reference-time -> our-time anchors.  python3 lib/make-anchors.py -> lib/anchors.json [[ref, ours], ...]
# Each phrase of our voice was placed by voice/build-vo.py at a known start and end (voice/phrases.json),
# so those are exact; inside a phrase our words are spread like the reference's (linear between its
# first word start and last word end). Whisper word times on our takes are not used: the first word
# of a phrase often comes back 0.3 s late.
import json, os
H = os.path.dirname(os.path.abspath(__file__))
r = json.load(open(f"{H}/../crew/words.json"))["words"]
ph = json.load(open(f"{H}/../voice/phrases.json"))
a = [[0.0, 0.0]]
for n, p in enumerate(ph):
    rs, re_ = r[p["a"]]["s"], r[p["b"]]["e"]
    k = (p["end"] - p["start"]) / (re_ - rs)
    for i in range(p["a"], p["b"] + 1):
        a.append([r[i]["s"], round(p["start"] + (r[i]["s"] - rs) * k, 3)])
    # A phrase end anchors only where the reference pauses too: where it runs straight on, our extra
    # silence is folded into the last word, so the next cut still lands on the next word, not early.
    nxt = r[ph[n + 1]["a"]]["s"] if n + 1 < len(ph) else None
    if nxt is None or nxt - re_ >= 0.1:
        a.append([re_, p["end"]])
json.dump(a, open(f"{H}/anchors.json", "w"))
print(len(a), "anchors; end", a[-1])
