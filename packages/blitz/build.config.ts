import {BuildConfig} from "unbuild"

const config: BuildConfig = {
  entries: ["./src/index-browser", "./src/index-server", "./src/cli/index"],
  externals: ["index-browser.cjs", "index-browser.mjs", "index.cjs", "zod", "react"],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
}
export default config
