const {withBlitz} = require("@blitzjs/next")

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
}

module.exports = withBlitz(nextConfig)
