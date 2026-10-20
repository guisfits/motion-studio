# Worked examples (project-agnostic, real sources)

The topic is a famous quotation. The research log shows what was opened; where a second source was not opened, the log says so and the verdict follows the rule (`research.md` 5, 7).

## 1. A client claim that fails, and the replacement

Brief line (origin: client): "Open with: Marie Antoinette told the starving people to eat cake."

```
## C01 - The line "let them eat cake" is in Rousseau's Confessions, attributed to an unnamed princess
origin: found            verdict: restated            used in: L03, L05

- Source A: J.-J. Rousseau, Les Confessions, livre VI, fr.wikisource.org (edition text as transcribed there), accessed 2026-10-15. Type: primary.
  > "Je me rappelai le pis-aller d'une grande princesse à qui l'on disait que les paysans n'avaient pas de pain ... Qu'ils mangent de la brioche."
- Source B: Wikipedia, "Let them eat cake", accessed 2026-10-15. Type: encyclopaedia (tertiary; a real log would add Britannica or a university-press page, Britannica returned 403 here).
  > "whose first six books were written in 1765"  (the same page later says 1769)
- Pins: unit book six / period 1765 vs 1769 / place - / counted by - (same in A and B: period differs)
- Note: the date of writing differs inside source B, so the script says "in the seventeen sixties". The word is "brioche" in the original; the film says "cake" because the line the viewer knows is the English one (labelled in the lettering table).

## C02 - Marie Antoinette is first named as the speaker in 1843
origin: found            verdict: unverified          used in: nowhere
- Source A: Wikipedia, same page: "attributed to Antoinette by Alphonse Karr in Les Guêpes of March 1843."
- Source B: not opened. One search summary repeats it; a summary is not a source.
- Note: dropped from the spoken text until a second independent source is opened. The line L02 does not depend on it.
```

The client's hook ("she told the starving people to eat cake") fails rule 11 (earliest source) and is replaced by a hook that needs no number: the quote first, then the negation twist (opening pattern 2, grammar section 1).

## 2. Lines, noun ledger, card lines, the bookend

| id | spoken text | role | new noun | stress | note |
| --- | --- | --- | --- | --- | --- |
| L01 | Let them eat cake. | cold open | cake | cake | 4 words, one noun |
| L02 | Marie Antoinette never said it. | evidence | Marie Antoinette | never | 5 words; the negation twist |
| L03 | It is in a book by Rousseau. | evidence | the book | Rousseau | 7 words; the book is the picture, Rousseau is its spine |
| L04 | Written in the seventeen sixties. | evidence | 1760s | sixties | lettered "1760s", says "seventeen sixties" |
| L05 | About a princess he never names. | evidence | princess (unnamed) | never | the picture is a silhouette, not a portrait of anyone |
| L06 | Not hers. | card | - | hers | 2 words, a paper card |
| L07 | So whose line is it? | turn | - | whose | holds the card's beat |
| L08 | The cake is Rousseau's. | kicker | - (cake, book again) | Rousseau's | bookend: the first and third pictures come back |

Counts (computed from the table): 38 words, 12.7 s at 3.0 words/s, 5 new nouns, so 7.6 words per new noun, inside the 2.7-8.3 range of grammar section 10 but near its top, because L06 and L07 are card and turn lines. Read the excerpt aloud: the ear takes each clause once. A real script would insert a list line (bare nouns) before the turn and a held explanatory sentence after it (W3).

What this shows: L01 and L02 are one clause each because "cake" and "Marie Antoinette" are two new nouns (W2 split); L06 is a card line of two words (W5); L08 is one clause that reuses two nouns the open and the middle showed (W8); no line states 1843, because C02 is `unverified`.

## 3. A number sequence

Wrong: "In 1765 it was written, in 1770 she arrived, in 1793 she died, in 1843 her name was attached." Four numbers in one breath, each read aloud, none of them a picture.

Right: a sequence row in `script.md` (`templates.md`) with the years as sourced points, the voice speaking one value and the numerals stepping at ~0.3-0.4 s, then a 2 to 3 s hold on the last one (W6, `hex/Dc3B4rcCH18`, `pin/350031`):

| id | label | values in order | unit | sourced points | animated steps | spoken value |
| --- | --- | --- | --- | --- | --- | --- |
| N1 | Years until her name was attached | 1770, 1793, 1843 | year | all three, each double-sourced before use | none | "eighteen forty-three" |

The spoken line is one clause: "Her name came later. Much later." The lettering table carries `1843` / `eighteen forty-three`. Until C02 is confirmed this sequence stays out of the film.
