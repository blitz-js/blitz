import {defineConfig} from "tsup"

export default defineConfig({
  dts: true,
  clean: true,
  format: ["esm", "cjs"],
  target: "es2015",
  entry: {
    ["index-browser"]: "./src/index-browser.tsx",
    ["index-server"]: "./src/index-server.ts",
    ["secure-password"]: "./src/server/secure-password.ts",
    ["next-auth"]: "./src/server/adapters/next-auth.ts",
  },
  external: ["react"],
})
