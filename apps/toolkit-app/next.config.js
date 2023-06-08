const { withNextAuthAdapter } = require("@blitzjs/auth/next-auth")
const { withBlitz } = require("@blitzjs/next")

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  reactStrictMode: true,
}

module.exports = withBlitz(withNextAuthAdapter(config))
