// The board page: one self-contained HTML fragment (no doctype/html/head/body; the host wraps
// it) that starts with its <title>. The page is a stack, top to bottom: the film's title, AGORA
// (what the client must do now, with the decision buttons), CENAS (the film's scenes in film
// order) and the feed, newest update first and the first steps last. Layout CSS lives here; colour and type are tokens from theme.css (or
// a project's --theme file).

import { esc, inline } from "./md.mjs";
import { approvalKey } from "./tracker.mjs";
import { nowOf } from "./updates.mjs";
import { TOO_BIG } from "./publish.mjs";

const TORN_BOTTOM = tornPolygon("bottom");

// A fixed jagged edge (deterministic, so rebuilds do not churn the page).
function tornPolygon(side) {
  const depth = [3, 7, 2, 6, 4, 8, 3, 5, 2, 7, 4, 6, 3, 8, 2, 5, 6, 3, 7, 4, 2, 6, 5, 3, 7];
  const n = depth.length - 1;
  const pts = depth.map((d, i) => {
    const x = `${((i / n) * 100).toFixed(2)}%`;
    return side === "bottom" ? `${x} calc(100% - ${d}px)` : `${x} ${d}px`;
  });
  return side === "bottom"
    ? `polygon(0 0, 100% 0, ${pts.reverse().join(", ")})`
    : `polygon(${pts.join(", ")}, 100% 100%, 0 100%)`;
}

// The families of the board; Permanent Marker only for the AGORA stamp.
const FONTS =
  "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800&family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Permanent+Marker&display=swap";

const CSS = `
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--desk);color:var(--ink);font-family:var(--font-body);font-size:17px;line-height:1.5;-webkit-text-size-adjust:100%}
.desk{max-width:760px;margin:0 auto;padding:28px 16px 64px;overflow-x:clip}
.skip{position:absolute;left:16px;top:-60px;background:var(--sticker);color:var(--ink);padding:8px 12px;z-index:10;font-family:var(--font-mono);font-size:14px}
.skip:focus{top:12px}
a{color:var(--ink);text-decoration-thickness:1px;text-underline-offset:2px}
a:focus-visible,button:focus-visible,video:focus-visible,audio:focus-visible,[tabindex]:focus-visible{outline:3px solid var(--focus);outline-offset:3px;border-radius:2px}
[hidden]{display:none!important}
img,video{max-width:100%;height:auto;display:block}
h1,h2,h3{font-family:var(--font-display);font-weight:800;line-height:1.02;letter-spacing:.01em;text-transform:uppercase;margin:0 0 12px;overflow-wrap:anywhere}
h1{font-size:clamp(40px,9vw,72px);margin:0}
h2{font-size:clamp(28px,5vw,40px)}
h3{font-size:24px;font-weight:600;margin:0 0 6px}
p{margin:0 0 10px}
.kicker{font-family:var(--font-mono);font-size:13px;font-weight:400;color:var(--ink-3);letter-spacing:.04em;text-transform:uppercase;margin:0 0 6px}
.quiet{color:var(--ink-3);font-style:italic}
.num,time,code{font-family:var(--font-mono);font-variant-numeric:tabular-nums;font-size:.86em}
code{background:var(--paper-2);padding:0 3px}
.small{font-size:14px;color:var(--ink-2)}
.sheet{position:relative;margin:0 0 30px;filter:drop-shadow(0 2px 1px var(--contact)) drop-shadow(0 10px 14px var(--shadow))}
.sheet>.paper{background:var(--paper);color:var(--ink);padding:24px 22px 34px;clip-path:${TORN_BOTTOM}}
.sheet::before{content:"";position:absolute;z-index:2;top:-11px;left:28px;width:96px;height:26px;background:var(--tape);border:1px solid var(--tape-edge);transform:rotate(-5deg)}
.sheet-head{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:8px}
.sheet-head h2{margin-right:auto}
.stamp{display:inline-block;font-family:var(--font-hand);font-weight:400;text-transform:none;color:var(--marker);border:3px solid var(--marker);padding:2px 12px 0;border-radius:4px;transform:rotate(-2deg);font-size:clamp(26px,5vw,34px);letter-spacing:.01em}
.ask{font-family:var(--font-display);font-weight:600;font-size:clamp(24px,5vw,32px);line-height:1.1;margin:4px 0 14px}
.need{border-left:4px solid var(--marker);padding:4px 0 4px 14px;margin-top:14px}
.need h3{font-size:20px}
button{font:inherit;font-family:var(--font-mono);font-size:13px;background:var(--ink);color:var(--paper);border:0;padding:7px 12px;cursor:pointer;border-radius:2px}
button:not(:disabled):hover{opacity:.85}
button:disabled{opacity:.45;cursor:not-allowed}
button.alt{background:var(--sticker);color:var(--ink);border:1px solid var(--ink)}
button.bad{background:var(--marker);color:var(--on-marker)}
.cmt{background:transparent;color:var(--ink-2);border:1px solid var(--rule);font-size:12px;padding:4px 8px;margin-left:auto}
.lbl{display:block;font-family:var(--font-mono);font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-3);margin:12px 0 4px}
textarea{display:block;width:100%;font:inherit;font-size:16px;background:var(--sticker);color:var(--ink);border:1px solid var(--ink-3);border-radius:2px;padding:8px 10px;resize:vertical;min-height:4.5em}
textarea:disabled{opacity:.6}
.ap-decision{font-size:16px;margin:12px 0 4px}
.ap-comment{display:block;font-style:italic;margin-top:4px}
.ap-buttons{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 4px}
.ap-msg{min-height:1.3em;margin:6px 0 0}
.media{display:grid;gap:12px;margin:12px 0 4px}
.media figure{margin:0}
.media img,.media video{width:auto;max-width:100%;max-height:80vh;margin:0 auto;background:var(--sticker);box-shadow:0 1px 1px var(--contact),0 5px 9px var(--shadow)}
.media audio{width:100%}
.feed,.scenes{margin-top:40px}
.feed>.kicker,.scenes>.kicker{color:var(--desk-ink);margin:0 0 14px}
.cenas{list-style:none;margin:0;padding:0;display:grid;gap:14px}
.scene{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;background:var(--paper);color:var(--ink);padding:14px 16px 16px;box-shadow:0 1px 1px var(--contact),0 6px 12px var(--shadow)}
@media (min-width:560px){.scene{grid-template-columns:200px minmax(0,1fr);gap:18px}}
.scene .pic{margin:0}
.scene .pic img{width:100%;max-height:none;background:var(--sticker);box-shadow:0 1px 1px var(--contact),0 3px 6px var(--shadow)}
.scene .blank{display:grid;place-items:center;aspect-ratio:1/1;border:2px dashed var(--rule);background:var(--paper-2);font-family:var(--font-hand);color:var(--ink-3);font-size:20px}
.scene .no{font-family:var(--font-mono);font-size:13px;color:var(--ink-3);letter-spacing:.04em}
.scene h3{margin-top:2px}
.scene .says{font-style:italic;margin:6px 0 10px;max-width:56ch}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip--ok::before{content:"\\2713";font-weight:600;margin-right:5px}
.chip--muted{color:var(--ink-3)}
.post{background:var(--paper);color:var(--ink);padding:16px 20px 20px;margin:0 0 18px;box-shadow:0 1px 1px var(--contact),0 6px 12px var(--shadow)}
.post-head{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin-bottom:6px}
.post-head time{color:var(--ink-3)}
.post .note{margin:0 0 4px;max-width:62ch}
.chip{display:inline-block;font-family:var(--font-mono);font-size:12px;line-height:1.3;padding:2px 7px;background:var(--sticker);color:var(--ink);border:1px solid var(--rule);white-space:nowrap}
.chip--bad{background:var(--marker);color:var(--on-marker);border-color:var(--marker)}
.foot{color:var(--desk-ink);font-family:var(--font-mono);font-size:12px;text-align:center;margin-top:8px}
`;

// ISO time → "YYYY-MM-DD HH:MM" (date only when the source had no time).
export const stamp = (iso) =>
  String(iso ?? "").replace("T", " ").replace(/:\d\d(\.\d+)?(Z|[+-]\d\d:?\d\d)?$/, "").slice(0, 16);

// The page's "Comment" label, set once per build (pageHtml).
let COMMENT = "Comment";
const commentBtn = () => `<button type="button" class="cmt" data-comment hidden>${esc(COMMENT)}</button>`;

// A card's pictures, videos and audio. A file that did not make it shows a quiet line instead.
function mediaOf(card, L) {
  const figs = card.files.map((f) => {
    if (!f.src) return `<p class="quiet">${esc(f.rel)}: ${esc(f.reason === TOO_BIG ? L.feed.tooBig : L.feed.noMedia)}</p>`;
    if (f.kind === "video") return `<figure><video controls preload="metadata" playsinline src="${esc(f.src)}">${esc(L.feed.noVideo)}</video></figure>`;
    if (f.kind === "audio") return `<figure><audio controls preload="metadata" src="${esc(f.src)}">${esc(L.feed.noAudio)}</audio></figure>`;
    return `<figure><a href="${esc(f.src)}"><img src="${esc(f.src)}" alt="${esc(card.title)}" loading="lazy"></a></figure>`;
  });
  return figs.length ? `<div class="media">${figs.join("")}</div>` : "";
}

// The decision controls of one approval: a comment box and three buttons, disabled until the host
// grants the db (the runtime below wires them).
function controls(key, L) {
  return `<label class="lbl" for="ap-${esc(key)}-c">${esc(L.approvals.comment)}</label>
<textarea id="ap-${esc(key)}-c" rows="3" data-ap-comment disabled aria-describedby="ap-${esc(key)}-hint"></textarea>
<p class="small" id="ap-${esc(key)}-hint">${esc(L.approvals.commentHint)}</p>
<div class="ap-buttons"><button type="button" data-ap="approve" disabled>${esc(L.approvals.approve)}</button><button type="button" data-ap="changes" class="alt" disabled>${esc(L.approvals.changes)}</button><button type="button" data-ap="reject" class="bad" disabled>${esc(L.approvals.reject)}</button></div>
<p class="small ap-msg" data-ap-msg role="status">${esc(L.approvals.offline)}</p>`;
}

// The update that asks for something: the ask in one line, its picture and the decision buttons.
// Its title and note stay in the feed card right below, so nothing is titled twice.
function nowCard(card, L) {
  const key = approvalKey(`upd-${card.id}`);
  return `<div class="need approval" id="now-${esc(card.id)}" data-approval="${esc(key)}"><p class="ask">${inline(card.needs)}</p>${mediaOf(card, L)}<p class="ap-decision" data-ap-decision>${esc(L.approvals.none)}</p>${controls(key, L)}</div>`;
}

// An open item of crew/approvals.json: the same decision controls, without a picture.
function approvalCard(a, L) {
  return `<div class="need approval" data-approval="${esc(a.key)}"><h3>${esc(a.title)}</h3>${
    a.what ? `<p><strong>${esc(L.approvals.judge)}:</strong> ${inline(a.what)}</p>` : ""
  }<p class="ap-decision" data-ap-decision>${esc(L.approvals.none)}</p>${controls(a.key, L)}</div>`;
}

function header(d, L) {
  return `<header class="sheet" id="top"><div class="paper"><p class="kicker">${esc(d.slug)} · ${esc(L.updated)} <time datetime="${esc(d.builtAt)}">${esc(stamp(d.builtAt))}</time></p><h1>${esc(d.title)}</h1></div></header>`;
}

// AGORA: what the client must do now. Derived from the feed (the newest update with `needs`), plus
// any open item of approvals.json; one quiet line says what comes next.
function now(d, L, ask) {
  const items = [];
  if (ask) items.push(nowCard(ask, L));
  for (const a of d.approvals ?? []) if (a.status === "open") items.push(approvalCard(a, L));
  const next = d.tracker?.next[0];
  const tail = next ? `<p class="quiet next">${esc(L.now.next)}: ${inline(next.what)}</p>` : "";
  const body = items.length ? items.join("") : `<p class="quiet">${esc(L.now.none)}</p>`;
  return `<section class="sheet" id="now" aria-labelledby="now-h" data-comment-target><div class="paper"><div class="sheet-head"><h2 id="now-h"><span class="stamp">${esc(L.now.title)}</span></h2>${commentBtn()}</div>${body}${tail}</div></section>`;
}

// One card per update. The update AGORA asks about keeps its title and note here, flagged, and its
// picture lives in AGORA only.
function post(card, L, ask) {
  const asked = card === ask;
  const badge = asked ? `<a class="chip chip--bad" href="#now">${esc(L.feed.waiting)}</a>` : "";
  return `<article class="post" id="${esc(card.id)}" data-comment-target><div class="post-head"><time class="num" datetime="${esc(card.t)}">${esc(stamp(card.t))}</time>${badge}${commentBtn()}</div><h3>${inline(card.title)}</h3>${
    card.note ? `<p class="note">${inline(card.note)}</p>` : ""
  }${asked ? "" : mediaOf(card, L)}</article>`;
}

// A scene's board picture, or an empty paper marked with the status word: no fake picture.
function sceneArt(sc, L) {
  const f = sc.files[0];
  if (f?.src && f.kind === "image") return `<figure class="pic"><a href="${esc(f.src)}"><img src="${esc(f.src)}" alt="${esc(sc.title)}" loading="lazy"></a></figure>`;
  return `<div class="pic blank" role="img" aria-label="${esc(L.scenes.status.todo)}">${esc(L.scenes.status.todo.toLowerCase())}</div>`;
}

const STATUS_KIND = { approved: "ok", waiting: "bad", todo: "muted" };

function scene(sc, L) {
  const world = sc.world ? `<span class="chip">${esc(L.scenes.world)} ${esc(sc.world)}${L.scenes.worlds[sc.world] ? ` · ${esc(L.scenes.worlds[sc.world])}` : ""}</span>` : "";
  return `<li class="scene" id="cena-${sc.n}" data-comment-target>${sceneArt(sc, L)}<div><p class="no">${esc(L.scenes.scene)} ${sc.n}</p><h3>${esc(sc.title)}</h3>${
    sc.says ? `<p class="says">\u201c${esc(sc.says)}\u201d</p>` : ""
  }<div class="chips"><span class="chip chip--${STATUS_KIND[sc.status]}">${esc(L.scenes.status[sc.status])}</span>${world}${commentBtn()}</div></div></li>`;
}

// CENAS: every scene of the film in film order, scene 1 first. Absent without crew/scenes.json.
function scenes(d, L) {
  if (!d.scenes) return "";
  const body = d.scenes.length ? `<ol class="cenas">${d.scenes.map((sc) => scene(sc, L)).join("")}</ol>` : `<p class="quiet">${esc(L.scenes.empty)}</p>`;
  return `<section class="scenes" id="scenes" aria-labelledby="scenes-h"><h2 class="kicker" id="scenes-h">${esc(L.scenes.title)}</h2>${body}</section>`;
}

function feed(d, L, ask) {
  const body = d.feed.length ? d.feed.map((c) => post(c, L, ask)).join("\n") : `<p class="quiet">${esc(L.feed.empty)}</p>`;
  return `<section class="feed" id="feed" aria-labelledby="feed-h"><h2 class="kicker" id="feed-h">${esc(L.feed.title)}</h2>${body}</section>`;
}

// Runtime: approvals and comment buttons light up only when the host grants db / user /
// comments. Nothing is written on load; db text is set with textContent only.
const SCRIPT = `<script>
(function () {
  var T = {};
  try { T = JSON.parse(document.getElementById("board-labels").textContent); } catch (e) {}
  var C = window.claude;
  if (!C || typeof C.use !== "function") return;
  var use = function (name) { try { return Promise.resolve(C.use(name)).catch(function () { return null; }); } catch (e) { return Promise.resolve(null); } };

  use("comments").then(function (comments) {
    if (!comments) return;
    var btns = document.querySelectorAll("button[data-comment]");
    btns.forEach(function (b) { b.hidden = false; });
    document.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-comment]");
      if (!b) return;
      var target = b.closest("[data-comment-target]");
      if (!target) return;
      comments.openComposer({ element: target }).catch(function (err) {
        if (err && err.code === "unavailable") btns.forEach(function (x) { x.hidden = true; });
      });
    });
  });

  var userP = use("user");
  use("db").then(function (db) {
    if (!db) return;
    document.querySelectorAll("[data-approval]").forEach(function (card) { wire(db, card); });
  });

  function fmt(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    try { return d.toLocaleString(document.documentElement.lang || undefined, { dateStyle: "short", timeStyle: "short" }); } catch (e) { return d.toISOString(); }
  }

  function showDecision(card, data, user) {
    var box = card.querySelector("[data-ap-decision]");
    if (!data || !data.decision || !T.decided || !T.decided[data.decision]) { box.textContent = T.none || ""; box.removeAttribute("data-decision"); return; }
    box.setAttribute("data-decision", String(data.decision));
    var line = T.decided[data.decision];
    var when = typeof data.at === "string" ? fmt(data.at) : "";
    var put = function (who) {
      box.textContent = "";
      var strong = document.createElement("strong");
      strong.textContent = line;
      box.appendChild(strong);
      var meta = (who ? " " + (T.by || "") + " " + who : "") + (when ? " · " + when : "");
      if (meta) box.appendChild(document.createTextNode(meta));
      if (typeof data.comment === "string" && data.comment) {
        var q = document.createElement("span");
        q.className = "ap-comment";
        q.textContent = data.comment;
        box.appendChild(q);
      }
    };
    put("");
    if (user && typeof data.by === "string" && data.by) {
      Promise.resolve(user.profiles([data.by])).then(function (ps) {
        var p = ps && ps[data.by];
        put(p ? (p.isMe ? T.you : (p.name || T.someone)) : T.someone);
      }, function () {});
    }
  }

  function wire(db, card) {
    var key = card.getAttribute("data-approval");
    var ref;
    try { ref = db.doc("approvals/" + key); } catch (e) { return; }
    var msg = card.querySelector("[data-ap-msg]");
    var area = card.querySelector("[data-ap-comment]");
    var buttons = card.querySelectorAll("button[data-ap]");
    var busy = false, readOnly = false, current = null, userNs = null;
    userP.then(function (u) {
      userNs = u;
      if (current) showDecision(card, current, userNs);
      if (!u) return;
      Promise.resolve(u.can("data.write")).then(function (ok) { if (ok === false) setReadOnly(); }, function () {});
    });
    ref.onSnapshot(function (snap) {
      current = snap.exists ? snap.data() : null;
      showDecision(card, current, userNs);
    }, function () {});
    var enable = function (on) { buttons.forEach(function (b) { b.disabled = !on; }); if (area) area.disabled = !on; };
    var setReadOnly = function () { readOnly = true; enable(false); if (msg) msg.textContent = T.readOnly || ""; };
    enable(true);
    if (msg) msg.textContent = "";
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        if (busy || readOnly) return;
        var decision = b.getAttribute("data-ap");
        var comment = area ? area.value.trim() : "";
        if (decision !== "approve" && !comment) { if (msg) msg.textContent = T.needComment || ""; if (area) area.focus(); return; }
        busy = true;
        enable(false);
        if (msg) msg.textContent = T.saving || "";
        Promise.resolve(userNs ? userNs.id() : null).then(function (by) {
          return ref.set({ decision: decision, comment: comment, at: new Date().toISOString(), by: by || null });
        }).then(function () {
          busy = false;
          enable(true);
          if (area) area.value = "";
          if (msg) msg.textContent = T.saved || "";
        }, function (err) {
          busy = false;
          if (err && (err.code === "invalid_argument" || err.code === "revoked" || err.code === "not_granted")) { setReadOnly(); return; }
          enable(true);
          if (msg) msg.textContent = T.failed || "";
        });
      });
    });
  }
})();
</script>`;

export function pageHtml(d, L, { css }) {
  COMMENT = L.comment;
  const ask = nowOf(d.feed);
  const body = [header(d, L), now(d, L, ask), scenes(d, L), feed(d, L, ask)].filter(Boolean).join("\n");
  const errs = d.errors.length ? `<p class="foot">${d.errors.map((e) => `${esc(e)} (${esc(L.readError)})`).join("<br>")}</p>` : "";
  return `<title>${esc(d.title)} ${esc(L.board)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="${FONTS}">
<style>
${css}
${CSS}
</style>
<a class="skip" href="#now">${esc(L.skip)}</a>
<main class="desk" lang="${esc(L.lang)}">
${body}
${errs}
</main>
<script type="application/json" id="board-labels">${JSON.stringify(L.approvals).replace(/</g, "\\u003c")}</script>
${SCRIPT}
`;
}
