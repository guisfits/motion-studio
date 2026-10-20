# Writer device playbook

Each device: when, how in this engine, the measured range (ids are `research/editing-grammar.md`, read there for the full list of pieces), the tell and its fix. Numbers are register A (narrated 9:16 collage explainer, grammar section 0); a brief that picks B or C changes them. `~` = inference, not measured. Gate numbers are `NORMS` keys; the codes R1-R4 and T1-T3 are the animator's and Director's checks, named here so the script does not make them fail.

How the words become picture, in one line: the edit lands on the phrase (grammar section 10.1), the picture changes when a new noun, place, person or number is spoken and only the caption changes while the clause goes on (section 10.2). The writer controls both by where the new nouns sit.

## W1 Opening-line formula (grammar section 1)

- When: the first line of every film.
- Measured: 74 of 165 openings use one of six patterns: direct question or "you" 18 (`asr/DN-WcdHiZCs` "Have you seen this old man..."), negation twist 18 (`asr/DSpnlAhCaJ5` "...isn't Ferrari."), year first 17 (`asr/DOvNKEtiREq` "In 1958, Lego..."), superlative 15 (`asr/DQwRiFzCf6W`), "What if I told you" 13 (`asr/DNDJyk8pizL`), number first 4 (`asr/DaAV2R5IuSi` "20 billion dollars on the table."). 91 openings use none: a flat sourced statement is legitimate. The first 3 s are cut at the body rate (ratio 1.03): the hook lives in the line and its picture, not in faster cutting.
- How: name the pattern (or `plain statement`) in `script.md`. One complete clause; the object or person it names is a picture the storyboard can show at once (grammar section 1, "Picture of the hook"). The line is complete by about 3 s on the `words.json` clock (`take-metrics.mjs` prints it; `~`, from craft 2.8). A question hook is answered at the end, not in line two (`external`).
- Tell: a greeting, a channel line, "did you know", throat-clearing, a hook that needs six fragments to land, a stat that is not double-sourced. Fix: start at the first noun the picture can show; cut everything before it.

## W2 One new noun per clause (grammar sections 10.2, 13)

- When: every line.
- Measured: one edit event per 3.5 spoken words (2.1-5.5), one new picture per ~4.5 words (2.7-8.3, `~`), about 20% of cuts keep the picture and change only the caption (6-51%, `~`). The same limits sit in `NORMS.rhythm.wordsPerEvent` (gate R3) and `NORMS.rhythm.eventsPer10s` (R2).
- How: write in clauses of about 3 to 6 words; each clause brings exactly one new picturable noun (thing, person, place, number); the words around it (verbs, "but", "so", "that") ride on the picture already on screen and become caption changes. The storyboard turns each new noun into one sync-sheet row (one row = one picture event, `key[0]` = the word it lands on; `film-storyboard/references/sync-sheet-fields.md`), so your ledger is the row plan: a clause marked `-` becomes a caption change inside the row, not a new row. Keep a noun ledger in `script.md` (`templates.md`): per clause, the new noun or `-` if the clause continues. Aim at one new noun per clause on average, a `-` clause at about one in five.
- Tell: two new nouns in one clause (the picture is late for one of them, or two pictures land inside 1.5 s); a long run with no new noun (R3 words per event above range, the picture sits, R2 low); a pronoun whose noun is two lines back (the ear loses it, the picture has nothing to be). Fix: split the clause at the second noun, or drop the second noun; add a picturable noun to a long dry run, or turn it into a breath-card line (W5).

## W3 List lines and held lines (grammar section 1 "Burst, then hold"; `zhylin.md` 4-5)

- When: a run of names, stats or "everyone says X", followed by the point.
- Measured: 3-12 sub-second flicks, then one hold on the point; longest shot per piece 4.6 s (2.9-7.8); 6% of shots are 3 s or longer. Word-speed cutting (shot median 0.17-0.24 s) only for a run of names or stats (`hex/DUiOWpiCare`, `hex/DPgS8B7CZoY`). A list line is one short noun per ~0.7-1 s (`zhylin.md` 4).
- How: write the list as bare nouns ("Numbers. Places. Dates.") and put the explanatory sentence after it as a separate line that can carry a hold of 2 to 6 s; one number, name or conclusion per hold. Keep list lines and explanatory lines apart, never mixed in one breath (`zhylin.md` 5). A list run lowers words per event; the gate R3 reads the whole film, so one run is fine and a film made of runs is not.
- Tell: a list where every item is a full sentence (no flick possible); an explanatory sentence with five nouns (no hold possible, the picture cannot settle). Fix: shorten the items to nouns; move the extra nouns into the next line.

## W4 Stress word (grammar section 7 "Key-word size jump")

- When: the one word per line where the claim lands.
- Measured: the stressed word grows 1.6-4x the caption (`hex/DN-WcdHiZCs` 1.6-2x, `hex/DPY-sAcCXMC` 8% vs 3%) with nothing else changed; italic on one word is the only emphasis in `hex/Dbc-vIXCCqe`.
- How: mark at most one word per line as the stressed word (a candidate for `keys` in the line, if the overlay's narration format has it). The storyboard decides which actually grow. Stress falls on the new noun or the number, not on a verb.
- Tell: three stressed words in a line (no emphasis left), stress on a function word. Fix: one per line; if none deserves it, the line has no stress word.

## W5 Breath-card and word-card lines (grammar section 1 "Paper breath card", section 7 "One word per card")

- When: a date or one-line fact (`hex/DbnDiSLCtax` "It's 1932."), a statement with no honest picture (`hex/Dbc-vIXCCqe`), right after the hook and before the body (`ee/Dbp5HyyOmsR`), an emotional low (`hex/DbNcjZ2iwUc`), right before the answer (`ee/DcaqrJkOiD3`), a one-word negation (`hex/DdI4HMVi99s` "no money").
- Measured: card 0.8-1.5 s (a thesis card up to 4 s, `hex/DcG_IX3P3vI`); 0.3-0.5 s spacer words (`ee/DcszHOXuFU6`); frequency 3 in 65 s (`hex/DY_8VpvCpeO`), 6 in 56 s (`hex/DbnDiSLCtax`), one per 10-20 s (section 10.4). Word card: a sentence one word per card at ~0.4 s per word, 7 cards (`ee/DcD4mcfIgey`).
- How: at 3 words per second a 0.8-1.5 s card holds 2 to 4 spoken words. Write the line, mark its `role` as `card` in `script.md`, and place candidates at turns and after dense stretches; the storyboard places the cards and the Director decides one-word-per-card sentences (grammar section 13). A word-card sentence is at most 7 words and each word must be separable in the take: check in `words.json` that consecutive word starts are about 0.3-0.4 s apart.
- Tell: a card line that explains (six words or more, a subordinate clause); a card that introduces a new unsourced fact; a word card the voice runs together. Fix: cut to the date, the noun or the negation; source the fact like any line; retake with full stops between words.

## W6 Number sequence for count-in-steps (grammar section 1 "Count in steps")

- When: an escalating stat, elapsed time, a price or age that changes.
- Measured: 3 swaps of 0.3-0.4 s (`hex/DeBjyarCfFn` "$" to "$17." to "$17.8 million"); a counter run of ~1.5 s (`hex/DZmh9k_C2cp` 0 to 532); years at ~0.3 s each, then a 2-3 s hold (`pin/350031`, `~`); a number on an object (`ee/DZXDJ8AuAiU` flip board).
- How: deliver a sequence table in `script.md` (`templates.md`): label, values in order, unit, which values are sourced points and which are animated counter steps, and the one value the voice speaks. The voice speaks the end value once, as the hold begins (`~`: the steps are faster than speech); the unit is spoken after the number, kept small on screen. Start and end values are double-sourced (`research.md` 15). Intermediate steps that are not sourced are marked `animated, not data`.
- Tell: intermediate values presented as data; a spoken number that differs from the lettered one (S5 and the "picture = word" rule); a sequence whose steps the voice also reads aloud one by one (a count the caption cannot keep up with). Fix: label the steps, speak only the end value, keep both forms in the lettering table.

## W7 Numbers and names in a breath (`research/craft.md` 2.8; grammar section 7 "Numeral hero")

- One number or one name per breath. A number and a name in the same clause fight for the one hero the picture has. The numeral is the biggest element on its beat (12-35% of frame height, `hex/DPBpZK4CbYi`, `hex/DeGwAnTCJqI`), so choose the numbers that deserve it: one per beat.
- Write numbers, dates and references as the voice must say them in the spoken text; keep the on-screen form (digits) in the lettering table next to it. Never normalise one side only in the ASR check (`take.md`).

## W8 Ending and bookend (grammar sections 1 "Decelerating ending", 10.5)

- When: the last two lines.
- Measured: the last 5 s are cut at 0.53x the body rate (gate R4, `NORMS.rhythm.endSlowdown`), the last shot is 2.2 s (0.3-5.6); a fade to white with the last phrase held ~2 s (`hex/DXUEoamgkj5`); the last word small and alone on paper (`hex/DPwBS-mCRuS`); bookend: close on the opening device (`ee/DcJM47zIj-t` ledger, `ee/DdlOmjlOR0b` same plate).
- How: the kicker is one clause, shorter than the body clauses, that names something the opening showed, so the storyboard can put the same object in the first and the last beat; the picture holds after the last word (the hold is the picture's, never silence added to the voice file; S9 needs the beats to cover the voice within `NORMS.sync.coverSlackS`). A film without a call to action ends on the bookend or the quiet card (`~`); a call to action, when the overlay asks for one, is written inside the film's own world (`ee/DZXDJ8AuAiU`).
- Tell: a kicker that adds a new fact; a long final sentence the picture has to chase (R4 red); a call to action that breaks the register (`pin/350009`, `ee/DcD4mcfIgey`). Fix: one clause, one reused noun, nothing new.

## W9 Narration speed and length (grammar sections 0, 10)

- Measured: register A speaks 3.0 words/s (2.3-3.4); hex 3.1, ee 2.6; duration 48 s (30-66); speech is continuous, with no silence over ~0.4 s in a measured reel (`zhylin.md` 6). Gate F1 reads the last word end against `NORMS.film.minS` to `NORMS.film.maxS` (the band is wider than A's 30-66 s above 66 s and tighter below 45 s: aim inside both, 45 to 66 s).
- How: the voice is the clock; picture follows word times; never pad or trim copy to fit a block or a picture. Size the draft: words = target seconds x 3.0, minus the pauses you write (~0.4 s before the turn, ~0.3 s between ideas, `~`). Voice the first three lines, measure `words / (last end - first start)` with `scripts/take-metrics.mjs`, rescale the rest. A pt-BR or other-language take usually runs slower than English (`external`): trust the measured rate, not the counter. Never stretch speech with `atempo`.
- Reading load: captions are limited by `NORMS.caption.maxCps`, `NORMS.caption.maxWords` and `NORMS.caption.minLegibleS`. At 3.0 words/s a four-word chunk lasts ~1.3 s, so chunks of long words reach the cps ceiling (T1). `take-metrics.mjs` lists the chunks over the ceiling; fix them in the text (shorter words) before the storyboard builds on them.
- Tell: an invented duration the copy cannot fill (padding); a take at 2.0 words/s (a lecture) or 3.6 (an auctioneer); long silences left as air. Fix: honest copy length to the Director; cut pauses in the take.

## W10 Research is for you (`external`; `research/craft.md` 2.7)

The voice states the fact; it never narrates the research ("according to studies"). A line is a statement a picture can prove: a document, portrait, map or object that is the thing named. A line with no honest picture is flagged `no picture: lettered word only` in `script.md` (or becomes a breath-card line, W5) rather than given a decorative one.

## What the old rules became

| Old rule | Now |
| --- | --- |
| "At most one new idea per 8-10 s" | superseded: a new noun per clause (W2); ideas per 8-10 s was never measured |
| "A line is <= ~12 words" | kept as an ear limit (`~`); the measured unit is the clause (3-6 words) |
| Planning rate 2.2-2.6 words/s | register A is 3.0 (2.3-3.4); calibrate on the take |
| Proportions hook 1-3 s, body 70-80%, payoff 10-20%, end 0-2 s | kept as a starting shape (`external`); the ending hold is the picture's |
| Micro-beat every 15-20 s | replaced by a breath card every 10-20 s (section 10.4) |
