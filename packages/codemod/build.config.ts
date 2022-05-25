import {BuildConfig} from "unbuild"

const config: BuildConfig = {
  entries: ["./src/index"],
  externals: ["index.cjs"],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
}
export default config
