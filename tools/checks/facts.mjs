// Gates X1–X4: the film teaches, so a wrong fact is the worst defect it can have. The writer
// researches; a second agent (film-fact-checker, never the writer) re-checks every claim cold and
// writes crew/fact-check.json. These gates only prove that check happened, is current and passed;
// whether a claim is true is the checker's judgement, not code.
import { createHash } from "node:crypto";
import { finding } from "./report.mjs";

const OK = new Set(["confirmed", "restated"]);
const CHECKER = "film-fact-checker";

// Whitespace-insensitive, so reflowing the script does not void the check; any word change does.
export const scriptHash = (text) =>
  createHash("sha1").update(text.replace(/\s+/g, " ").trim()).digest("hex").slice(0, 12);

const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim().toLowerCase();

// script: crew/script.md text; factCheck: parsed crew/fact-check.json or null; sheet: sync sheet.
export function checkFacts({ script, factCheck, sheet }) {
  if (!factCheck || factCheck.checker !== CHECKER)
    return [finding("red", "X1", null, `no crew/fact-check.json signed by ${CHECKER} (the writer cannot check its own facts)`)];
  const f = [];
  if (factCheck.script !== scriptHash(script))
    f.push(finding("red", "X2", null, "crew/script.md changed after the fact-check: re-check the changed lines"));
  // A script with text and a fact-check with no claims checked nothing: PASS would be hollow.
  if (script.trim() && !factCheck.claims?.length)
    f.push(finding("red", "X3", null, "the script has text but the fact-check lists no claims"));
  for (const [kind, items] of Object.entries({
    claim: factCheck.claims,
    lettering: factCheck.lettering,
    picture: factCheck.pictures,
  }))
    for (const it of items ?? [])
      if (!OK.has(it.verdict))
        f.push(finding("red", "X3", null, `${kind} ${it.id ?? it.text ?? it.asset}: ${it.verdict ?? "no verdict"}${it.note ? ` (${it.note})` : ""}`));
  if (factCheck.verdict !== "PASS")
    f.push(finding("red", "X3", null, `fact-check verdict is ${factCheck.verdict ?? "missing"}, not PASS`));
  // Lettering is a claim on screen: every text the sheet puts up was seen by the checker.
  const seen = new Set((factCheck.lettering ?? []).map((l) => norm(l.text)));
  for (const b of sheet?.beats ?? [])
    for (const l of b.lettering ?? [])
      if (l.text && !seen.has(norm(l.text)))
        f.push(finding("red", "X4", null, `${b.id} lettering "${l.text}" is not in the fact-check`));
  return f;
}

// node tools/checks/facts.mjs hash <film>  → the value fact-check.json's `script` must carry.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  if (process.argv[2] !== "hash" || !process.argv[3]) {
    console.error("usage: node tools/checks/facts.mjs hash <film>");
    process.exit(2);
  }
  console.log(scriptHash(readFileSync(join(process.argv[3], "crew", "script.md"), "utf8")));
}
