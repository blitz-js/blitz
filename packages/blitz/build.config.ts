import {BuildConfig} from "unbuild"

const config: BuildConfig = {
  entries: ["./src/index-browser", "./src/index-server"],
  externals: ["react"],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
}
export default config
