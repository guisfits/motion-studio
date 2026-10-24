// Sound cues a composition declares next to its picture: `at` seconds from the start of the
// sequence that owns them. The render stays silent; tools/audio/mix-remotion.mjs lays the SFX,
// the voice and the music under it from the flat list collectCues() returns.

export type Cue = { at: number /* s */; sfx: string; gain?: number };

/** A sequence's cues, `from` its first frame in the composition. */
export type CueBlock = { from: number; cues: Cue[] };

// Flattens per-sequence cues into composition time (s), sorted; cues before 0 or not finite are
// dropped, since the mix cannot place them.
export function collectCues(blocks: CueBlock[], fps: number): Cue[] {
  return blocks
    .flatMap(({ from, cues }) => cues.map((c) => ({ ...c, at: c.at + from / fps })))
    .filter((c) => Number.isFinite(c.at) && c.at >= 0)
    .sort((a, b) => a.at - b.at);
}

// The shape tools/audio/sfx.mjs renders: [{ t, type, gain? }].
export function toSfxCues(cues: Cue[]): { t: number; type: string; gain?: number }[] {
  return cues.map(({ at, sfx, gain }) => (gain === undefined ? { t: at, type: sfx } : { t: at, type: sfx, gain }));
}
