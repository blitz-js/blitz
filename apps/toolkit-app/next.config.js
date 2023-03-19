const { withNextAuthAdapter } = require("@blitzjs/auth")
const { withBlitz } = require("@blitzjs/next")

/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
const config = {
  reactStrictMode: true,
}

module.exports = withBlitz(withNextAuthAdapter(config))
