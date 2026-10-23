import { test } from "node:test";
import assert from "node:assert/strict";
import { catalogEntry, pageUrl, parseDownload } from "../reference/texturelabs.mjs";

const html = `<h1>Paper 348</h1>` + ["S", "M", "L", "XL"].map((s) =>
  `<span class="productDownloadLink" data-id="textures/Texturelabs_Paper_348${s}.jpg" data-product-id="4874232" data-size-field="${s.toLowerCase()}_dl"></span>`).join("");

test("pageUrl: slug or url", () => {
  assert.equal(pageUrl("Paper_348"), "https://texturelabs.org/textures/paper_348/");
  assert.equal(pageUrl("https://texturelabs.org/textures/paper_348"), "https://texturelabs.org/textures/paper_348/");
  assert.throws(() => pageUrl("a b"));
});

test("parseDownload: picks the size", () => {
  assert.deepEqual(parseDownload(html), { path: "textures/Texturelabs_Paper_348L.jpg", productId: "4874232", field: "l_dl" });
  assert.equal(parseDownload(html, "xl").field, "xl_dl");
  assert.throws(() => parseDownload("<p/>"));
  assert.throws(() => parseDownload(html, "XXL"));
});

test("catalogEntry: licence, source, resolve", () => {
  const e = catalogEntry(html, "https://texturelabs.org/textures/paper_348/", { id: "tl-papel-macro-1", tags: ["papel"] });
  assert.equal(e.license, "Texturelabs — free for commercial use");
  assert.equal(e.resolve, "texturelabs");
  assert.equal(e.file, "texture/tl-papel-macro-1.jpg");
  assert.equal(e.source, "https://texturelabs.org/textures/paper_348/");
  assert.equal(e.title, "Paper 348");
});
