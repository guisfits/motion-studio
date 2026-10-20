# Templates

## `crew/script.md`

```
# <working title>
Question answered: <one line, from the brief>   Register: A | B | C (from the brief)
Opening pattern: <question | negation twist | year first | superlative | what-if | number first | plain statement>
Bookend object: <the thing the opening shows and the kicker names again>
Planned: <N> words at 3.0 words/s = <T> s    Measured after the take: <T2> s, <w/s> words/s (take-metrics.mjs)

## Lines
| id | spoken text (the film's language) | role | claims | new noun (the picture) | stress | picture the line can prove |
| L01 | ... | cold open | C01 | cake | cake | ... |
| L06 | Not hers. | card | C01 | - | hers | paper card, no picture |

role: cold open | stakes | evidence | list | held | card | word card | turn | kicker
new noun: the one new picturable noun, place, person or number of the clause; `-` when the clause continues the picture already on screen. One per clause (playbook W2). Each non-`-` entry is one sync-sheet row (about 4.5 words per row, grammar section 10); the storyboard sets `key[0]` on that word.
stress: at most one word per line (playbook W4).
list: bare nouns, one per ~0.7-1 s. held: the explanatory sentence that carries the hold after a list (playbook W3).

## Lettering forms
| line | spoken form | on-screen form |
| L04 | seventeen sixties | 1760s |

## Number sequences (only when the film counts in steps, playbook W6)
| id | label | values in order | unit | sourced points | animated steps | spoken value |
| N1 | ... | ... | ... | start, end | the rest | end only |

## Sources
| claim | source A | source B |

## Claims dropped or restated
| claim | origin | why | replaced by |
```

Rules: `lettering forms` exist because the sync gate needs a lettered word to be a word spoken in its beat; a digit form is written by the storyboard as `text: "1760s"` with `says: "seventeen sixties"`.

## `crew/research.md`

Block shape in `research.md` (the reference file, same folder).

## `crew/cer.md`

Shape in `take.md`.

## Writer hand-off note (with the artifacts, to the Director)

```
done: script.md, research.md, voice/voice.wav, voice/words.json, cer.md
gate: F1 <last word end> s in <min>-<max> | CER <x.x> % <= <maxCer> | research: <n> claims, <n> two-source
pace: <w/s> words/s (A: 2.3-3.4) | opening line ends <t> s | caption chunks over cps ceiling: <n>
swaps: <client/brief claims replaced, one line each>
open: <anything the Director must decide>
```
