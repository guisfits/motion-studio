#!/usr/bin/env node
// Writes a composition's cue list as JSON for mix-remotion.mjs.
//
//   node tools/audio/cues-json.mjs <module.ts> <exportName> <out.json>
//
// The module must be loadable by Node directly (type-stripped TypeScript with type-only imports).
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Imports `exportName` from `modulePath` and writes it to `outPath` as JSON; returns the value.
export async function cuesJson(modulePath, exportName, outPath) {
  const mod = await import(pathToFileURL(resolve(modulePath)).href);
  if (!Array.isArray(mod[exportName])) throw new Error(`${modulePath}: export "${exportName}" is not an array`);
  writeFileSync(outPath, JSON.stringify(mod[exportName], null, 2) + "\n");
  return mod[exportName];
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [modulePath, exportName, outPath] = process.argv.slice(2);
  if (!modulePath || !exportName || !outPath) {
    console.error("usage: node tools/audio/cues-json.mjs <module.ts> <exportName> <out.json>");
    process.exit(2);
  }
  await cuesJson(modulePath, exportName, outPath);
}
