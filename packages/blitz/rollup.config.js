import typescript from "@wessberg/rollup-plugin-ts"
import commonjs from "rollup-plugin-commonjs"
import json from "rollup-plugin-json"
import resolve from "rollup-plugin-node-resolve"
import external from "rollup-plugin-peer-deps-external"
import pkg from "./package.json"

const common = {
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    "react",
    "react-dom",
    "next",
    "fs",
    "path",
  ],
  plugins: [
    json(),
    external(),
    resolve({preferBuiltins: true}),
    typescript({
      transformers: [],
    }),
    commonjs({
      include: /node_modules/,
      namedExports: {},
    }),
  ],
}

const lib = {
  input: "./src/index.ts",
  output: {
    file: pkg["main"],
    exports: "named",
    sourcemap: "true",
    format: "cjs",
  },
  ...common,
}

const cli = {
  input: "./src/bin/cli.ts",
  output: {
    file: "./dist/cli.js",
    exports: "named",
    sourcemap: "true",
    format: "cjs",
  },
  ...common,
}

const builds = [lib, cli]

// eslint-disable-next-line
export default builds
