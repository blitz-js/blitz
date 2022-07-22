import {BuildConfig} from "unbuild"

const config: BuildConfig = {
  entries: ["./src/index-server"],
  externals: [],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
}
export default config
