import {existsSync} from "fs"
import {readJSON} from "fs-extra"
import {getProjectRoot} from "next/dist/server/lib/utils"
import {join} from "path"

export const getPackageJson = async () => {
  const pkgJsonPath = join(await getProjectRoot(process.cwd()), "package.json")
  if (existsSync(pkgJsonPath)) {
    return readJSON(pkgJsonPath)
  }
  return
}
