---
name: film-creative
description: Use before any scene of a film is laid out (storyboard rows, boards, style frames) and whenever a scene feels literal, flat or obvious ("seja criativo", "vá além do óbvio", "isso é só imagem colada", "pense fora da caixa"). Generates the scene's idea - the cultural connection, the iconic image, the visual metaphor and the paper event that make the line land - by connecting the line to art history, scripture, culture and the collage idea bank. Runs inside the director's work; its output feeds the storyboard and the art director.
---

# film-creative

## Role

The crew's ideas person. For every line of the film, find the picture a smart, cultured person would think of — not the first literal one. The storyboard places it, the art director dresses it, the animator moves it; this skill decides **what the scene is about visually**.

The client's standard (2026-10-15): *"ir além do óbvio, pensar fora da caixinha, conectar os pontos, ter insights do mundo e cultura."* Their own examples are the bar:

| Line | Obvious (rejected) | Connected (what the client wanted) |
|---|---|---|
| "Toda. A. Vida." (repentance is the whole life) | three word cards on red | *Toda. A.* over Rembrandt's **Return of the Prodigal Son** (repentance = coming home); *Vida.* with the hands of Michelangelo's **Creation of Adam** almost touching (life given by God) |
| "Lutero propõe 95 teses" | Luther's portrait beside the sheet | Luther **swings the hammer and nails the sheet** to the door (Pauwels' painting, rigged) |
| "E as envia ao arcebispo de Mainz" | the archbishop's portrait | the letter **travels a route drawn on the map** to Mainz, then a press **spreads copies across the cities** |
| "Lutero, frade e professor" | a static portrait | the portrait **arrives sliced and joins**, the beret **tips aside**, he **blinks** |
| "o rito da penitência" | a list of objects | Dürer's penitent **scourging himself** leads the rite; the rite becomes a **receipt** stamped "um ato a cumprir" |

## Process (per scene, before any layout)

1. **Name the idea under the line** in one phrase, not its nouns: "repentance is a return", "the word travels", "the rite is a transaction", "the Greek replaces the Latin".
2. **Connect the dots — at least three candidates from different shelves**, then pick:
   - **Art history and the canon** the audience already carries: the painting, engraving or sculpture that *is* this idea (Rembrandt, Michelangelo, Dürer, Cranach, Doré, Caravaggio, Holbein, Gustave Doré's Bible, Vermeer…). Abstract words always get the artwork that embodies them (life, grace, sin, return, light, word).
   - **Scripture and its images**: the parable, the scene, the object the text itself names (the prodigal, the lost coin, the door, the seed, the lamp, the potter's clay).
   - **Culture and the everyday**: a receipt, a stamp "PAGO", a ransom note, a detective's string board, a map with a route, a newspaper headline, a typewriter, a passport stamp — modern objects that make an old idea instantly legible.
   - **The idea bank**: finished pieces measured in `<engine>/inspirations/vox-collage/collage-study/findings.jsonl` (query by idea: `grep -i -E "tear|travel|stamp|reveal|hand"`), and the project's approved-frames shelf.
3. **Pick the one with the strongest double meaning** — it says the line *and* adds the thought behind it (the prodigal adds "coming home"; the receipt adds "a transaction"). Reject a pick a viewer would call obvious, decorative or unrelated.
4. **Turn it into a paper event** (the core rule of the crew: tear, cut, travel, drop, stamp, fold, act, wipe, swap) and name what the people in the pictures *do* (hammer, scourge, embrace, blink, reach).
5. **Check honesty**: the picture must be true to the line and to history (a picture later than the date it stands for is never captioned with the earlier date); a doctrinal point is never bent for a striking image.

## Deliver

Per scene, three lines handed to the storyboard and art director (in the sheet row's `idea` field or the brief's scene table):
- `idea`: the idea under the line + the connected image (with its source: work, artist, date).
- `event`: the paper event and the act of the people in it.
- `why`: the double meaning in one sentence.

## Tells

1. **Literal match**: the picture repeats the noun the voice says (a coin on "moeda") and adds nothing. Fix: find the picture of the *idea*.
2. **Word card where an artwork exists**: an abstract word set as type alone. Fix: the canonical artwork of that idea.
3. **Pretty but unrelated**: a famous image with no link to the line. Fix: step 3, the double meaning.
4. **Same shelf every time**: only portraits, or only documents. Fix: draw from art, scripture and culture across the film.
5. **Idea without an event**: a good image that only sits there. Fix: step 4.
6. **Type-only scene**: the line set as typed words and a word that tears or gets stamped, with no picture of the idea (client, 2026-10-16, on "Mas Mateus não escreveu em latim": "seja mais criativo, ou junte essa cena com a anterior"). Lettering alone is the obvious version. Fix: steps 1–3 find the picture that carries the claim (the evangelist writing in Greek, the Greek page against the Latin), or merge the line into the neighbouring scene's event when it only completes that scene's thought.
7. **Invented prop, no connection**: a made-up object (a tear-off calendar, a generic sign) that says the line but links to nothing a viewer knows (client, 2026-10-16, on the calendar scene: "ok… porém nada demais"). It passes, it does not land. Fix: steps 2–3 — prefer the known artwork, scripture scene or cultural object that carries the idea.

## Never

- Wait for the client to suggest the idea; if they have to, this skill failed.
- Use an image the audience cannot read in one second (obscure, unknown portraits); the famous image wins.
