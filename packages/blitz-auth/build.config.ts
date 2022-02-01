import { BuildConfig } from "unbuild"

const config: BuildConfig = {
  entries: ["./src/index-browser", "./src/index-server"],
  externals: ["index-browser.cjs", "index-browser.mjs"],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
}
export default config
