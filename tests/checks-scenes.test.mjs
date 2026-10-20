import { test } from "node:test";
import assert from "node:assert/strict";
import { checkOnePersonPicture } from "../core/checks/scenes.mjs";

const beat = (id, hero, extra = {}) => ({ id, t: [0, 1], hero: { asset: hero }, ...extra });
// A portrait unless a test says otherwise.
const asset = (id, kind = "hero", extra = {}) => ({ id, kind, subject: `${id} (portrait)`, ...extra });
const scenes = (...rows) => rows.map((r, i) => ({ n: i + 1, rows: r }));

test("S10: a portrait in two scenes is red and names the asset and the scenes", () => {
  const sheet = { beats: [beat("b1", "luther"), beat("b2", "erasmus"), beat("b3", "luther")] };
  const out = checkOnePersonPicture(sheet, { assets: [asset("luther"), asset("erasmus")] }, scenes(["b1"], ["b2"], ["b3"]));
  assert.equal(out.length, 1);
  assert.equal(out[0].severity, "red");
  assert.equal(out[0].code, "S10");
  assert.match(out[0].msg, /luther/);
  assert.match(out[0].msg, /1, 3/);
});

test("S10: the same picture in two beats of one scene is fine", () => {
  const sheet = { beats: [beat("b1", "luther"), beat("b2", "luther")] };
  assert.deepEqual(checkOnePersonPicture(sheet, { assets: [asset("luther")] }, scenes(["b1", "b2"])), []);
});

test("S10: support and rig assets count too", () => {
  const sheet = {
    beats: [
      beat("b1", "a", { support: ["clip"] }),
      beat("b2", "b", { support: [{ asset: "clip" }], rig: { asset: "rig-x" } }),
      beat("b3", "c", { rig: { asset: "rig-x" } }),
    ],
  };
  const manifest = { assets: [asset("a"), asset("b"), asset("c"), asset("clip", "piece", { people: true }), asset("rig-x", "rig")] };
  const out = checkOnePersonPicture(sheet, manifest, scenes(["b1"], ["b2"], ["b3"]));
  assert.deepEqual(out.map((f) => f.msg.match(/rig-x|clip/)[0]).sort(), ["clip", "rig-x"]);
});

test("S10: a scene that continues another is that scene (same shot, no cut)", () => {
  const sheet = { beats: [beat("b1", "luther"), beat("b2", "luther")] };
  const sc = [{ n: 1, rows: ["b1"] }, { n: 2, rows: ["b2"], continues: 1 }];
  assert.deepEqual(checkOnePersonPicture(sheet, { assets: [asset("luther")] }, sc), []);
});

test("S10: a chain of continues resolves to the first scene", () => {
  const sheet = { beats: [beat("b1", "luther"), beat("b2", "luther"), beat("b3", "luther")] };
  const sc = [{ n: 1, rows: ["b1"] }, { n: 2, rows: ["b2"], continues: 1 }, { n: 3, rows: ["b3"], continues: 2 }];
  assert.deepEqual(checkOnePersonPicture(sheet, { assets: [asset("luther")] }, sc), []);
});

test("S10: manifest boardScenes count beside the sheet beats", () => {
  const sheet = { beats: [beat("b1", "luther")] };
  const manifest = { assets: [asset("luther", "hero", { boardScenes: [1, 4] })] };
  const out = checkOnePersonPicture(sheet, manifest, scenes(["b1"], [], [], []));
  assert.equal(out.length, 1);
  assert.match(out[0].msg, /1, 4/);
});

test("S10: boardScenes through a continues scene fold into the scene it continues", () => {
  const manifest = { assets: [asset("luther", "hero", { boardScenes: [1, 2] })] };
  const sc = [{ n: 1, rows: [] }, { n: 2, rows: [], continues: 1 }];
  assert.deepEqual(checkOnePersonPicture({ beats: [] }, manifest, sc), []);
});

test("S10: documents, pages, clippings, maps, objects, textures and footage may recur", () => {
  const reused = (id, kind, subject) => ({ id, kind, subject, boardScenes: [1, 2] });
  const manifest = {
    assets: [
      reused("grain", "texture", "grain (texture)"),
      reused("take", "footage", "app take"),
      reused("tape", "piece", "tape as drawn (accessory)"),
      reused("scissors", "piece", "scissors as drawn (object)"),
      reused("thesis", "piece", "the 95 theses (clipping)"),
      reused("bible", "hero", "Vulgate Mt 4:17 (page)"),
      reused("atlas", "hero", "map of Germany (page)"),
      reused("card", "hero", "bare paper card, set in code (lib-head .card)"),
    ],
  };
  assert.deepEqual(checkOnePersonPicture({ beats: [] }, manifest, scenes([], [])), []);
});

test("S10: a painting or print of a person recurs as red; `people` overrides the tag", () => {
  const reused = (id, subject, extra) => ({ id, kind: "hero", subject, boardScenes: [1, 2], ...extra });
  const manifest = {
    assets: [
      reused("prodigal", "Rembrandt (painting)"),
      reused("penitent", "Durer woodcut (print)"),
      reused("odd-page", "a page with a saint (page)", { people: true }),
      reused("landscape", "Alps (painting)", { people: false }),
    ],
  };
  const out = checkOnePersonPicture({ beats: [] }, manifest, scenes([], []));
  assert.deepEqual(out.map((f) => f.msg.match(/prodigal|penitent|odd-page|landscape/)[0]), ["prodigal", "penitent", "odd-page"]);
});

test("S10: a sheet id and its board clip alias are one picture", () => {
  const manifest = {
    assets: [
      asset("clip-a", "piece", { boardScenes: [1], people: true }),
      asset("clip-a-sheet", "piece", { boardScenes: [2], alias_of: "clip-a" }),
    ],
  };
  const out = checkOnePersonPicture({ beats: [] }, manifest, scenes([], []));
  assert.equal(out.length, 1);
  assert.match(out[0].msg, /clip-a/);
  assert.match(out[0].msg, /clip-a-sheet/);
});

test("S10: a rig and the picture it is cut from are one picture", () => {
  const manifest = {
    assets: [
      asset("portrait", "hero", { boardScenes: [1] }),
      asset("rig-portrait", "rig", { boardScenes: [2], subject: "articulated rig cut from portrait (spec.json)" }),
    ],
  };
  assert.equal(checkOnePersonPicture({ beats: [] }, manifest, scenes([], [])).length, 1);
});

test("S10: no scene list, no check", () => {
  const sheet = { beats: [beat("b1", "luther"), beat("b2", "luther")] };
  assert.deepEqual(checkOnePersonPicture(sheet, { assets: [asset("luther", "hero", { boardScenes: [1, 2] })] }, null), []);
});

test("S10: an asset outside the manifest or a beat outside every scene is ignored", () => {
  const sheet = { beats: [beat("b1", "ghost"), beat("b9", "luther")] };
  assert.deepEqual(checkOnePersonPicture(sheet, { assets: [asset("luther")] }, scenes(["b1"])), []);
});
