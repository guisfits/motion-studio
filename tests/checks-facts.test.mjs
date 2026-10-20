import { test } from "node:test";
import assert from "node:assert/strict";
import { checkFacts, scriptHash } from "../core/checks/facts.mjs";

const script = "# Script\nL1 Em 1517, Lutero escreveu 95 teses.\n";
const sheet = { beats: [{ id: "b1", lettering: [{ text: "1517" }, { text: "95 teses" }] }] };
const good = () => ({
  checker: "film-fact-checker",
  script: scriptHash(script),
  verdict: "PASS",
  claims: [{ id: "C01", line: "L1", text: "Em 1517, Lutero escreveu 95 teses.", verdict: "confirmed" }],
  lettering: [
    { text: "1517", verdict: "confirmed" },
    { text: "95 teses", verdict: "confirmed" },
  ],
  pictures: [],
});
const codes = (f) => f.map((x) => `${x.code}:${x.severity}`);

test("a passed, current fact-check covering the lettering has no finding", () => {
  assert.deepEqual(checkFacts({ script, factCheck: good(), sheet }), []);
});

test("X1: no fact-check, or one the writer signed, blocks every stage", () => {
  assert.deepEqual(codes(checkFacts({ script, factCheck: null, sheet })), ["X1:red"]);
  assert.deepEqual(codes(checkFacts({ script, factCheck: { ...good(), checker: "film-writer" }, sheet })), ["X1:red"]);
});

test("X2: the script changed after the check", () => {
  const f = checkFacts({ script: script.replace("95", "96"), factCheck: good(), sheet });
  assert.deepEqual(codes(f), ["X2:red"]);
});

test("X3: a wrong or unverified item, or a verdict that is not PASS", () => {
  const wrong = good();
  wrong.claims[0].verdict = "wrong";
  assert.deepEqual(codes(checkFacts({ script, factCheck: wrong, sheet })), ["X3:red"]);
  wrong.verdict = "FAIL";
  assert.deepEqual(codes(checkFacts({ script, factCheck: wrong, sheet })), ["X3:red", "X3:red"]);
  const pic = { ...good(), pictures: [{ asset: "luther", verdict: "unverified" }] };
  assert.deepEqual(codes(checkFacts({ script, factCheck: pic, sheet })), ["X3:red"]);
});

test("X3: a script with text and no claims (missing or empty) is not a passed fact-check", () => {
  const empty = { ...good(), claims: [] };
  const f = checkFacts({ script, factCheck: empty, sheet });
  assert.deepEqual(codes(f), ["X3:red"]);
  assert.match(f[0].msg, /no claims/);
  const missing = good();
  delete missing.claims;
  assert.deepEqual(codes(checkFacts({ script, factCheck: missing, sheet })), ["X3:red"]);
  // A script with no text has nothing to check.
  assert.deepEqual(checkFacts({ script: "  \n", factCheck: { ...empty, script: scriptHash("  \n") }, sheet: { beats: [] } }), []);
});

test("X4: lettering on screen that the fact-check never saw", () => {
  const more = { beats: [...sheet.beats, { id: "b2", lettering: [{ text: "Wittenberg, 31 de outubro" }] }] };
  const f = checkFacts({ script, factCheck: good(), sheet: more });
  assert.deepEqual(codes(f), ["X4:red"]);
  assert.match(f[0].msg, /b2 .*"Wittenberg, 31 de outubro"/);
});
