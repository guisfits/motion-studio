// Small Markdown readers for the crew's files: inline Markdown → HTML and the bullets of a log.

export const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Inline Markdown → HTML. Links are kept only for http(s) targets.
export function inline(s) {
  let out = esc(s);
  const codes = [];
  out = out.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  out = out
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^\w*])\*([^*\s][^*]*)\*(?!\w)/g, "$1<em>$2</em>")
    .replace(/(^|[^\w])_([^_\s][^_]*)_(?!\w)/g, "$1<em>$2</em>");
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
}

// Top-level bullets of a block, each with its continuation lines joined.
export function bullets(text) {
  const out = [];
  for (const line of String(text ?? "").split("\n")) {
    if (/^[-*]\s+/.test(line)) out.push(line.replace(/^[-*]\s+/, "").trim());
    else if (out.length && /^\s{2,}\S/.test(line)) out[out.length - 1] += " " + line.trim();
    else if (!line.trim()) continue;
  }
  return out;
}
