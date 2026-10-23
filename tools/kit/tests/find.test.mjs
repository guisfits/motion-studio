import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { catalogEntry, keep, licenceOf, normalize } from "../reference/finders.mjs";

const dir = fileURLToPath(new URL("fixture-find", import.meta.url));
const fixture = (name) => JSON.parse(readFileSync(join(dir, `${name}.json`), "utf8"));

test("licenceOf: only public domain and CC0 pass", () => {
  assert.equal(licenceOf("pdm"), "public domain");
  assert.equal(licenceOf("pd"), "public domain");
  assert.equal(licenceOf("Public domain"), "public domain");
  assert.equal(licenceOf("cc0"), "CC0");
  assert.equal(licenceOf("CC0 1.0"), "CC0");
  for (const no of ["by", "by-sa", "cc-by-sa-4.0", "CC BY-NC", "Copyrighted", "", undefined])
    assert.equal(licenceOf(no), null, String(no));
});

test("openverse: keeps cc0/pdm rows, drops the rest", () => {
  const c = normalize.openverse(fixture("openverse"));
  assert.equal(c.length, 2);
  assert.ok(c.every((x) => x.licence === "CC0" || x.licence === "public domain"));
  const [first] = c;
  assert.equal(first.source, "openverse");
  assert.match(first.url, /^https:\/\/live\.staticflickr\.com\//);
  assert.match(first.page, /flickr\.com\/photos/);
  assert.equal(first.w, 827);
  assert.equal(first.author, "Provenance Online Project");
});

test("commons: original URL without tracking, licence from extmetadata, plain-text author", () => {
  const data = fixture("commons");
  const pages = Object.values(data.query.pages);
  // A third page under CC BY-SA must not come through.
  data.query.pages.x = structuredClone(pages[0]);
  data.query.pages.x.imageinfo[0].extmetadata.License = { value: "cc-by-sa-4.0" };
  const c = normalize.commons(data);
  assert.equal(c.length, 2);
  const luther = c.find((x) => x.title.includes("Luther"));
  assert.equal(luther.licence, "public domain");
  assert.ok(!luther.url.includes("utm_"), luther.url);
  assert.match(luther.page, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.equal(luther.w, 1712);
  assert.ok(!/[<>]/.test(luther.author), luther.author);
  assert.match(luther.date, /^1522/);
  assert.equal(c.find((x) => x !== luther).licence, "CC0");
});

test("cleveland: print-size JPEG, CC0 only", () => {
  const c = normalize.cleveland(fixture("cleveland"));
  assert.equal(c.length, 1);
  assert.match(c[0].url, /_print\.jpg$/);
  assert.equal(c[0].w, 2794);
  assert.equal(c[0].licence, "CC0");
  assert.match(c[0].author, /John Neagle/);
});

test("aic: IIIF image at the public-domain size, scaled height", () => {
  const [a] = normalize.aic(fixture("aic"));
  assert.match(a.url, /^https:\/\/www\.artic\.edu\/iiif\/2\/.+\/full\/1686,\/0\/default\.jpg$/);
  assert.equal(a.w, 1686);
  assert.equal(a.h, Math.round((2250 * 1686) / 1838));
  assert.equal(a.licence, "public domain");
});

test("met: an object becomes a candidate only when public domain with an image", () => {
  const obj = fixture("met-object");
  const [m] = normalize.met([obj, { ...obj, objectID: 2, isPublicDomain: false }, { ...obj, objectID: 3, primaryImage: "" }]);
  assert.equal(normalize.met([obj]).length, 1);
  assert.equal(m.licence, "CC0");
  assert.equal(m.w, null);
  assert.equal(m.page, obj.objectURL);
});

test("keep: drops below minW, keeps unknown sizes, de-duplicates by URL", () => {
  const c = [
    { url: "a", w: 2000 },
    { url: "b", w: 800 },
    { url: "c", w: null },
    { url: "a", w: 2000 },
  ];
  assert.deepEqual(keep(c, { minW: 1200 }).map((x) => x.url), ["a", "c"]);
});

test("catalogEntry: a kit row with provenance; refuses anything not PD/CC0", () => {
  const [cand] = normalize.cleveland(fixture("cleveland"));
  const e = catalogEntry(cand, { id: "hurlbut", kind: "portrait", cut: "subject", tags: ["retrato"] });
  assert.deepEqual(e, {
    id: "hurlbut",
    kind: "portrait",
    url: cand.url,
    file: "hurlbut.jpg",
    cut: "subject",
    tags: ["retrato"],
    title: cand.title,
    author: cand.author,
    date: cand.date,
    source: cand.page,
    license: "CC0",
  });
  assert.throws(() => catalogEntry({ ...cand, licence: null }, { id: "x", kind: "page", cut: "paper" }), /licence/);
  assert.throws(() => catalogEntry(cand, { id: "Bad Id", kind: "page", cut: "paper" }), /id/);
});
