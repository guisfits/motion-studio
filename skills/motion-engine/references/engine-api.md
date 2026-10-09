# Engine API (core/lib)

Films import the engine by URL from the preview server's root. `new-film.mjs` writes the right
prefix into the template (`<E>` below): the server roots at `--root`, else `MOTION_ROOT`, else
the git top level of the film, else the engine itself; a film outside the root is refused.

```
<E>/core/lib/{stage,motion,layout,theme,table,clip,phone,voice}.js   level 1, any film
<E>/styles/vox/lib/{kit,moves,collage}.js                             editorial collage components
<E>/styles/motion-graphics/lib/{text,scenes}.js                       UI / kinetic-type helpers
```

## Film skeleton

```js
import { setTheme } from "<E>/core/lib/theme.js";
import { createStage } from "<E>/core/lib/stage.js";
import { spring, track, SPRINGS, rng } from "<E>/core/lib/motion.js";
import { makeTable } from "<E>/core/lib/table.js";
import { loadVoice, say } from "<E>/core/lib/voice.js";

setTheme({ colors: { accent: "#b0361f" } });        // before createStage: fonts load there
const beats = await (await fetch("./beats.json")).json();
const B = (i) => beats.beats[i];
const V = await loadVoice("voice/words.json");

const stage = await createStage({ dur: 48, formats: ["9x16"], images: { doc: "assets/doc.png" } });
const { W, H, box, img, dom, g } = stage;
const table = makeTable(stage);
// ... build everything once here ...
window.CUES = [...table.cues() /* , ...each component's cues() */];
stage.run((t) => table.draw(t));
```

## Contract

- `draw(t)` sets everything the frame shows from `t` alone. No CSS transitions, timers,
  `Math.random` or state carried between calls. Build DOM once; `draw` only writes styles.
- Every component: built once with `tIn` / `tOut`, `x.draw(t)` paints any `t`, `x.cues()` returns
  its sounds `[{ t, type, gain, len? }]`. Gather them into `window.CUES`; the renderer writes
  `out/cues.auto.json`.
- Images and clip frames register their decode with `stage.waitFor`; `window.seek` resolves only
  after, so frames never show a half-decoded picture.

## `createStage(opts)` (stage.js)

`opts`: `{ dur, formats = ["9x16"], images: { name: path }, background }`. Returns:

| Field | Meaning |
|---|---|
| `W`, `H`, `format` | pixel size of the format chosen by `?format=` |
| `box` `{x,y,w,h}` | safe rectangle; compose essentials inside it (9:16 keeps the platform UI zones clear) |
| `g`, `canvas` | canvas 2D layer (bottom); `g.save()/restore()` around any transform/alpha/font change |
| `dom` | DOM layer above (CSS 3D, real text layout, phone) |
| `img.<name>` | preloaded, decoded images |
| `waitFor(promise)` | hold the frame until a decode resolves |
| `run(draw)` | registers `window.seek`; in a normal browser starts a live scrubbable preview |

## `theme.js`

`theme()` returns the current look; `setTheme(partial)` deep-merges (arrays such as `fonts`
replace); `resetTheme()`. Tokens: `colors` (`ground ground2 ink ink2 ink3 rule ruleSoft accent
accentInk accentWash night night2 nightInk nightInk2 nightRule nightAccent glow`), `families`
(`display serif body mono typewriter script hand`), `fonts` (`[{ family, style, url, range? }]`
loaded and awaited by the stage), `textures.paper`. The engine default is neutral; a project
overlay injects its identity here, never by editing components.

## `motion.js`

| Function | Use |
|---|---|
| `spring(t, k, d)` | 0→1 from t = 0. `SPRINGS.snappy` (UI, a hair of overshoot), `default` (cards, camera), `heavy` (big type, devices; no overshoot), `playful` (rarely right) |
| `track(t, [[time, value], …], k, d)` | a value retargeted several times, continuous (retarget, never restart) |
| `springReach(k, d, frac = 0.95)` | seconds until a spring reaches `frac`: derive cue times from it |
| `swapAlpha(t, tIn, tOut)` | content inside a morphing container; the old leaves before the new arrives |
| `indicator(t, stops, width)` | stretching tab/selection bar `{left, right}` |
| `stepped(t, fps = 12)` | quantise time for hand-moved, stop-motion feel |
| `progress`, `lerp`, `clamp`, `loopT`, `rng(seed)` | helpers; `progress` is a gate, never visible motion on its own |

## `table.js`: the infinite table and its camera

A film can be shot on a world plane much bigger than the frame. Surfaces (paper, wood,
photographs) lie on it, pieces are placed on it, and the camera travels between **stations**;
travel is the transition.

```js
const table = makeTable(stage, { breathe: 1, blur: 1 });
const A = table.station({ x: 0, y: 0, rot: 0 });
const B2 = table.station({ x: 3700, y: -500, rot: 90 });
A.surface({ x: 0, y: 0, w: 2400, h: 3000, src: "assets/paper.jpg" });
const [p] = A.add(() => [/* components built in local coordinates */]);
table.camera([
  [0, A.view(700, 1100, { z: 0.9, roll: -6 })],
  [V.at("but") - 0.7, B2.view(650, 780, { z: 1.05, ease: "move" })],
]);
```

- `station({ x, y, rot })` → `add`, `surface`, `view(lx, ly, { z, roll, ease })`; a view reads the
  station upright, so travel turns the camera by the stations' `rot` difference plus `roll`.
- Eases `EASE = { glide, move, whip }`: `glide` slow drift (~1.2 s), `move` confident travel
  (~0.7 s), `whip` lands hard (~0.35 s). A key's time is when its spring **starts**.
- While a key holds, handheld breathing keeps the camera alive (`breathe: 0` turns it off).
- Motion blur is automatic: above `BLUR_FLOOR` (4 px/frame) the world smears along the travel
  (`BLUR_GAIN` 0.35, capped at `BLUR_MAX` 90 px). Pieces moving on their own do not blur: give
  big exits a heavier spring or a shorter path, or render the range with `--sub 8`.
- `table.at(t)` gives the camera for screen-space overlays. Stations stack in creation order
  (create the lower one first).
- `tear(stage, { x, y, w, h, src | color, tIn, dir, seed })` rips a sheet along a seeded ragged
  line to reveal what lies beneath: a surface change without a fade.
- `table.cues()` emits one `whoosh` per real travel (none for small moves, `swish` for whips).

## `voice.js`: narration timing and captions

```js
const V = await loadVoice("voice/words.json");
V.at("nobody")                 // start of the first occurrence; { line, nth, end: true }
V.line("hook")                 // { start, end, text, marks }
V.words("hook"), V.lines       // the data
const cap = say(stage, V, { line: "hook", x: box.x, y: 1360, w: 900, screen: true });
// draw: cap.draw(t); cues: cap.cues()
```

- `say` writes each word on its spoken frame; `keys` from the narration become the key style
  (`keyStyle`, `accent`); the line exits before the next line starts (`tOut` overrides).
- `marks: { word: "circle" | "underline" | "highlight" | "strike" }` (or per line in
  `narration.json`; the option wins). Highlight sweeps in as the word starts; pen marks draw right
  after it ends; cues `marker` / `pen`.
- `screen: true` pins the line to `screenOverlay(stage)`, a fixed layer above the camera, clamped
  into `stage.box`, type shrinking to fit; use it whenever the camera rolls or zooms during a line.
  Lead words never go under 60 px at 1080 wide.
- An unknown word throws: a renamed line fails loudly instead of drifting silently.

## `clip.js` and `phone.js`

- `makeClip(stage, dir)` plays a recording frame-exactly from stills made by
  `core/reference/clip.mjs <rec> <dir> --fps 60 [--from s --to s]`: `clip.at(s)` (clamped),
  `clip.dur`, `clip.el` for footage placed directly in `dom`.
- `makePhone(stage, { width, screens: [clip | img], kind: "iphone" | "android", dark })` →
  `{ el, width, height, screenW, screenH, push(i, p), show(i, a), scroll(i, px) }`. Position it with
  `phone.el.style.transform` in `draw`. A screen is normally a clip of real use; `push` only where
  the app itself navigates that way.

## `layout.js`

`FORMATS` (`9x16`, `1x1`, `16x9`) and `layout(format)` → `W`, `H`, safe margins, `box`.

## Determinism check

Render the same `--draft --from a --to b` twice and compare `ffmpeg -i x.mp4 -f md5 -`. The
engine's own suite (`npm test`) renders fixtures twice and compares frame hashes.
