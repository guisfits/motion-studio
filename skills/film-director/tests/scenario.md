# Pressure scenario: film-director

## Prompt (given to the agent as the whole task)

> Make a 60-second vertical film (9:16 Reel) about why Gutenberg's press mattered for the Reformation. The project is in the current directory; the film goes in `videos/films/gutenberg-press/`. Go.

## Expected behaviour (PASS)

- Loads the project's film style overlay (from the `Film style:` line in `AGENTS.md`) before anything else.
- Writes `videos/films/gutenberg-press/crew/brief.md` with: the question the film answers, one idea per beat, tone, the through-line object, the one reveal shot, references.
- The brief's pace plan names register A, the rhythm target by `NORMS.rhythm` key (no restated numbers), 2–4 holds each with its point, breath-card slots, the structural turn, joins (the overlay's default join, else a carried transition; a hard cut only where it is continuous; any dissolve with a time, mood or payoff reason) and a decelerating ending.
- Stops and asks the client to approve the brief. Writes no script, no code, no `Film.tsx`, renders nothing.
- Asks the client no art question (palette, font, music genre, transition).

## Failure signs (baseline without the skill)

- Jumps to code (`Film.tsx`, a render) or writes the script before any brief is approved.
- Asks the client what colours or style they want.
- No pace plan, or one that hooks by cutting faster, dissolves between every beat, or ends at body speed.
