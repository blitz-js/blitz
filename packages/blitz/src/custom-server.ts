import next from "next"

// Support commonjs `require('blitz')`
if (process.env.BLITZ_PROD_BUILD) {
  module.exports = next
  exports = module.exports
}

// eslint-disable-next-line import/no-default-export
export default next
