import {defineConfig} from "tsup"

export default defineConfig({
  dts: true,
  clean: true,
  format: ["esm", "cjs"],
  target: "es2015",
  entry: [
    "./src/index-browser.tsx",
    "./src/index-server.ts",
    "./src/server/loader/server/loader-server.ts",
    "./src/server/loader/server/loader-server-resolvers.ts",
    "./src/server/loader/client/loader-client.ts",
    "./src/query/react-query/index.ts",
  ],
  external: ["@blitzjs/auth", "zod"],
})
