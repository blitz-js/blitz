import {existsSync} from "fs"
import {readJSON} from "fs-extra"
import {join} from "path"

export const getPackageJson = async () => {
  const pkgJsonPath = join(process.cwd(), "package.json")
  if (existsSync(pkgJsonPath)) {
    return readJSON(pkgJsonPath)
  }
  return {}
}
