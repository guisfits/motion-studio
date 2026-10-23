// Searches the open collections for a picture and shows the candidates on one contact sheet;
// then adds the chosen one to a kit catalog with its provenance. Only public domain and CC0 come
// through (finders.mjs). No key needed for any source.
//
//   node tools/kit/reference/find.mjs search "<terms>" [--out DIR] [--sources openverse,commons,aic,cleveland,met]
//        [--limit 12] [--min-w 1200]
//     → DIR/candidates.json + DIR/sheet.png (numbered cells: source, licence, width, title)
//   node tools/kit/reference/find.mjs add DIR/candidates.json <n> --kit DIR --id <kebab-id> --kind <kind>
//        --cut subject|paper|none [--tags a,b]
//   node tools/kit/reference/find.mjs texturelabs <slug|url> --kit DIR --id <kebab-id> [--kind texture] [--size L|XL]
//        [--tags a,b]    Texturelabs (free for commercial use): downloads the file (L = 4240 px class) into
//        <kit>/sources and appends the row (`resolve: "texturelabs"`: kit fetch re-resolves the signed link)
//     → appends the row to <kit>/catalog.json; then `kit.mjs fetch --only <id>` and `build --only <id>`
//
// Terms: English works best (collections are catalogued in English); add the period or medium
// ("woodcut", "engraving", "1520") to stay inside the film's world. Verify identity on the
// candidate's `page` before adding it: a thumbnail is not verification.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { catalogEntry, keep, normalize } from "./finders.mjs";
import * as tl from "./texturelabs.mjs";
import { makeSheet } from "../../critique/sheet.mjs";

const USER_AGENT = process.env.MOTION_USER_AGENT ?? "motion-studio-find/0.1";
// The Art Institute's IIIF server answers 403 without its own agent header.
const HEADERS = { "User-Agent": USER_AGENT, "AIC-User-Agent": USER_AGENT };
const ALL = ["openverse", "commons", "aic", "cleveland", "met"];

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i > 0 ? args[i + 1] : d;
};

async function getJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const searchers = {
  openverse: (q, n) =>
    getJson(`https://api.openverse.org/v1/images/?q=${q}&license=cc0,pdm&page_size=${n}`).then(normalize.openverse),
  commons: (q, n) =>
    getJson(
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6" +
        `&gsrsearch=${q}&gsrlimit=${n}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=400`,
    ).then(normalize.commons),
  aic: (q, n) =>
    getJson(
      `https://api.artic.edu/api/v1/artworks/search?q=${q}&limit=${n}` +
        "&fields=id,title,artist_display,date_display,image_id,is_public_domain,thumbnail",
    ).then(normalize.aic),
  cleveland: (q, n) =>
    getJson(`https://openaccess-api.clevelandart.org/api/artworks/?q=${q}&cc0=1&has_image=1&limit=${n}`).then(
      normalize.cleveland,
    ),
  met: async (q, n) => {
    const base = "https://collectionapi.metmuseum.org/public/collection";
    const { objectIDs = [] } = await getJson(`${base}/v1.1/search?q=${q}&hasImages=true&isPublicDomain=true&limit=${n}`);
    const objects = await Promise.all(objectIDs.slice(0, n).map((id) => getJson(`${base}/v1/objects/${id}`).catch(() => null)));
    return normalize.met(objects);
  },
};

async function search() {
  const terms = args[1];
  if (!terms) usage();
  const out = resolve(opt("out", join("find", terms.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))));
  const limit = Number(opt("limit", "12"));
  const minW = Number(opt("min-w", "0"));
  const sources = opt("sources", ALL.join(",")).split(",");
  const q = encodeURIComponent(terms);
  // Sources answer in parallel; one that is down or rate-limited is reported, not fatal.
  const results = await Promise.all(
    sources.map((s) =>
      searchers[s](q, limit).catch((e) => {
        console.log(`find: ${s} failed (${e.message})`);
        return [];
      }),
    ),
  );
  const candidates = keep(results.flat(), { minW });
  mkdirSync(join(out, "thumbs"), { recursive: true });
  writeFileSync(join(out, "candidates.json"), `${JSON.stringify({ terms, candidates }, null, 1)}\n`);
  console.log(sources.map((s, i) => `${s} ${results[i].length}`).join(" · "), `→ ${candidates.length} kept (≥ ${minW} px or unknown)`);
  if (!candidates.length) return;

  const curl = promisify(execFile);
  const headers = Object.entries(HEADERS).flatMap(([k, v]) => ["-H", `${k}: ${v}`]);
  const cells = (
    await Promise.all(
      candidates.map(async (c, i) => {
        const file = join(out, "thumbs", `${i + 1}.jpg`);
        try {
          if (!existsSync(file)) await curl("curl", ["-fsSL", "--max-time", "30", ...headers, "-o", file, c.thumb]);
          return { file, label: `${i + 1} · ${c.source} · ${c.licence} · ${c.w ?? "?"}px · ${c.title.slice(0, 40)}` };
        } catch {
          console.log(`find: no thumbnail for ${i + 1} (${c.thumb})`);
          return null;
        }
      }),
    )
  ).filter(Boolean);
  if (cells.length) await makeSheet(cells, join(out, "sheet.png"), { title: `find: ${terms}`, cols: 4, cellW: 300, cellBg: "#e8e2d4" });
  console.log(`find: ${join(out, "candidates.json")}${cells.length ? ` + ${join(out, "sheet.png")}` : ""}`);
}

function add() {
  const [file, n] = [args[1], Number(args[2])];
  const kit = opt("kit");
  if (!file || !n || !kit) usage();
  const { candidates } = JSON.parse(readFileSync(file, "utf8"));
  const c = candidates[n - 1];
  if (!c) throw new Error(`no candidate ${n} in ${file}`);
  const entry = catalogEntry(c, {
    id: opt("id"),
    kind: opt("kind"),
    cut: opt("cut", "subject"),
    tags: opt("tags", "").split(",").filter(Boolean),
  });
  const path = join(resolve(kit), "catalog.json");
  const catalog = JSON.parse(readFileSync(path, "utf8"));
  if (catalog.pieces.some((p) => p.id === entry.id && p.kind === entry.kind))
    throw new Error(`${entry.kind}/${entry.id} is already in ${path}`);
  catalog.pieces.push(entry);
  writeFileSync(path, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`find: added ${entry.kind}/${entry.id} (${entry.license}, ${entry.source}) → ${path}`);
}

async function texturelabs() {
  const kit = opt("kit");
  if (!args[1] || !kit) usage();
  const page = tl.pageUrl(args[1]);
  const size = opt("size", "L");
  const entry = tl.catalogEntry(await tl.fetchPage(page), page, {
    id: opt("id"),
    kind: opt("kind", "texture"),
    size,
    cut: opt("cut", "none"),
    tags: opt("tags", "").split(",").filter(Boolean),
  });
  const path = join(resolve(kit), "catalog.json");
  const catalog = JSON.parse(readFileSync(path, "utf8"));
  if (catalog.pieces.some((p) => p.id === entry.id && p.kind === entry.kind))
    throw new Error(`${entry.kind}/${entry.id} is already in ${path}`);
  await tl.download(page, size, join(resolve(kit), "sources", entry.file));
  catalog.pieces.push(entry);
  writeFileSync(path, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`find: added ${entry.kind}/${entry.id} (${entry.license}, ${entry.source}) → ${path}`);
}

// Used by kit.mjs fetch for catalog rows with `resolve: "texturelabs"`.
async function texturelabsFile() {
  await tl.download(args[1], args[2], args[3]);
}

function usage() {
  console.error(
    'usage: node find.mjs search "<terms>" [--out DIR] [--sources ...] [--limit N] [--min-w PX]\n' +
      "       node find.mjs texturelabs <slug|url> --kit DIR --id ID [--kind texture] [--size S|M|L|XL] [--tags a,b]\n" +
      "       node find.mjs add <candidates.json> <n> --kit DIR --id ID --kind KIND [--cut subject|paper|none] [--tags a,b]",
  );
  process.exit(2);
}

if (args[0] === "search") await search();
else if (args[0] === "add") add();
else if (args[0] === "texturelabs") await texturelabs();
else if (args[0] === "texturelabs-file") await texturelabsFile();
else usage();
