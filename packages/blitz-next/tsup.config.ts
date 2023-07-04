import {defineConfig} from "tsup"

export default defineConfig({
  dts: true,
  clean: true,
  format: ["esm", "cjs"],
  target: "es2015",
  entry: ["./src/index-browser.tsx", "./src/index-server.ts"],
  external: ["blitz", ".blitz"],
})
