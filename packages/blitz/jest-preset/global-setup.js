// eslint-disable-next-line import/no-default-export
import {loadEnvConfig} from "@blitzjs/env"
module.exports = function globalSetup(globalConfig) {
  loadEnvConfig()
}
