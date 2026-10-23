// DOM text helpers for films. Elements are built once, outside draw(t); draw only sets styles.

// An absolutely positioned div in parent (no wrapping unless css says so).
export function el(parent, css = {}, text) {
  const e = document.createElement("div");
  Object.assign(
    e.style,
    { position: "absolute", left: "0", top: "0", whiteSpace: "nowrap" },
    css,
  );
  if (text !== undefined) e.textContent = text;
  parent.append(e);
  return e;
}

// A line whose words rise out of a mask; "|" in words breaks the line.
// Returns { line, inners, words } — inners[i] is the span to move for words[i].
export function maskedLine(parent, words, css, wordCss = () => ({})) {
  const line = el(parent, css);
  const real = words.filter((w) => w !== "|");
  const inners = [];
  words.forEach((w, i) => {
    if (w === "|") {
      line.append(document.createElement("br"));
      return;
    }
    const clip = document.createElement("span");
    Object.assign(clip.style, {
      display: "inline-block",
      overflow: "hidden",
      verticalAlign: "bottom",
      paddingBottom: "0.18em",
      marginBottom: "-0.18em",
    });
    const inner = document.createElement("span");
    Object.assign(inner.style, { display: "inline-block" }, wordCss(w));
    inner.textContent = w;
    clip.append(inner);
    line.append(clip);
    if (i < words.length - 1 && words[i + 1] !== "|")
      line.append(document.createTextNode(" "));
    inners.push(inner);
  });
  return { line, inners, words: real };
}

// Words in from tIn (staggered), out by rising away from tOut. spring(t, t0) → 0..1.
export function lineIn(lineObj, t, { tIn, tOut, stagger = 0.08, enter, exit }) {
  lineObj.inners.forEach((w, i) => {
    const pin = enter(t, tIn + i * stagger);
    const pout = tOut === undefined ? 0 : exit(t, tOut + i * 0.04);
    w.style.transform = `translateY(${(1 - pin) * 110 - pout * 110}%)`;
  });
}

// An odometer: each digit is a column of 0–9 that rolls continuously with the value, so a year
// changing from 2026 to 354 visibly spins back through time. Leading zeros fade out.
export function makeCounter(parent, { digits = 4, css = {} } = {}) {
  const box = el(parent, { display: "flex", ...css });
  const cols = Array.from({ length: digits }, () => {
    const win = document.createElement("div");
    Object.assign(win.style, {
      overflow: "hidden",
      height: "1.15em",
      lineHeight: "1.15em",
    });
    const strip = document.createElement("div");
    // 0..9 then 0 again, so 9 → 0 rolls forward instead of jumping back.
    strip.innerHTML = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
      .map((d) => `<div>${d}</div>`)
      .join("");
    win.append(strip);
    box.append(win);
    return { win, strip };
  });
  return {
    el: box,
    set(value) {
      const v = Math.max(0, value);
      cols.forEach((c, i) => {
        const place = 10 ** (digits - 1 - i);
        // Units roll continuously; a higher column turns only while the column below it rolls
        // from 9 to 0 (the carry), like a mechanical odometer, so a resting value reads exactly.
        const carry = place === 1 ? 0 : Math.min(1, Math.max(0, (v % place) - (place - 1)));
        const pos = place === 1 ? v % 10 : (Math.floor(v / place) % 10) + carry;
        c.strip.style.transform = `translateY(${-pos * 1.15}em)`;
        // A leading column shows (and takes width) only once the value reaches its place.
        const shown = Math.min(1, Math.max(0, place === 1 ? 1 : (v - place * 0.95) / (place * 0.05)));
        c.win.style.opacity = String(shown);
        c.win.style.width = `${shown * 0.6}em`; // JetBrains Mono advance is 0.6em
      });
    },
  };
}
