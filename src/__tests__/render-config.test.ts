import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Effects need WebGL: a render without the ANGLE renderer silently drops them, so the config
// must pin it (plan Review Focus).
describe("remotion.config.ts", () => {
  const config = readFileSync(new URL("../../remotion.config.ts", import.meta.url), "utf8");

  it("pins the ANGLE OpenGL renderer", () => {
    expect(config).toContain('setChromiumOpenGlRenderer("angle")');
  });

  it("renders with rspack and jpeg frames", () => {
    expect(config).toContain("setRspack(true)");
    expect(config).toContain('setVideoImageFormat("jpeg")');
  });
});
