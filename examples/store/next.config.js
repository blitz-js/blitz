const {withBlitz} = require('@blitzjs/server')

module.exports = withBlitz({
  webpack: (config) => {
    const firstRule = config.module.rules[0]
    const origExclude = firstRule.exclude
    firstRule.exclude = (path) => {
      console.log(path)
      if (path.includes('db/.generated-prisma-client')) return true
      return origExclude(path)
    }
  },
})
