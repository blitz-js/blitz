// NOTE: This is ONLY needed in this Blitz monorepo so that package hot reloading works properly
const withTM = require('next-transpile-modules')(['@blitzjs/core'])
module.exports = withTM({})
