// The feed model: what the page stacks. Pure: the callers pass file text, nothing here touches
// the disk.
//
// crew/updates.jsonl, one JSON object per line, appended by the crew when a step lands:
//   {"id":"u012","t":"2026-10-15T22:00:00-03:00","title":"Board 1 de 34","note":"…",
//    "media":["out/storyboard/c6-board-01.png"],"needs":"Dê uma nota ao board 1"}
// `id`, `t` (ISO with offset) and `title` are required; `note`, `media` (paths relative to the
// film: image, mp4 or mp3/wav) and `needs` (what the client must do, in one line) are optional.
// Feed order is `t` descending; equal times keep the file order, the later line first.

import { bullets } from "./md.mjs";

const str = (x) => (typeof x === "string" ? x.trim() : x == null ? "" : String(x).trim());
const TIME = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

// updates.jsonl → { items, dropped: ["line 3: <why>"] }, or null when the file is absent. A line
// that is not valid JSON, lacks a field or repeats an id is dropped, never thrown.
export function readUpdates(text) {
  if (text == null) return null;
  const items = [];
  const dropped = [];
  const ids = new Set();
  text.split("\n").forEach((raw, i) => {
    if (!raw.trim()) return;
    let x;
    try {
      x = JSON.parse(raw);
    } catch {
      dropped.push(`line ${i + 1}: not valid JSON`);
      return;
    }
    const id = str(x?.id);
    const t = str(x?.t);
    const title = str(x?.title);
    if (!id || !title || !TIME.test(t) || Number.isNaN(Date.parse(t.replace(" ", "T")))) {
      dropped.push(`line ${i + 1}: needs id, title and an ISO t`);
      return;
    }
    if (ids.has(id)) {
      dropped.push(`line ${i + 1}: repeated id ${id}`);
      return;
    }
    ids.add(id);
    const media = Array.isArray(x.media) ? x.media.map(str).filter(Boolean) : [];
    items.push({ kind: "update", id, t, ms: Date.parse(t.replace(" ", "T")), seq: i, title, note: str(x.note), media, needs: str(x.needs) });
  });
  return { items, dropped };
}

// crew/board-log.md bullets (`- 2026-10-15 — text`, newest first in the file) → text-only cards.
// Only used by a film that has no updates.jsonl yet.
export function logCards(text) {
  if (text == null) return [];
  return bullets(text).flatMap((b, i) => {
    const m = b.match(/^(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2})?)\s*[—–-]+\s*(.*)$/);
    const t = m?.[1];
    if (!t || Number.isNaN(Date.parse(t.replace(" ", "T")))) return [];
    // The file lists newest first, so a later line is older: negative seq keeps that order.
    return [{ kind: "log", id: `log-${i}`, t, ms: Date.parse(t.replace(" ", "T")), seq: -i, title: m[2].trim(), note: "", media: [], needs: "" }];
  });
}

// The feed, newest first.
export function feedOf(updates, log) {
  const items = updates ? updates.items : logCards(log);
  return [...items].sort((a, b) => b.ms - a.ms || b.seq - a.seq);
}

// What the client must do now: the newest card that asks for something, or null.
export const nowOf = (feed) => feed.find((c) => c.needs) ?? null;
