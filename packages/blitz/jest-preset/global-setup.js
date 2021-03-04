// eslint-disable-next-line import/no-default-export
module.exports = function globalSetup(globalConfig) {
  require("dotenv-flow").config({silent: true})
  process.env.BLITZ_JEST_TEST = true
}
