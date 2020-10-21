import {existsSync} from "fs"
import {PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER} from "next/constants"
import {join} from "path"
import pkgDir from "pkg-dir"

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
        const phase =
          process.env.NODE_ENV === "production" ? PHASE_PRODUCTION_SERVER : PHASE_DEVELOPMENT_SERVER
        contents = file(phase, {})
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
