const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

// const {resolve} = require("path")
// const dir = __dirname + (() => "")() // trick to avoid `@vercel/ncc` to glob import
// const loader = resolve(dir, "./loader.js")

const {loader} = require("@blitzjs/rpc")

module.exports = withBundleAnalyzer({
  reactStrictMode: true,

  webpack: (config, options) => {
    config.module.rules.push({
      // TODO - exclude pages, api, etc.
      test: /\/queries\//,
      use: [{loader}],
    })

    if (typeof nextConfig.webpack === "function") {
      return nextConfig.webpack(config, options)
    }
    return config
  },
})
