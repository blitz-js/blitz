// eslint-disable-next-line import/no-default-export
const loadEnvConfig = require("@blitzjs/env").loadEnvConfig
module.exports = function globalSetup(globalConfig) {
  loadEnvConfig()
}
