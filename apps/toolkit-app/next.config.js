const { withBlitz } = require("@blitzjs/next")

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  reactStrictMode: true,
  blitz: {
    resolversDynamicImport: true,
  },
}

module.exports = withBlitz(config)
