import {BuildConfig} from "unbuild"

const config: BuildConfig = {
  entries: ["./src/index"],
  externals: ["index.cjs", "blitz"],
  declaration: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      target: ["es2015"],
    },
  },
}
export default config
