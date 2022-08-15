import {existsSync} from "fs"
import {readJSON} from "fs-extra"
import {join} from "path"

export const getPackageJson = async (path = process.cwd()) => {
  const pkgJsonPath = join(path, "package.json")
  if (existsSync(pkgJsonPath)) {
    return readJSON(pkgJsonPath)
  }
  return {}
}
