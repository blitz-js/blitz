import {getProjectRoot} from "@blitzjs/config"
import {existsSync} from "fs"
import {readJSON} from "fs-extra"
import {join} from "path"

export const getPackageJson = () => {
  const pkgJsonPath = join(getProjectRoot(), "package.json")
  if (existsSync(pkgJsonPath)) {
    return readJSON(pkgJsonPath)
  }
  return
}
