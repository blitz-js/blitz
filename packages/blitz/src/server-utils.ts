import * as fs from "fs"
import * as path from "path"

export function readBlitzConfig(rootFolder: string = process.cwd()) {
  const packageJsonFile = fs.readFileSync(path.join(rootFolder, "package.json"), {
    encoding: "utf8",
    flag: "r",
  })
  const packageJson = JSON.parse(packageJsonFile)

  return packageJson.blitz || {}
}
