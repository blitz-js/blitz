const {withBlitz} = require("@blitzjs/next")

const loaderClient = require.resolve("@blitzjs/rpc/dist/loader-client.cjs")
const loaderServer = require.resolve("@blitzjs/rpc/dist/loader-server.cjs")
const loaderServerResolvers = require.resolve("@blitzjs/rpc/dist/loader-server-resolvers.cjs")

console.log("loaderClient", loaderClient)
console.log("loaderServer", loaderServer)
console.log("loaderServerResolvers", loaderServerResolvers)

/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = withBlitz(nextConfig)
