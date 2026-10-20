// The film's scenes, in film order: what CENAS lists. Pure: the callers pass parsed JSON.
//
// crew/scenes.json: [{"n":1,"rows":["b01","b02"],"title":"…","world":"A","status":"approved",
//   "media":"out/storyboard/c6-cena-01.png"}]
// `n` and `title` are required; `rows` are ids of crew/sync-sheet.json beats, whose `says` are
// joined into the words of the scene; `world` defaults to the first row's world; `status` is
// approved | waiting | todo (default todo); `media` is the scene's board picture (a path
// relative to the film), absent until the board exists.

const str = (x) => (typeof x === "string" ? x.trim() : x == null ? "" : String(x).trim());
export const STATUSES = Object.freeze(["approved", "waiting", "todo"]);

// → [{ n, rows, title, world, status, says, media: [path?] }] by n ascending; null when the file
// is absent or not a list. Items without a positive integer n or a title, and repeated n, drop.
export function readScenes(json, sheet) {
  if (!Array.isArray(json)) return null;
  const beats = new Map((Array.isArray(sheet?.beats) ? sheet.beats : []).map((b) => [str(b?.id), b]));
  const seen = new Set();
  const out = [];
  for (const x of json) {
    const n = Number(x?.n);
    const title = str(x?.title);
    if (!Number.isInteger(n) || n < 1 || !title || seen.has(n)) continue;
    seen.add(n);
    const rows = (Array.isArray(x.rows) ? x.rows : []).map(str).filter(Boolean);
    const status = str(x.status).toLowerCase();
    const media = str(x.media);
    out.push({
      n,
      rows,
      title,
      world: str(x.world) || str(beats.get(rows[0])?.world),
      status: STATUSES.includes(status) ? status : "todo",
      says: rows.map((r) => str(beats.get(r)?.says)).filter(Boolean).join(" "),
      media: media ? [media] : [],
    });
  }
  return out.sort((a, b) => a.n - b.n);
}
