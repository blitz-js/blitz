const {withBlitz} = require("@blitzjs/next")

const loaderClient = require.resolve("@blitzjs/rpc/dist/loader-client.cjs")
const loaderServer = require.resolve("@blitzjs/rpc/dist/loader-server.cjs")
const loaderServerResolvers = require.resolve("@blitzjs/rpc/dist/loader-server-resolvers.cjs")

console.log("loaderClient", loaderClient)
console.log("loaderServer", loaderServer)
console.log("loaderServerResolvers", loaderServerResolvers)

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        "cross-spawn": {browser: "./turbopack/empty.js"},
        "npm-which": {browser: "./turbopack/empty.js"},
        fs: {browser: "./turbopack/empty.js"},
      },
      rules: {
        "**/*...blitz*.{jsx,tsx,js,ts}": {
          default: {
            loaders: [{loader: loaderServer, options: {}}],
            as: "*.ts",
          },
        },
        "**/{queries,mutations}/**": {
          browser: {
            loaders: [
              {
                loader: loaderClient,
                options: {},
              },
            ],
            as: "*.ts",
          },
          default: {
            loaders: [
              {
                loader: loaderServerResolvers,
                options: {},
              },
            ],
            as: "*.ts",
          },
        },
      },
    },
  },
}

module.exports = withBlitz(nextConfig)
