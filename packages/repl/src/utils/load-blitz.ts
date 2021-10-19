import {log} from "@blitzjs/display"
import globby from "globby"
import {getProjectRoot} from "next/dist/server/lib/utils"
import path from "path"
import ProgressBar from "progress"
import {forceRequire} from "./module"
const debug = require("debug")("blitz:repl")

export async function getBlitzModulePaths() {
  const projectRoot = await getProjectRoot(process.cwd())

  const paths = await globby(
    [
      "app/**/{queries,mutations}/*.{js,ts,tsx}",
      "utils/*.{js,ts,tsx}",
      "jobs/**/*.{js,ts,tsx}",
      "integrations/**/*.{js,ts,tsx}",
      "!**/*.test.*",
      "!**/*.spec.*",
    ],
    {cwd: projectRoot, gitignore: true},
  )
  paths.push("db")
  debug("Paths", paths)

  return [...paths.map((p) => path.join(projectRoot, p))]
}

export const loadBlitz = async () => {
  const paths = await getBlitzModulePaths()

  const percentage = new ProgressBar("Loading Modules :current/:total", {
    total: paths.length,
  })

  const modules: Record<string, any>[] = Object.assign(
    {},
    ...paths.map((modulePath) => {
      let name = path.parse(modulePath).name
      if (name === "index") {
        const dirs = path.dirname(modulePath).split(path.sep)
        name = dirs[dirs.length - 1]
      }

      try {
        debug("Loading", modulePath)
        const module = forceRequire(modulePath)
        const contextObj = module.default || module
        // debug("ContextObj", contextObj)

        percentage.tick()

        //TODO: include all exports here, not just default
        return {
          [name]: contextObj,
        }
      } catch (error) {
        log.error(`Failed to load ${modulePath}: ${error}`)
        debug("Failed to load module", error)
        return {}
      }
    }),
  )

  percentage.terminate()

  return modules
}
