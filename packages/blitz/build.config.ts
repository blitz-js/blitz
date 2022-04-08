import {BuildConfig} from "unbuild"

// todo: move this to blitjs/next
const nextJsExternals = [
  "next",
  "next/dist/cli/next-build",
  "next/dist/cli/next-start",
  "next/dist/cli/next-export",
  "next/dist/cli/next-dev",
  "next/dist/cli/next-lint",
  "next/dist/cli/next-telemetry",
  "next/dist/cli/next-info",
]

const config: BuildConfig = {
  entries: ["./src/index-browser", "./src/index-server", "./src/cli/index"],
  externals: [
    "index-browser.cjs",
    "index-browser.mjs",
    "react",
    "chalk",
    "console-table-printer",
    "tslog",
    "ora",
    ...nextJsExternals,
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
}
export default config
