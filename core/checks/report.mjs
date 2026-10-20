const ICON = { red: "🔴", orange: "🟠", yellow: "🟡" };
const RANK = { red: 0, orange: 1, yellow: 2 };

// A typo in a severity would drop the finding from the summary, so a silent pass: refuse it.
export function finding(severity, code, t, msg) {
  if (!Object.hasOwn(RANK, severity))
    throw new Error(`unknown severity "${severity}"`);
  return { severity, code, t: t ?? null, msg };
}

export function summarize(findings) {
  const n = (s) => findings.filter((f) => f.severity === s).length;
  const red = n("red");
  return { red, orange: n("orange"), yellow: n("yellow"), pass: red === 0 };
}

export function toMarkdown(findings) {
  return [...findings]
    .sort(
      (a, b) =>
        RANK[a.severity] - RANK[b.severity] || (a.t ?? -1) - (b.t ?? -1),
    )
    .map(
      (f) =>
        `${ICON[f.severity]} ${f.code} · ${f.t === null ? "—" : `${f.t.toFixed(2)} s`} · ${f.msg}`,
    )
    .join("\n");
}
