// The film's look as data: colours, font families, the font files to load, and textures.
// The engine ships a neutral default; a project injects its own identity with setTheme()
// before createStage() (fonts load at stage creation, components read colours when they build).
//
//   import { setTheme } from ".../core/lib/theme.js";
//   setTheme({ colors: { accent: "#0a5" }, families: { display: '"My Face", serif' },
//              fonts: [{ family: "My Face", style: "normal", url: "/fonts/MyFace.woff2" }] });

const font = (file) => new URL(`../fonts/${file}`, import.meta.url).href;

// A quiet paper grain, procedural so the engine carries no image asset.
const PAPER_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/>" +
  "<feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.28 0 0 0 0.22 0'/></filter>" +
  "<rect width='512' height='512' fill='#efe8da'/><rect width='512' height='512' filter='url(#n)'/></svg>";

const DEFAULT = Object.freeze({
  colors: {
    ground: "#f1ece2", // the page / table surface
    ground2: "#e6dfd1",
    ink: "#1f1c19", // primary text and marks
    ink2: "#3d3833",
    ink3: "#6b645c",
    rule: "#2c2824",
    ruleSoft: "#c9c1b3",
    accent: "#b0361f", // the one emphasis colour (rubric, highlight, underline)
    accentInk: "#85291a",
    accentWash: "#f2d4c8",
    night: "#1b1917", // dark scenes
    night2: "#24211e",
    nightInk: "#e4ded3",
    nightInk2: "#a69f94",
    nightRule: "#4a4540",
    nightAccent: "#d9644a",
    glow: "#b89a5a", // warm light (rays, dust)
  },
  families: {
    display: 'Georgia, "Times New Roman", serif', // big statements, wordmark-like accents
    serif: 'Georgia, "Times New Roman", serif', // headlines and quoted documents
    body: 'Georgia, "Times New Roman", serif', // reading text, captions
    mono: 'ui-monospace, "SF Mono", Menlo, monospace', // labels, references
    typewriter: '"Special Elite", ui-monospace, monospace',
    script: '"Pinyon Script", Georgia, serif',
    hand: '"Homemade Apple", Georgia, serif',
  },
  // Faces stage.js declares and waits for: { family, style, url, range? }.
  fonts: [
    { family: "Special Elite", style: "normal", url: font("SpecialElite-Regular.ttf") },
    { family: "Pinyon Script", style: "normal", url: font("PinyonScript-Regular.ttf") },
    { family: "Homemade Apple", style: "normal", url: font("HomemadeApple-Regular.ttf") },
  ],
  textures: {
    paper: `data:image/svg+xml,${encodeURIComponent(PAPER_SVG)}`,
  },
});

const isPlain = (v) => v && typeof v === "object" && !Array.isArray(v);

function merge(base, over) {
  const out = { ...base };
  for (const [k, v] of Object.entries(over ?? {}))
    out[k] = isPlain(v) && isPlain(base[k]) ? merge(base[k], v) : v;
  return out;
}

let current = merge(DEFAULT, {});

export function theme() {
  return current;
}

// Deep-merges objects (colors, families, textures); arrays (fonts) replace. Returns the result.
export function setTheme(partial) {
  current = merge(current, partial);
  return current;
}

export function resetTheme() {
  current = merge(DEFAULT, {});
  return current;
}
