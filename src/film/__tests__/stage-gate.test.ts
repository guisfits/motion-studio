import { describe, expect, it } from "vitest";
import { runStageGate } from "../gate";

// The generic gate command, for any film folder at any stage (docs/film-contract.md, "Commands"):
//   FILM_DIR=<film dir> FILM_STAGE=<stage> npx vitest run src/film/__tests__/stage-gate.test.ts
// Skipped when FILM_DIR is not set, so a plain `npx vitest run` ignores it.
describe.skipIf(!process.env.FILM_DIR)("stage gate", () => {
  it(`passes the ${process.env.FILM_STAGE} gate of ${process.env.FILM_DIR}`, async () => {
    const gate = await runStageGate();
    expect(gate.summary.red, gate.markdown).toBe(0);
  });
});
