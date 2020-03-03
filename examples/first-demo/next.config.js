const {withBlitz} = require('@blitzjs/core')
const path = require('path')

module.exports = withBlitz({
  webpack: (config, {buildId, dev, isServer, defaultLoaders, webpack}) => {
    if (!isServer) {
      // Noop resolution of @prisma/client in the browser
      // since setting an alias to false does not work
      config.resolve.alias['@prisma/client'] = path.join(__dirname, 'noop.js')
    }
    return config
  },
})
