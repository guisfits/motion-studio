import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runFilmGate, stageFromEnv } from "../../../src/film/gate";
import { traceAt } from "./trace";
import { DURATION } from "./scene";

const dir = fileURLToPath(new URL(".", import.meta.url));

// `FILM_STAGE=<stage> npx vitest run studio/films/dry-run` is the gate command; with no stage set
// the test runs the draft gate and writes nothing.
describe("dry-run film", () => {
  it("traceAt is pure and answers every frame", () => {
    for (const f of [0, 45, 90, DURATION - 1]) expect(traceAt(f)).toEqual(traceAt(f));
    expect(traceAt(0).items.length).toBeGreaterThan(0);
  });

  it(`passes the ${stageFromEnv()} gate`, () => {
    const gate = runFilmGate({ dir, traceAt });
    expect(gate.summary.red, gate.markdown).toBe(0);
  });
});
