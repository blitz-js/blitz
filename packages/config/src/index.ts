import pkgDir from 'pkg-dir'
import {join} from 'path'
import {existsSync} from 'fs'

const configFiles = ['next.config.js']
/**
 * @param {boolean | undefined} reload - reimport config files to reset global cache
 */
export const getConfig = async (reload?: boolean): Promise<Record<string, unknown>> => {
  if (Object.keys(global.blitzConfig).length > 0 && !reload) {
    return global.blitzConfig
  }

  let blitzConfig = {}
  const projectRoot = (await pkgDir()) || process.cwd()

  for (const configFile of configFiles) {
    if (existsSync(join(projectRoot, configFile))) {
      const file = require(join(projectRoot, configFile))
      blitzConfig = {...blitzConfig, ...file}
    }
  }

  global.blitzConfig = blitzConfig

  return blitzConfig
}
