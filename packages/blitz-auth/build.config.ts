import {BuildConfig} from "unbuild"

const config: BuildConfig = {
  entries: [
    "./src/index-browser",
    "./src/index-server",
    "./src/server/secure-password",
    {
      builder: "mkdist",
      input: "./src/adapters/",
      outDir: "./adapters",
    },
  ],
  externals: ["index-browser.cjs", "index-browser.mjs", "react"],
  declaration: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      target: ["es2015"],
    },
  },
}
export default config
