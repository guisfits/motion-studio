// Reads a film folder into the plain data the board page renders: the title, the scenes, the feed's
// source files and the client's approvals. Every input is optional: a missing or unreadable file yields
// null (and a note in `errors` when it existed but failed), never a throw. Media is handled by
// publish.mjs.

import fs from "node:fs";
import path from "node:path";
import { readScenes } from "./scenes.mjs";
import { readApprovals, readTracker } from "./tracker.mjs";
import { feedOf, readUpdates } from "./updates.mjs";

export const readableSlug = (slug) =>
  slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

// "# Arrependei-vos (slug)" in crew/script.md → "Arrependei-vos"; anything else → the readable slug.
function filmTitle(slug, script) {
  const h1 = script?.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (h1) {
    const m = h1.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (m && m[2].trim() === slug) return m[1].trim();
  }
  return readableSlug(slug);
}

export function collect(film) {
  film = path.resolve(film);
  const errors = [];
  const text = (rel) => {
    try {
      return fs.existsSync(path.join(film, rel)) ? fs.readFileSync(path.join(film, rel), "utf8") : null;
    } catch (e) {
      errors.push(`${rel}: ${e.message}`);
      return null;
    }
  };
  const json = (rel) => {
    const t = text(rel);
    if (t == null) return null;
    try {
      return JSON.parse(t);
    } catch (e) {
      errors.push(`${rel}: ${e.message}`);
      return null;
    }
  };
  const slug = path.basename(film);
  const updates = readUpdates(text("crew/updates.jsonl"));
  for (const d of updates?.dropped ?? []) errors.push(`crew/updates.jsonl ${d}`);
  return {
    film,
    slug,
    title: filmTitle(slug, text("crew/script.md")),
    scenes: readScenes(json("crew/scenes.json"), json("crew/sync-sheet.json")),
    feed: feedOf(updates, text("crew/board-log.md")),
    approvals: readApprovals(json("crew/approvals.json")),
    tracker: readTracker(json("crew/tracker.json")),
    errors,
  };
}
