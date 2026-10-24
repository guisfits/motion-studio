import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const studio = fileURLToPath(new URL("../../..", import.meta.url));

test("writes a TypeScript module's cue array as JSON", () => {
  const dir = mkdtempSync(join(tmpdir(), "cues-json-"));
  const mod = join(dir, "c.ts");
  writeFileSync(mod, `import type { Cue } from "x";\nexport const C: Cue[] = [{ at: 1.5, sfx: "tape" }];\n`);
  const out = join(dir, "c.json");
  execFileSync("node", [join(studio, "tools/audio/cues-json.mjs"), mod, "C", out]);
  assert.deepEqual(JSON.parse(readFileSync(out, "utf8")), [{ at: 1.5, sfx: "tape" }]);
});

test("fails on a missing export", () => {
  const dir = mkdtempSync(join(tmpdir(), "cues-json-"));
  const mod = join(dir, "c.ts");
  writeFileSync(mod, `export const C = [];\n`);
  assert.throws(() => execFileSync("node", [join(studio, "tools/audio/cues-json.mjs"), mod, "NOPE", join(dir, "o.json")], { stdio: "pipe" }));
});
