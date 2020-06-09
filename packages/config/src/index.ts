import pkgDir from 'pkg-dir'
import {join} from 'path'
import {existsSync} from 'fs'

const configFiles = ['blitz.config.js', 'next.config.js']

export const getConfig = async (): Promise<Record<string, unknown>> => {
  if (Object.keys(global.config).length > 0) {
    return global.config
  }

  let config = {}
  const projectRoot = (await pkgDir()) || process.cwd()

  for (const configFile of configFiles) {
    if (existsSync(join(projectRoot, configFile))) {
      const file = require(join(projectRoot, configFile))
      config = {...config, ...file}
    }
  }

  global.config = config

  return config
}
