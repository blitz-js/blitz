// eslint-disable-next-line import/no-default-export
import {loadEnvConfig} from "@next/env"
module.exports = function globalSetup(globalConfig) {
  const projectDir = process.cwd()
  loadEnvConfig(projectDir)
}
