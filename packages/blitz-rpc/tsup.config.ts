import {defineConfig} from "tsup"

export default defineConfig({
  dts: true,
  clean: true,
  format: ["esm", "cjs"],
  target: "es2015",
  entry: {
    ["index-browser"]: "./src/index-browser.tsx",
    ["index-server"]: "./src/index-server.ts",
    ["loader-client"]: "./src/server/loader/client//loader-client.ts",
    ["loader-server"]: "./src/server/loader/server/loader-server.ts",
    ["loader-server-resolvers"]: "./src/server/loader/server/loader-server-resolvers.ts",
    ["react-query"]: "./src/query/react-query/index.ts",
  },
  external: ["@blitzjs/auth", "zod"],
  plugins: [
    {
      name: "removeBrowserArtifacts",
      renderChunk(code, chunkInfo) {
        if (chunkInfo.path.endsWith("index-server.js")) {
          chunkInfo.code = code
            .replace(/require\(\"\@tanstack\/react-query\"\);/g, 'require("./react-query.js");')
            .replace('require("next/router")', "{}")
        }
      },
    },
  ],
})
