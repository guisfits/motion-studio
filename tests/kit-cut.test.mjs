import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = mkdtempSync(join(tmpdir(), "kit-cut-"));
const kit = join(root, "kit");
mkdirSync(join(kit, "sources"), { recursive: true });
// Dark ink square on light paper: `paper` keeps the square, `alpha` keeps the PNG's own alpha.
const ink = (name) =>
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=0xefe8d8:s=200x160",
    "-vf", "drawbox=x=50:y=40:w=100:h=80:color=0x1a1a1a:t=fill", "-frames:v", "1", join(kit, "sources", name)]);
for (const n of ["a.png", "b.png", "c.png"]) ink(n);

const writeCatalog = (border) =>
  writeFileSync(join(kit, "catalog.json"), JSON.stringify({
    pieces: ["a", "b", "c"].map((id) => ({ id, kind: "page", src: `kit/sources/${id}.png`, cut: "paper", border })),
  }));
const build = () => execFileSync("node", ["core/kit.mjs", "build", "--kit", kit, "--root", root]).toString();
const manifest = () => JSON.parse(readFileSync(join(kit, "pieces", "manifest.json"), "utf8"));

test("kit build: cuts every piece in one run, skips them when nothing changed", () => {
  writeCatalog(0);
  assert.match(build(), /kit: 3 built/);
  const m = manifest();
  assert.deepEqual([m["page/a"].w, m["page/a"].h], [100, 80]);
  assert.match(build(), /kit: 0 built/);
});

test("kit build: a changed recipe (border) re-cuts though the source is older", () => {
  writeCatalog(6);
  assert.match(build(), /kit: 3 built/);
  assert.deepEqual([manifest()["page/a"].w, manifest()["page/a"].h], [112, 92]);
});

test("cutout --mode alpha: keeps a PNG's own alpha, crops it and adds the border", () => {
  const cut = join(root, "cut.png");
  execFileSync("swift", ["core/reference/cutout.swift", join(kit, "pieces", "page", "a.png"), cut, "--mode", "alpha", "--border", "4"]);
  assert.ok(existsSync(cut));
  const [w, h] = execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", cut])
    .toString().trim().split(",").map(Number);
  // a.png is already 112×92 (6 px border, opaque): alpha keeps it and grows 4 px per side.
  assert.deepEqual([w, h], [120, 100]);
});
