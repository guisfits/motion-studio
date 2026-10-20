import { test } from "node:test";
import assert from "node:assert/strict";
import { editEvents, checkRhythm } from "../core/checks/rhythm.mjs";
import { normsFor } from "../core/checks/norms.mjs";

const W = 540,
  H = 960,
  FPS = 30;
const codes = (f) => [...new Set(f.map((x) => x.code))].sort();
const hero = (id) => ({ id, role: "hero", box: [90, 200, 360, 500], alpha: 1 });
const cap = (id) => ({
  id,
  role: "caption",
  text: "x",
  box: [100, 800, 300, 40],
  alpha: 1,
});
// The index of the last change at or before t: a step function over sorted change times.
const step = (times, t) => times.filter((c) => c <= t + 1e-9).length;

// A dur-second film at 30 fps whose hero changes at `heroes`, caption chunk at `captions` and
// camera shot at `cuts`; `camera(t)` overrides the camera (a drifting push by default).
function film(
  dur,
  { heroes = [], captions = [], cuts = [], camera } = {},
) {
  const n = Math.round(dur * FPS);
  return {
    W,
    H,
    fps: FPS,
    dur,
    frames: Array.from({ length: n }, (_, i) => {
      const t = i / FPS;
      return {
        t,
        items: [
          hero(`h${step(heroes, t)}`),
          ...(captions.length && t >= captions[0] ? [cap(`c${step(captions, t)}`)] : []),
        ],
        camera: camera
          ? camera(t)
          : { scale: 1 + 0.05 * t, x: 0, y: 0, shot: step(cuts, t) },
      };
    }),
  };
}
const every = (from, to, gap) => {
  const out = [];
  for (let t = from; t < to - 1e-9; t += gap) out.push(Math.round(t * FPS) / FPS);
  return out;
};
// Narration of `n` words spread over [0, dur].
const words = (n, dur) => ({
  words: Array.from({ length: n }, (_, i) => ({
    w: "w",
    start: (i * dur) / n,
    end: ((i + 0.8) * dur) / n,
  })),
});

test("an edit event is a hero change, a caption chunk change or a cut", () => {
  const tr = film(6, { heroes: [1], captions: [2, 3], cuts: [4.5] });
  assert.deepEqual(editEvents(tr), [1, 2, 3, 4.5]);
});

test("the first hero at frame 0 is not an event, a caption leaving is not one", () => {
  assert.deepEqual(editEvents(film(4)), []);
  // A caption on for 1–2 s only: its arrival is an event, its departure is not.
  const t2 = film(4, { captions: [1] });
  t2.frames.forEach((f) => {
    if (f.t >= 2) f.items = f.items.filter((it) => it.role !== "caption");
  });
  assert.deepEqual(editEvents(t2), [1]);
});

test("a picture and its caption landing within 0.1 s are one event", () => {
  const tr = film(4, { heroes: [1], captions: [1 + 2 / FPS] });
  assert.deepEqual(editEvents(tr), [1]);
});

test("a hero fading in is not a picture change until it is legible", () => {
  const tr = film(4, { heroes: [2] });
  tr.frames.forEach((f) => {
    if (f.t >= 2 && f.t < 2.5) f.items[0] = { ...f.items[0], alpha: 0.5 };
  });
  assert.deepEqual(editEvents(tr), [2.5]);
});

// A 40 s film with an event every 1.2 s and 3.5 words per event is on register.
const onRegister = () => {
  const dur = 40;
  const body = every(1.2, 35, 1.2);
  const end = every(35.5, 40, 2.4);
  return { tr: film(dur, { captions: [...body, ...end] }), w: words(Math.round(3.5 * (body.length + end.length)), dur) };
};

test("a film cut at register A's rhythm passes every rhythm gate", () => {
  const { tr, w } = onRegister();
  assert.deepEqual(checkRhythm(tr, w, { stage: "animatic" }), []);
  assert.deepEqual(checkRhythm(tr, w, { stage: "draft" }), []);
});

test("a calm film (an event every 2.5 s, 5 words each) passes the instructive register and fails A", () => {
  const dur = 90;
  const body = every(2.5, 85, 2.5);
  const tr = film(dur, { captions: [...body, 87] });
  const w = words(5 * (body.length + 1), dur);
  const calm = normsFor("instructive");
  assert.deepEqual(checkRhythm(tr, w, { stage: "draft", norms: calm }), []);
  assert.deepEqual(checkRhythm(tr, w, { stage: "animatic", norms: calm }), []);
  const a = checkRhythm(tr, w, { stage: "animatic" });
  assert.deepEqual(codes(a), ["R1", "R2"]);
});

test("R1: the instructive register allows a 5 s hold that register A flags", () => {
  const caps = [...every(2, 30, 2.5), 35, ...every(37.5, 60, 2.5)];
  const still = film(60, { captions: caps, camera: () => ({ scale: 1, x: 0, y: 0 }) });
  const w = words(5 * caps.length, 60);
  const holds = (norms) =>
    checkRhythm(still, w, { stage: "draft", norms }).filter((x) => x.code === "R1" && x.severity === "orange");
  assert.equal(holds(undefined).length, 1);
  assert.equal(holds(normsFor("instructive")).length, 0);
});

test("R1: average event length outside the range is red", () => {
  const slow = film(40, { captions: every(1, 40, 3) });
  const f = checkRhythm(slow, words(40, 40), { stage: "draft" }).filter((x) => x.code === "R1");
  assert.equal(f[0]?.severity, "red", JSON.stringify(f));
  const fast = film(40, { captions: every(0.5, 40, 0.5) });
  assert.ok(
    checkRhythm(fast, words(240, 40), { stage: "draft" }).some(
      (x) => x.code === "R1" && x.severity === "red",
    ),
  );
});

test("R1: a hold of 4 s or more with a still camera is orange; a moving camera earns it", () => {
  const caps = [...every(1, 20, 1.2), 25, ...every(25.6, 40, 1.2)];
  const still = film(40, {
    captions: caps,
    camera: () => ({ scale: 1, x: 0, y: 0 }),
  });
  const f = checkRhythm(still, words(120, 40), { stage: "draft" });
  assert.ok(
    f.some((x) => x.code === "R1" && x.severity === "orange" && x.t >= 18.9 && x.t < 21),
    JSON.stringify(f),
  );
  const moving = film(40, { captions: caps });
  assert.ok(
    !checkRhythm(moving, words(120, 40), { stage: "draft" }).some(
      (x) => x.code === "R1" && x.severity === "orange",
    ),
  );
});

test("R2: a 10 s window with too few events is orange; the last 5 s are exempt", () => {
  // Body at 1.2 s, except a sparse stretch 10–22 s with one event every 3 s.
  const caps = [...every(1, 10, 1.2), ...every(10, 22, 3), ...every(22, 35, 1.2), 37];
  const f = checkRhythm(film(40, { captions: caps }), words(110, 40), { stage: "draft" });
  assert.ok(f.some((x) => x.code === "R2"), JSON.stringify(f));
  const { tr, w } = onRegister();
  assert.ok(!checkRhythm(tr, w, { stage: "draft" }).some((x) => x.code === "R2"));
  // A slow ending (one event in the last 7 s) is R4's business, not a sparse R2 window.
  const slowEnd = film(40, { captions: [...every(1.2, 33, 1.2), 38] });
  assert.ok(
    !checkRhythm(slowEnd, words(100, 40), { stage: "draft" }).some((x) => x.code === "R2"),
  );
});

test("R2: a 10 s window with too many events is orange", () => {
  const caps = [...every(1, 10, 1.2), ...every(10, 20, 0.5), ...every(20, 35, 1.2), 37];
  const f = checkRhythm(film(40, { captions: caps }), words(130, 40), { stage: "draft" });
  assert.ok(f.some((x) => x.code === "R2" && /too many|> /.test(x.msg)), JSON.stringify(f));
});

test("R3: too many spoken words per event is orange at the animatic", () => {
  const { tr } = onRegister();
  const f = checkRhythm(tr, words(400, 40), { stage: "animatic" });
  assert.deepEqual(codes(f), ["R3"]);
  // R3 is the animatic's; R4 the draft's.
  assert.ok(!checkRhythm(tr, words(400, 40), { stage: "draft" }).some((x) => x.code === "R3"));
});

test("R4: an ending that does not slow down is orange at the draft", () => {
  const caps = every(1.2, 40, 1.2);
  const tr = film(40, { captions: caps });
  const w = words(Math.round(3.5 * caps.length), 40);
  assert.deepEqual(codes(checkRhythm(tr, w, { stage: "draft" })), ["R4"]);
  assert.ok(!checkRhythm(tr, w, { stage: "animatic" }).some((x) => x.code === "R4"));
});

// A film that ends on the house outro declares it (trace.house = [t0, t1]); the outro is not an
// edit, not a still hold, and not the story's ending. Frames from t0 on carry no items.
const withHouse = (tr, t0, dur) => ({
  ...tr,
  dur,
  house: [t0, dur],
  frames: [
    ...tr.frames.filter((f) => f.t < t0),
    ...Array.from({ length: Math.round((dur - t0) * FPS) }, (_, i) => ({
      t: t0 + i / FPS,
      items: [],
      // The outro holds the camera where the story left it.
      camera: { ...tr.frames.at(-1).camera },
    })),
  ],
});

test("house window: R1 and R4 read the story, so an 8 s outro is no still hold or ending", () => {
  const caps = [...every(1.2, 35, 1.2), ...every(35.5, 40, 2.4)];
  const w = words(Math.round(3.5 * caps.length), 40);
  const tr = film(40, { captions: caps, camera: () => ({ scale: 1, x: 0, y: 0 }) });
  const outro = withHouse(tr, 40, 48);
  const bare = { ...outro, house: undefined };
  // Without the declaration the outro is an 8 s still hold.
  assert.ok(
    checkRhythm(bare, w, { stage: "draft" }).some((x) => x.code === "R1" && x.severity === "orange"),
  );
  for (const stage of ["animatic", "draft"]) assert.deepEqual(checkRhythm(outro, w, { stage }), [], stage);
});

test("house window: R4 measures the last 5 s before it, not the outro", () => {
  const caps = every(1.2, 40, 1.2); // the story never slows down
  const w = words(Math.round(3.5 * caps.length), 40);
  const outro = withHouse(film(40, { captions: caps }), 40, 48);
  const bare = { ...outro, house: undefined };
  // An empty outro window fakes a slow ending when nothing is declared.
  assert.ok(!checkRhythm(bare, w, { stage: "draft" }).some((x) => x.code === "R4"));
  assert.deepEqual(codes(checkRhythm(outro, w, { stage: "draft" })), ["R4"]);
  assert.equal(checkRhythm(outro, w, { stage: "draft" })[0].t, 35);
});

test("house window: R3 counts the words spoken before it", () => {
  const { tr } = onRegister();
  const outro = withHouse(tr, 40, 48);
  assert.deepEqual(checkRhythm(outro, words(400, 40), { stage: "animatic" }).map((x) => x.code), ["R3"]);
  // A word after the story (spoken over the outro) is not the story's.
  const late = { words: [...words(140, 40).words, { w: "w", start: 44, end: 45 }] };
  assert.deepEqual(checkRhythm(outro, late, { stage: "animatic" }), []);
});

// H-3 (second film): an instructive scene builds on one hero, piece by piece; register A counts
// only hero, caption and shot changes, so every instructive film read as one long hold (R1 red).
test("the instructive register counts a piece arriving in the scene as an event; register A does not", () => {
  const tr = film(6, { heroes: [1] });
  const piece = (id, from) => (f) => {
    if (f.t >= from) f.items.push({ id, role: "piece", box: [100, 100, 80, 80], alpha: f.t >= from + 0.1 ? 1 : 0.5 });
  };
  tr.frames.forEach(piece("pin", 3));
  tr.frames.forEach(piece("tape", 4));
  // A support arriving is one too; a ground is not, nor a piece already there at frame 0.
  tr.frames.forEach((f) => f.t >= 5 && f.items.push({ id: "page", role: "support", box: [0, 0, 200, 200] }));
  tr.frames.forEach((f) => f.items.push({ id: "desk", role: "ground", box: [0, 0, W, H] }));
  tr.frames.forEach((f) => f.items.push({ id: "old", role: "piece", box: [0, 0, 50, 50] }));
  assert.deepEqual(editEvents(tr), [1]);
  const n = normsFor("instructive");
  assert.deepEqual(n.rhythm.events, ["hero", "caption", "shot", "arrival"]);
  assert.deepEqual(editEvents(tr, { events: n.rhythm.events }), [1, 3 + 3 / FPS, 4 + 3 / FPS, 5]);
  // A manifest ground registered as a piece is no arrival either.
  tr.frames.forEach((f) => f.t >= 5.5 && f.items.push({ id: "paper", role: "piece", box: [0, 0, W, H] }));
  const grounds = new Set(["paper"]);
  assert.deepEqual(editEvents(tr, { events: n.rhythm.events, grounds }), [1, 3 + 3 / FPS, 4 + 3 / FPS, 5]);
});

test("checkRhythm reads the register's events: a scene built piece by piece passes instructive R1", () => {
  // One hero for 30 s and a piece landing every 2.5 s.
  const tr = film(30);
  every(2.5, 28, 2.5).forEach((t0, k) =>
    tr.frames.forEach((f) => f.t >= t0 && f.items.push({ id: `p${k}`, role: "piece", box: [100, 100, 80, 80] })),
  );
  const w = words(5 * 11, 30);
  const calm = normsFor("instructive");
  assert.ok(!codes(checkRhythm(tr, w, { stage: "animatic", norms: calm })).includes("R1"));
  assert.ok(codes(checkRhythm(tr, w, { stage: "animatic" })).includes("R1"));
});
