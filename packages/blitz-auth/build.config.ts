import {BuildConfig} from "unbuild"

const config: BuildConfig = {
  entries: [
    "./src/index-browser",
    "./src/index-server",
    {
      builder: "mkdist",
      input: "./src/server/adapters/next-auth",
      outDir: "./dist/next-auth",
    },
    {
      builder: "mkdist",

      input: "./src/server/adapters/secure-password/",
      outDir: "./dist/secure-password",
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
