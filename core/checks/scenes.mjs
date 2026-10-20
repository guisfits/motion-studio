// S10, one picture of a person per scene (client rule, 2026-10-16: "Fotos de objetos/livros é ok
// até. O que pega mais é de pessoas"): a portrait, or a painting or print whose subject is a
// person, may be the picture of only one scene of a film; a second scene finds another picture of
// the same person. Documents, books, pages, clippings, maps, objects, textures and fixings may recur.
//
// Scenes come from crew/scenes.json: [{ n, rows: [beat ids], continues?: n }]. A scene with
// `continues: m` is the same shot as scene m (no cut), so it counts as m. An asset is placed in a
// scene by the sheet (a beat's hero, support or rig asset) and by its manifest `boardScenes`.
import { finding } from "./report.mjs";

// Manifest kinds that can hold a picture of a person (hero portraits/paintings, board pieces,
// rigs cut from a figure); texture and footage never do.
const PICTURE_KINDS = new Set(["hero", "piece", "rig"]);
// Words in a manifest subject's parentheses (the board's category tag) that mark a picture of a person.
const PEOPLE_WORDS = new Set(["portrait", "painting", "print", "engraving", "woodcut"]);

const parens = (a) => [...(a.subject ?? "").matchAll(/\(([^()]*)\)/g)].map((m) => m[1]);

// An explicit `people: true|false` on the manifest row wins; else a rig (an acting figure) or a
// portrait/painting/print tag says it shows a person.
function showsPerson(a) {
  if (!PICTURE_KINDS.has(a.kind)) return false;
  if (typeof a.people === "boolean") return a.people;
  return a.kind === "rig" || parens(a).some((p) => p.toLowerCase().split(/[^a-z]+/).some((w) => PEOPLE_WORDS.has(w)));
}

// The picture an asset id stands for: a sheet id aliases its board clip, a rig is cut from a picture.
function pictureOf(a) {
  if (a.alias_of) return a.alias_of;
  if (a.kind === "rig") return a.subject?.match(/cut from (\S+)/)?.[1] ?? a.id;
  return a.id;
}

export function checkOnePersonPicture(sheet, manifest, scenes) {
  if (!scenes) return [];
  const byId = new Map(manifest.assets.map((a) => [a.id, a]));
  const cutOf = new Map(scenes.map((s) => [s.n, s.continues]));
  const shot = (n) => {
    const seen = new Set();
    while (cutOf.get(n) != null && !seen.has(n)) (seen.add(n), (n = cutOf.get(n)));
    return n;
  };
  const sceneOfBeat = new Map(scenes.flatMap((s) => s.rows.map((id) => [id, s.n])));

  const placed = new Map(); // picture id -> { ids, shots }
  const place = (id, n) => {
    const a = byId.get(id);
    if (!a) return;
    let key = pictureOf(a);
    const root = byId.get(key);
    if (root?.alias_of) key = root.alias_of;
    if (!showsPerson(a) && !(root && showsPerson(root))) return;
    const p = placed.get(key) ?? { ids: new Set(), shots: new Set() };
    p.ids.add(id);
    p.shots.add(shot(n));
    placed.set(key, p);
  };
  for (const b of sheet.beats ?? []) {
    const n = sceneOfBeat.get(b.id);
    if (n == null) continue;
    const refs = [b.hero, ...(b.support ?? []), b.rig].map((r) => (typeof r === "string" ? r : r?.asset));
    for (const id of refs) if (id) place(id, n);
  }
  for (const a of manifest.assets) for (const n of a.boardScenes ?? []) place(a.id, n);

  return [...placed]
    .filter(([, p]) => p.shots.size > 1)
    .map(([key, p]) => {
      const names = [...new Set([key, ...p.ids])].join(", ");
      return finding("red", "S10", null, `picture of a person ${names} is in scenes ${[...p.shots].sort((x, y) => x - y).join(", ")}: one picture of a person, one scene`);
    });
}
