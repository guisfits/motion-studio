import { test } from "node:test";
import assert from "node:assert/strict";
import { checkPicture } from "../core/checks/picture.mjs";
import { normsFor } from "../core/checks/norms.mjs";

const codes = (f) => f.map((x) => x.code).sort();
const manifest = {
  assets: [
    { id: "luther", licence: "PD", status: "ready" },
    { id: "town", licence: "PD", status: "ready" },
    { id: "pope", licence: "", status: "ready" },
    { id: "monk", licence: "PD", status: "placeholder" },
  ],
};
const sheet = {
  beats: [
    {
      id: "b1",
      t: [0, 2],
      hero: { asset: "luther" },
      key: [{ word: "Lutero", t: 1 }],
    },
  ],
};
// 2 s at 30 fps; items(t) is the trace of each frame.
const trace = (items) => ({
  W: 540,
  H: 960,
  fps: 30,
  frames: Array.from({ length: 60 }, (_, i) => ({
    t: i / 30,
    items: items(i / 30),
    camera: null,
  })),
});
const hero = (alpha = 1, id = "luther") => ({
  id,
  role: "hero",
  box: [90, 200, 360, 500],
  alpha,
});

test("a hero landed on its key word passes", () => {
  assert.deepEqual(
    checkPicture(
      trace(() => [hero()]),
      sheet,
      manifest,
    ),
    [],
  );
  // Landing exactly 3 frames early is inside the window.
  const early = trace((t) => (t >= 1 - 3 / 30 - 1e-9 ? [hero()] : []));
  assert.deepEqual(checkPicture(early, sheet, manifest), []);
});

test("a hero that lands after its key word is red H1", () => {
  const late = trace((t) => (t > 1 + 1e-9 ? [hero()] : []));
  const f = checkPicture(late, sheet, manifest);
  assert.deepEqual(codes(f), ["H1"]);
  assert.equal(f[0].t, 1);
  assert.equal(f[0].severity, "red");
});

test("a hero gone before the window is red H1", () => {
  const gone = trace((t) => (t < 1 - 4 / 30 ? [hero()] : []));
  assert.deepEqual(codes(checkPicture(gone, sheet, manifest)), ["H1"]);
});

test("a hero still fading in at its key word is red H1", () => {
  assert.deepEqual(
    codes(
      checkPicture(
        trace(() => [hero(0.8)]),
        sheet,
        manifest,
      ),
    ),
    ["H1"],
  );
});

test("a different asset in the hero slot is red H1", () => {
  assert.deepEqual(
    codes(
      checkPicture(
        trace(() => [hero(1, "town")]),
        sheet,
        manifest,
      ),
    ),
    ["H1"],
  );
});

test("a beat with no key word or no hero has no H1 to check", () => {
  const free = {
    beats: [
      { id: "b1", t: [0, 1], hero: { asset: "luther" }, key: [] },
      { id: "b2", t: [1, 2], key: [{ word: "x", t: 1.5 }] },
    ],
  };
  assert.deepEqual(
    checkPicture(
      trace(() => []),
      free,
      manifest,
    ),
    [],
  );
});

test("a placeholder, unlicensed or unknown picture on screen is red P1", () => {
  const f = checkPicture(
    trace(() => [
      hero(),
      { id: "monk", role: "support", box: [0, 0, 10, 10], alpha: 1 },
      { id: "pope", role: "piece", box: [0, 0, 10, 10], alpha: 1 },
      { id: "ghost", role: "piece", box: [0, 0, 10, 10] },
    ]),
    sheet,
    manifest,
  );
  assert.deepEqual(codes(f), ["P1", "P1", "P1"]);
  assert.ok(
    f.every((x) => /placeholder or unknown asset on screen/.test(x.msg)),
  );
});

test("captions, lettering and marks are not manifest assets", () => {
  const f = checkPicture(
    trace(() => [
      hero(),
      { id: "cap1", role: "caption", text: "x", box: [0, 0, 10, 10], alpha: 1 },
      {
        id: "let1",
        role: "lettering",
        text: "x",
        box: [0, 0, 10, 10],
        alpha: 1,
      },
      { id: "mark1", role: "mark", box: [0, 0, 10, 10], alpha: 1 },
    ]),
    sheet,
    manifest,
  );
  assert.deepEqual(f, []);
});

// T9 / T7: a 3 s film, one beat with a zoom target, the 9:16 safe box at 540x960.
const SAFE = [35, 110, 535 - 35 - 82.5, 960 - 110 - 200];
const zoomSheet = (kind = "push-in") => ({
  beats: [
    {
      id: "b1",
      t: [0, 3],
      hero: { asset: "luther" },
      key: [{ word: "Lutero", t: 1.5 }],
      zoom: { target: "luther.eyes", kind },
    },
  ],
});
const film = (items, camera = () => null, n = 90) => ({
  W: 540,
  H: 960,
  fps: 30,
  safe: SAFE,
  frames: Array.from({ length: n }, (_, i) => ({
    t: i / 30,
    items: items(i / 30),
    camera: camera(i / 30),
  })),
});
const target = (box) => ({ id: "b1-target", role: "target", box });
const push = (t) => ({ scale: 1 + 0.3 * Math.min(1, t / 1.5), x: 0, y: 0 });
const t9 = (f) => f.filter((x) => x.code === "T9");

test("T9: a zoom target inside the safe box from the key word to the beat's end passes", () => {
  const f = checkPicture(film(() => [hero(), target([200, 300, 80, 40])], push), zoomSheet(), manifest);
  assert.deepEqual(f, []);
});

test("T9: a target that leaves the safe box after the key word is red", () => {
  // At 2 s the push drifts the eyes under the platform UI (y > 760).
  const f = checkPicture(
    film((t) => [hero(), target(t < 2 ? [200, 300, 80, 40] : [200, 780, 80, 40])], push),
    zoomSheet(),
    manifest,
  );
  assert.equal(t9(f).length, 1, JSON.stringify(f));
  assert.equal(t9(f)[0].severity, "red");
  assert.ok(t9(f)[0].t >= 2 - 1e-9);
  // Out before the key word does not count: the move may still be travelling.
  const early = checkPicture(
    film((t) => [hero(), target(t < 1 ? [200, -300, 80, 40] : [200, 300, 80, 40])], push),
    zoomSheet(),
    manifest,
  );
  assert.deepEqual(t9(early), []);
});

test("T9: a beat with a zoom target that the film does not register at its key word is red", () => {
  const f = checkPicture(film(() => [hero()], push), zoomSheet(), manifest);
  assert.equal(t9(f).length, 1);
  assert.match(t9(f)[0].msg, /not registered/);
});

test("T9: without a safe box the frame itself is the limit", () => {
  const tr = film(() => [hero(), target([10, 300, 80, 40])], push);
  delete tr.safe;
  assert.deepEqual(t9(checkPicture(tr, zoomSheet(), manifest)), []);
  tr.frames.forEach((f) => (f.items[1] = target([500, 300, 80, 40])));
  assert.equal(t9(checkPicture(tr, zoomSheet(), manifest)).length, 1);
});

test("T7: an emphasis move under the scale delta on its own is orange; a drift is not judged", () => {
  const items = () => [hero(), target([200, 300, 80, 40])];
  const small = (t) => ({ scale: 1 + 0.06 * Math.min(1, t / 1.5), x: 0, y: 0 });
  const f = checkPicture(film(items, small), zoomSheet("push-in"), manifest);
  assert.deepEqual(codes(f), ["T7"]);
  assert.equal(f[0].severity, "orange");
  assert.match(f[0].msg, /b1/);
  assert.deepEqual(checkPicture(film(items, small), zoomSheet("drift"), manifest), []);
  assert.deepEqual(checkPicture(film(items, push), zoomSheet("pull-out"), manifest), []);
});

test("T7: a hard cut inside the beat is not a move", () => {
  const items = () => [hero(), target([200, 300, 80, 40])];
  // A cut from scale 1 to 1.4 at 1 s, then a 5 % push.
  const cut = (t) => ({ scale: t < 1 ? 1 : 1.4 * (1 + 0.05 * (t - 1)), x: 0, y: 0, shot: t < 1 ? 0 : 1 });
  assert.deepEqual(codes(checkPicture(film(items, cut), zoomSheet(), manifest)), ["T7"]);
});

test("T7: two punches (2x scale moves) are an accent, a third is orange", () => {
  const beats = [0, 1].map((i) => ({
    id: `b${i}`,
    t: [i, i + 1],
    hero: { asset: "luther" },
    key: [{ word: "Lutero", t: i }],
    zoom: { kind: "push-in" },
  }));
  // Each second: a push from 1 to 2.2.
  const punch = (t) => ({ scale: 1 + 1.2 * (t % 1), x: 0, y: 0, shot: Math.floor(t) });
  const f = checkPicture(film(() => [hero()], punch), { beats }, manifest);
  assert.deepEqual(codes(f), []);
  const three = [...beats, { ...beats[0], id: "b2", t: [2, 3], key: [{ word: "Lutero", t: 2 }] }];
  const g = checkPicture(film(() => [hero()], punch), { beats: three }, manifest);
  assert.deepEqual(codes(g), ["T7"]);
  assert.match(g[0].msg, /3 punches/);
});

test("house window: H1 and T7 read the story, not the outro", () => {
  // The hero is up only from 1.5 s, the key word is at 1.6 s: inside the window it would land.
  const s = { beats: [{ ...sheet.beats[0], t: [0, 1.5], key: [{ word: "Lutero", t: 1.6 }] }] };
  const late = trace((t) => (t >= 1.5 ? [hero()] : []));
  assert.deepEqual(codes(checkPicture(late, s, manifest)), []);
  assert.deepEqual(codes(checkPicture({ ...late, dur: 2, house: [1.5, 2] }, s, manifest)), ["H1"]);
  // A camera that moves only in the outro does not rescue the push-in's T7.
  const cam = trace(() => [hero()]);
  cam.frames.forEach((f) => (f.camera = { scale: f.t < 1.5 ? 1 : 1.5, x: 0, y: 0 }));
  const s2 = { beats: [{ ...sheet.beats[0], t: [0, 2], zoom: { kind: "push-in" } }] };
  assert.deepEqual(codes(checkPicture(cam, s2, manifest)), []);
  assert.deepEqual(codes(checkPicture({ ...cam, dur: 2, house: [1.5, 2] }, s2, manifest)), ["T7"]);
});

test("house window: P1 still reads the whole render (a placeholder in the outro is red)", () => {
  const tr = trace((t) => [hero(), ...(t >= 1.5 ? [{ ...hero(1, "monk") }] : [])]);
  assert.deepEqual(codes(checkPicture({ ...tr, dur: 2, house: [1.5, 2] }, { beats: [] }, manifest)), ["P1"]);
});

test("H1 and T9: a key word on a beat's first frame is read from the beat's first sampled frame", () => {
  // The beat opens on a hard cut at 1.01 s with its key word; the trace has no sample between the
  // cut and the key, and the frames before it belong to the previous scene.
  const cut = 1.01;
  const s = {
    beats: [
      {
        id: "b1",
        t: [cut, 2],
        hero: { asset: "luther" },
        key: [{ word: "Lutero", t: cut }],
        zoom: { target: "luther.eyes", kind: "push-in" },
      },
    ],
  };
  const items = (t) => (t >= cut ? [hero(), target([200, 300, 80, 40])] : []);
  assert.deepEqual(codes(checkPicture(film(items), s, manifest)), []);
  // The beat's own first frame still has to show it.
  const late = (t) => (t >= cut + 0.1 ? [hero(), target([200, 300, 80, 40])] : []);
  assert.deepEqual(codes(checkPicture(film(late), s, manifest)), ["H1", "T9"]);
});

// T7 in the instructive register: an emphasis move is a slow bell, not a fast push.
test("T7: a push faster than maxPushRatePerS is orange in the instructive register only", () => {
  const calm = normsFor("instructive");
  const items = () => [hero(), target([200, 300, 80, 40])];
  // 1 -> 1.3 in 1.5 s = 20 %/s of scale, then held.
  const fast = (t) => ({ scale: 1 + 0.3 * Math.min(1, t / 1.5), x: 0, y: 0 });
  assert.deepEqual(codes(checkPicture(film(items, fast), zoomSheet(), manifest)), []);
  const f = checkPicture(film(items, fast), zoomSheet(), manifest, calm);
  assert.deepEqual(codes(f), ["T7"]);
  assert.equal(f[0].severity, "orange");
  assert.match(f[0].msg, /%\/s/);
  // 1 -> 1.15 in 2 s = 7.5 %/s passes both.
  const bell = (t) => ({ scale: 1 + 0.15 * Math.min(1, t / 2), x: 0, y: 0 });
  assert.deepEqual(checkPicture(film(items, bell), zoomSheet(), manifest, calm), []);
});

test("T7: an emphasis move shorter than minMoveS is orange in the instructive register only", () => {
  const calm = normsFor("instructive");
  const items = () => [hero(), target([200, 300, 80, 40])];
  // 1 -> 1.2 in 0.5 s, then held: 40 %/s and 0.5 s.
  const snap = (t) => ({ scale: 1 + 0.2 * Math.min(1, t / 0.5), x: 0, y: 0 });
  assert.deepEqual(codes(checkPicture(film(items, snap), zoomSheet(), manifest)), []);
  const f = checkPicture(film(items, snap), zoomSheet(), manifest, calm);
  assert.deepEqual(codes(f), ["T7"]);
  assert.match(f[0].msg, /s \(/);
});

test("T7: one punch is allowed in the instructive register, a second is orange", () => {
  const calm = normsFor("instructive");
  const beats = [0, 1].map((i) => ({
    id: `b${i}`, t: [i, i + 1], hero: { asset: "luther" }, key: [{ word: "Lutero", t: i }],
  }));
  const punch = (t) => ({ scale: 1 + 1.2 * (t % 1), x: 0, y: 0, shot: Math.floor(t) });
  assert.deepEqual(codes(checkPicture(film(() => [hero()], punch, 60), { beats }, manifest)), []);
  const f = checkPicture(film(() => [hero()], punch, 60), { beats }, manifest, calm);
  assert.deepEqual(codes(f), ["T7"]);
  assert.match(f[0].msg, /2 punches/);
});
