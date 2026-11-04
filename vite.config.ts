import { defineConfig } from "vitest/config";

export default defineConfig({
  // Relative base so the built site works from any GitHub Pages sub-path (e.g. /funded-abroad/).
  base: "./",
  build: { outDir: "dist", target: "es2020" },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
