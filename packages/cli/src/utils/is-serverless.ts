import {resolve} from 'path'
import {pathExistsSync} from 'fs-extra'
const configFiles = ['next.config.js', 'blitz.config.js']

export const isServerless = (src: string): boolean => {
  let serverless = false

  for (const configFile of configFiles) {
    if (pathExistsSync(resolve(src, configFile))) {
      const config = require(resolve(src, configFile))
      if (Object.keys(config).includes('target') && config.target.includes('serverless')) {
        serverless = true
      }
    }
  }

  return serverless
}
