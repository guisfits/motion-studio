// Publishing the feed's media: copies the files an update points at next to the page, scaling
// pictures down and keeping videos and audio within the host's per-file limit and the publish
// budget. Pure of any page markup.

import fs from "node:fs";
import path from "node:path";
import { FILE_MAX_BYTES } from "./media.mjs";

export const IMAGE_MAX_WIDTH = 1600;
// The skip reason the page shows as "file too big".
export const TOO_BIG = `over the ${FILE_MAX_BYTES / 1024 / 1024} MB file limit`;

const KINDS = [
  ["image", /\.(png|jpe?g|webp|gif)$/i],
  ["video", /\.(mp4|webm|mov|m4v)$/i],
  ["audio", /\.(mp3|wav|m4a|ogg)$/i],
];
export const kindOf = (name) => KINDS.find(([, re]) => re.test(name))?.[0] ?? null;

// Resolves the update media paths (relative to the film) to files inside the film folder.
// Returns { files: [{ rel, abs, kind, size }], problems: [string] } with one entry per distinct
// path; a path that escapes the film, is missing or has an unknown type is a problem, not a file.
export function resolveMedia(film, rels) {
  const files = [];
  const problems = [];
  const seen = new Set();
  const root = path.resolve(film);
  for (const rel of rels) {
    if (seen.has(rel)) continue;
    seen.add(rel);
    const abs = path.resolve(root, rel);
    const kind = kindOf(rel);
    if (abs !== root && !abs.startsWith(root + path.sep)) problems.push(`${rel}: outside the film folder`);
    else if (!kind) problems.push(`${rel}: not an image, video or audio file`);
    else if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) problems.push(`${rel}: file not found`);
    else files.push({ rel, abs, kind, size: fs.statSync(abs).size });
  }
  return { files, problems };
}

// Copies the files into the board's media folder. Images wider than IMAGE_MAX_WIDTH (or heavy
// PNGs) are re-encoded as JPEG (needs ffmpeg; without it they are copied as they are); a video or
// mp3 over FILE_MAX_BYTES is skipped; wav audio becomes mp3. Returns Map(rel → { kind, src }) for what
// made it, and `skipped: [{ rel, reason }]` for what did not.
export async function publish(files, media) {
  const out = new Map();
  const skipped = [];
  const taken = new Set();
  for (const f of files) {
    let base = `feed-${f.rel.replace(/[^\w.-]/g, "-")}`;
    while (taken.has(base)) base = `x-${base}`;
    taken.add(base);
    let src = null;
    if (f.kind === "video") {
      if (f.size > FILE_MAX_BYTES) {
        skipped.push({ rel: f.rel, reason: TOO_BIG });
        continue;
      }
      src = media.copy(f.abs, base);
    } else if (f.kind === "audio") {
      src = /\.mp3$/i.test(f.rel) ? media.copy(f.abs, base) : await media.mp3(f.abs, base.replace(/\.\w+$/, ""));
    } else {
      src = (await media.image(f.abs, base, IMAGE_MAX_WIDTH)) ?? media.copy(f.abs, base);
    }
    if (src) out.set(f.rel, { kind: f.kind, src });
    else skipped.push({ rel: f.rel, reason: f.size > FILE_MAX_BYTES ? TOO_BIG : "over the media budget" });
  }
  return { published: out, skipped };
}
