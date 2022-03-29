import {BuildConfig} from "unbuild"

const config: BuildConfig = {
  entries: ["./src/index"],
  externals: [
    "react",
    "fast-glob",
    "globby",
    "multimatch",
    "prettier",
    "mem-fs-editor",
    "mem-fs",
    "fs-extra",
    "safe-buffer",
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
}
export default config
