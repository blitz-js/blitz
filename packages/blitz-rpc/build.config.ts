import {BuildConfig} from "unbuild"

const config: BuildConfig = {
  entries: [
    "./src/index-browser",
    "./src/index-server",
    "./src/loader-server",
    "./src/loader-server-resolvers",
    "./src/loader-client",
  ],
  externals: [
    "index-browser.cjs",
    "index-browser.mjs",
    "index-server.cjs",
    "index-server.mjs",
    "react",
    "blitz",
    "next",
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
}
export default config
