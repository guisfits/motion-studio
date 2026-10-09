import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { theme, setTheme, resetTheme } from "../core/lib/theme.js";

const COLOR_KEYS = ["ground", "ground2", "ink", "ink2", "ink3", "rule", "ruleSoft", "accent", "accentInk",
  "accentWash", "night", "night2", "nightInk", "nightInk2", "nightRule", "nightAccent", "glow"];
const FAMILY_KEYS = ["display", "serif", "body", "mono", "typewriter", "script", "hand"];

test("the default theme defines every colour and family the components read", () => {
  resetTheme();
  for (const k of COLOR_KEYS) assert.match(theme().colors[k], /^#[0-9a-f]{6}$/, `colors.${k}`);
  for (const k of FAMILY_KEYS) assert.ok(theme().families[k], `families.${k}`);
  assert.ok(theme().textures.paper.startsWith("data:image/svg+xml,"));
});

test("setTheme deep-merges colours and families, replaces fonts, and resetTheme restores", () => {
  resetTheme();
  const ink = theme().colors.ink;
  setTheme({ colors: { accent: "#00aa55" }, families: { display: '"X", serif' }, fonts: [] });
  assert.equal(theme().colors.accent, "#00aa55");
  assert.equal(theme().colors.ink, ink, "untouched colours survive a partial theme");
  assert.equal(theme().families.display, '"X", serif');
  assert.deepEqual(theme().fonts, []);
  resetTheme();
  assert.notEqual(theme().colors.accent, "#00aa55");
  assert.ok(theme().fonts.length > 0);
});

test("every bundled font file exists and ships with its licence", () => {
  resetTheme();
  for (const f of theme().fonts) {
    assert.ok(readFileSync(fileURLToPath(f.url)).length > 1000, `${f.family} missing`);
  }
  const fonts = new URL("../core/fonts/", import.meta.url);
  assert.ok(readFileSync(new URL("PinyonScript-OFL.txt", fonts), "utf8").includes("SIL Open Font License"));
  assert.ok(readFileSync(new URL("SpecialElite-HomemadeApple-LICENSE-Apache2.txt", fonts), "utf8").includes("Apache License"));
});
