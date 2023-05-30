const { withNextAuthAdapter } = require("@blitzjs/auth/next-auth")
const { withBlitz } = require("@blitzjs/next")

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "next-auth/core/lib/oauth/callback":
        process.cwd() + "/node_modules/next-auth/core/lib/oauth/callback.js",
      "next-auth/core/lib/oauth/authorization-url":
        process.cwd() + "/node_modules/next-auth/core/lib/oauth/authorization-url.js",
      "next-auth/core/init": process.cwd() + "/node_modules/next-auth/core/init.js",
    }
    return config
  },
}

module.exports = withBlitz(withNextAuthAdapter(config))
