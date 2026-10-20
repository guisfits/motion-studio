// Manifest assets that are grounds or papers: registered as a piece, they still fill nothing (T5)
// and arrive as no picture (R1–R4).
export const groundIds = (manifest) =>
  new Set(
    (manifest?.assets ?? [])
      .filter((a) => a.kind === "ground" || a.treatment === "ground")
      .map((a) => a.id),
  );
