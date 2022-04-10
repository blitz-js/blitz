const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})
const {withBlitz} = require("@blitzjs/rpc")

module.exports = withBlitz(
  withBundleAnalyzer({
    reactStrictMode: true,
  }),
)
