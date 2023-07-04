import {defineConfig} from "tsup"

export default defineConfig({
  dts: true,
  clean: true,
  format: ["esm", "cjs"],
  target: "es2015",
  entry: {
    ["index-browser"]: "./src/index-browser.tsx",
    ["index-server"]: "./src/index-server.ts",
    index: "./src/cli/index.ts",
    installer: "./src/installer.ts",
  },
  external: ["blitz", ".blitz", "esm"],
})
