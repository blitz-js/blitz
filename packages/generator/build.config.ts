import {BuildConfig} from "unbuild"

const config: BuildConfig = {
  entries: ["./src/index"],
  externals: ["react"],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
}
export default config
