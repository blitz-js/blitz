import { defineConfig } from "tsup";

export default defineConfig((options) => {
  return {
    ...options,
    format: ["esm", "cjs"],
    external: ["react"],
    dts: true,
  };
});
