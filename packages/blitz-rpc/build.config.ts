import {BuildConfig} from "unbuild"

const config: BuildConfig = {
  entries: [
    "./src/index-browser",
    "./src/index-server",
    "./src/server/loader/server/loader-server",
    "./src/server/loader/server/loader-server-resolvers",
    "./src/server/loader/client/loader-client",
    "./src/query/react-query/index",
  ],
  externals: [
    "index-browser.cjs",
    "index-browser.mjs",
    "index-server.cjs",
    "index-server.mjs",
    "index.cjs",
    "index.mjs",
    "@blitzjs/auth",
    "zod",
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      target: ["es2015"],
    },
  },
}
export default config
