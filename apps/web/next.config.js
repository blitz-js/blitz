const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

// const {resolve} = require("path")
// const dir = __dirname + (() => "")() // trick to avoid `@vercel/ncc` to glob import
// const loader = resolve(dir, "./loader.js")

// const loader = require("path").join(require.resolve("@blitzjs/rpc"), "/dist/loader")
// const loader = "@blitzjs/rpc/dist/loader"
// const loader = "/Users/b/c/blitz2/packages/blitz-rpc/dist/loader"
// console.log("LOADER", loader)

const {blitzPlugin} = require("@blitzjs/rpc")

module.exports = blitzPlugin(
  withBundleAnalyzer({
    reactStrictMode: true,
  }),
)
