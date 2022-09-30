import * as fs from "fs"
import * as path from "path"

export function readBlitzConfig(rootFolder: string = process.cwd()) {
  const nextConfigFile = fs.readFileSync(path.join(rootFolder, "next.config.js"), {
    encoding: "utf8",
    flag: "r",
  })
  const nextConfig = eval(nextConfigFile)

  return nextConfig.blitz || {}
}
