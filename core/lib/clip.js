// A screen recording played frame-exactly (made by reference/clip.mjs). clip.at(s) shows the
// frame at s seconds of the recording; the renderer waits for that frame's decode before it
// captures, so a clip renders the same pictures in any order.
//
//   const rec = makeClip(stage, "assets/rec-lexicon");      // or phone.js: screens: [rec]
//   // in draw(t): rec.at(t - T.lexIn);                      // clamps to the first/last frame

export function makeClip(stage, dir) {
  const el = new Image();
  Object.assign(el.style, { position: "absolute", left: "0", top: "0", display: "block" });
  let meta = null;
  let shown = "";
  stage.pending.push(
    fetch(`${dir}/clip.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`clip missing: ${dir}/clip.json (run reference/clip.mjs)`);
        return r.json();
      })
      .then((m) => {
        meta = m;
        return show(0);
      }),
  );

  function show(s) {
    const i = Math.min(meta.count - 1, Math.max(0, Math.floor(s * meta.fps + 1e-6)));
    const src = `${dir}/${String(i + 1).padStart(5, "0")}.jpg`;
    if (src === shown) return Promise.resolve();
    shown = src;
    el.src = src;
    return el.decode().catch(() => {});
  }

  return {
    el,
    get meta() {
      return meta;
    },
    get dur() {
      return meta.count / meta.fps;
    },
    at(s) {
      stage.waitFor(show(s));
    },
  };
}
