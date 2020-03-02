const path = require('path')
// NOTE: This is ONLY needed in this Blitz monorepo so that package hot reloading works properly
const withTM = require('next-transpile-modules')(['@blitzjs/core'])
module.exports = withTM({
  webpack: (config, {buildId, dev, isServer, defaultLoaders, webpack}) => {
    if (!isServer) {
      // Noop resolution of @prisma/client in the browser
      // since setting an alias to false does not work
      config.resolve.alias['@prisma/client'] = path.join(__dirname, 'noop.js')
    }
    return config
  },
})
