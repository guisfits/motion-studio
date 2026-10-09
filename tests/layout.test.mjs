import { test } from "node:test";
import assert from "node:assert/strict";
import { layout, FORMATS } from "../core/lib/layout.js";

test("every format has its pixel size", () => {
  assert.deepEqual([layout("9x16").W, layout("9x16").H], [1080, 1920]);
  assert.deepEqual([layout("1x1").W, layout("1x1").H], [1080, 1080]);
  assert.deepEqual([layout("16x9").W, layout("16x9").H], [1920, 1080]);
  assert.deepEqual(Object.keys(FORMATS).sort(), ["16x9", "1x1", "9x16"]);
});

test("unknown format is an error, not a silent default", () => {
  assert.throws(() => layout("4x5"), /unknown format/);
});

test("9x16 keeps the Reels UI band and right rail clear", () => {
  const { safe, H, W } = layout("9x16");
  assert.ok(safe.bottom >= H * 0.2);
  assert.ok(safe.right >= 120);
  const box = layout("9x16").box;
  assert.equal(box.x, safe.left);
  assert.equal(box.y + box.h, H - safe.bottom);
  assert.equal(box.x + box.w, W - safe.right);
});
