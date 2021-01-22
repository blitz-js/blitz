import globby from "globby"
import path from "path"
import pkgDir from "pkg-dir"
import ProgressBar from "progress"
import {forceRequire} from "./module"

const projectRoot = pkgDir.sync() || process.cwd()

export async function getBlitzModulePaths() {
  const paths = await globby(
    [
      "app/**/{queries,mutations}/*.{js,ts,tsx}",
      "**/utils/*.{js,ts,tsx}",
      "jobs/**/*.{js,ts,tsx}",
      "integrations/**/*.{js,ts,tsx}",
    ],
    {cwd: projectRoot, gitignore: true},
  )
  paths.push("db")

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
        const module = forceRequire(modulePath)
        const contextObj = module.default || module

        percentage.tick()

        //TODO: include all exports here, not just default
        return {
          [name]: contextObj,
        }
      } catch (e) {
        return {}
      }
    }),
  )

  percentage.terminate()

  return modules
}
