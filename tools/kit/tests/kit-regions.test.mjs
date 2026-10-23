import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = mkdtempSync(join(tmpdir(), "kit-regions-"));
const kit = join(root, "kit");
mkdirSync(join(kit, "sources"), { recursive: true });
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=0x8a7a60:s=400x300", "-frames:v", "1", join(kit, "sources", "scan.jpg")]);

const square = (u0, u1) => [[u0, 0.1], [u1, 0.1], [u1, 0.9], [u0, 0.9]];
const writeCatalog = (right) =>
  writeFileSync(
    join(kit, "catalog.json"),
    JSON.stringify({
      pieces: [
        {
          id: "scan",
          kind: "page",
          src: "kit/sources/scan.jpg",
          cut: "regions",
          regions: [
            { id: "left", poly: square(0.05, 0.45) },
            { id: "right", poly: square(...right) },
          ],
        },
      ],
    }),
  );
const build = () =>
  execFileSync("node", ["tools/kit/kit.mjs", "build", "--kit", kit, "--root", root]).toString();
const sizes = () => {
  const m = JSON.parse(readFileSync(join(kit, "pieces", "manifest.json"), "utf8"));
  return [m["page/scan-left"], m["page/scan-right"]];
};

test("kit build: regions rebuild only when the entry changes", () => {
  writeCatalog([0.55, 0.95]);
  assert.match(build(), /2 built/);
  assert.match(build(), /0 built/, "nothing changed, nothing re-cut");
  const [, before] = sizes();
  writeCatalog([0.55, 0.75]); // same source file, narrower region
  assert.match(build(), /2 built/, "an edited poly re-cuts");
  const [, after] = sizes();
  assert.ok(after.w < before.w, `right clipping narrowed (${before.w} → ${after.w})`);
  assert.match(build(), /0 built/);
});

test("kit build: a regions entry without regions is reported, not fatal", () => {
  writeFileSync(
    join(kit, "catalog.json"),
    JSON.stringify({ pieces: [{ id: "scan", kind: "page", src: "kit/sources/scan.jpg", cut: "regions" }] }),
  );
  assert.match(build(), /failed cuts \(1\)[\s\S]*non-empty regions list/);
});
