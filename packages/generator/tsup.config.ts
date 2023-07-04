import {defineConfig} from "tsup"

export default defineConfig({
  clean: true,
  dts: true,
  publicDir: "templates",
  format: ["esm", "cjs"],
  target: "es2015",
  entry: ["./src/**/*.ts"],
  external: ["react", "zod"],
})
