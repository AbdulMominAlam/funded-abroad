import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  // Relative base so the built site works from any sub-path (GitHub Pages) or the root (Cloudflare Pages).
  base: "./",
  build: {
    outDir: "dist",
    target: "es2020",
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        privacy: fileURLToPath(new URL("./privacy.html", import.meta.url)),
      },
    },
  },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
