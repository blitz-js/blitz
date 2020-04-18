const {withBlitz} = require('@blitzjs/server')
const path = require('path')

module.exports = withBlitz({
  webpack: (config, options) => {
    // const firstRule = config.module.rules[0]
    // const origExclude = firstRule.exclude
    // firstRule.exclude = (path) => {
    //   if (path.includes('pclient')) {
    //     console.log('EXCLUDING')
    //     return true
    //   }
    //   return origExclude(path)
    // }

    // config.node.__dirname = false

    config.externals = {
      // 'db/.generated-prisma-client': 'db/.generated-prisma-client',
      pclient: path.resolve(__dirname, 'pclient'),
    }

    return config
  },
})
