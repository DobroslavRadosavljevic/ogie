import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "bulk/index": "src/bulk/index.ts",
    "cache/index": "src/cache/index.ts",
    "errors/index": "src/errors/index.ts",
    index: "src/index.ts",
  },
  exports: true,
});
