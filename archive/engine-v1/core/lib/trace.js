// What the film draws, in frame pixels, so gates can measure meaning (captions, lettering, hero)
// without reading pixels. A film registers each thing once; the gate samples window.trace(t).
export function makeTrace() {
  const reg = [];
  return {
    add(id, role, fn) {
      reg.push({ id, role, fn });
    },
    install() {
      window.trace = (t) =>
        reg.flatMap(({ id, role, fn }) => {
          const v = fn(t);
          return v ? [{ id, role, alpha: 1, ...v }] : [];
        });
    },
  };
}
