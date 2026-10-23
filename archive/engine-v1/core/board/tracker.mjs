// The director's tracker and the client's approvals, read from the crew folder. Pure: the caller
// passes parsed JSON (or null). Anything malformed is dropped item by item, never thrown.

const str = (x) => (typeof x === "string" ? x.trim() : x == null ? "" : String(x).trim());
const list = (x) => (Array.isArray(x) ? x : []);

// crew/tracker.json → { next: [{ what, who }] }, or null when absent/invalid. The page shows only
// the first "next" step, as one quiet line under AGORA; the rest of the file is the director's own.
export function readTracker(json) {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const next = list(json.next)
    .map((x) => ({ what: str(x?.what), who: str(x?.who) }))
    .filter((x) => x.what);
  return { next };
}

// db path segments allow letters, digits and `_ - . ~ : @ +` only.
export const approvalKey = (id) => str(id).replace(/[^A-Za-z0-9_.~:@+-]/g, "-").replace(/^\.+$/, "-").slice(0, 120);

// crew/approvals.json → [{ id, key, title, what, status }]; null when absent/invalid.
export function readApprovals(json) {
  if (!Array.isArray(json)) return null;
  const seen = new Set();
  const out = [];
  for (const x of json) {
    const id = str(x?.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      key: approvalKey(id),
      title: str(x?.title) || id,
      what: str(x?.what),
      status: str(x?.status).toLowerCase() === "closed" ? "closed" : "open",
    });
  }
  return out;
}
