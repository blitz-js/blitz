import pkgDir from "pkg-dir"
import {join} from "path"
import {existsSync} from "fs"

const configFiles = ["blitz.config.js", "next.config.js"]
/**
 * @param {boolean | undefined} reload - reimport config files to reset global cache
 */
export const getConfig = (reload?: boolean): Record<string, unknown> => {
  if (global.blitzConfig && Object.keys(global.blitzConfig).length > 0 && !reload) {
    return global.blitzConfig
  }

  let blitzConfig = {}
  const projectRoot = pkgDir.sync() || process.cwd()

  for (const configFile of configFiles) {
    if (existsSync(join(projectRoot, configFile))) {
      const path = join(projectRoot, configFile)
      const file = require(path)
      let contents
      if (typeof file === "function") {
        contents = file()
      } else {
        contents = file
      }
      blitzConfig = {
        ...blitzConfig,
        ...contents,
      }
    }
  }

  global.blitzConfig = blitzConfig

  return blitzConfig
}
