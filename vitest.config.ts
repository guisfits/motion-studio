import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["src/**/*.test.{ts,tsx}", "studio/films/**/*.test.ts"], environment: "node" },
});
