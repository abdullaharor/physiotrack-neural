import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Integration tests that need a real Postgres live behind this tag (Phase 13).
    exclude: ["tests/integration/**"],
  },
});
