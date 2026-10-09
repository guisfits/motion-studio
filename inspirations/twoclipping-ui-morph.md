# twoclipping-ui-morph (studied 2026-10-08)

Source: <https://x.com/twoclipping/status/2103273003555402193> · 14.1 s, 1:1.

## Grammar observed

- One black object on a warm light-grey ground, small in a lot of empty space: the frame is the
  negative space, the object is the subject. Nothing else is ever on screen.
- 12 states in 14 s (~1 s each): button → loader → check → mini player → full player → volume
  bar → toggle → segmented control → chart card (number counts, line draws, tooltip) → command
  palette (typed query, result highlights) → toast → button. Never a cut.
- Size, radius and fill morph together; content inside swaps only after the morph settles.
- A small cursor causes every change (press → state change), so each morph reads as an action.
- Numbers count up/down inside the chart state; the line draws on.
- The last frame equals the first: a seamless loop.
- Palette: black, white, grey; one colourful square (album art) as the only accent.

## General takeaways

- One object that never cuts; the list of states is the spec.
- A cursor or touch causes each state change.
- Content swaps after the container settles; text never overlaps.
- Loop ending on the first frame for feeds.
- If the project's design system uses square corners, morph size and fill, not radius.

## Never take

Its UI, its pill shapes and radii, its exact black-and-white palette.
