import {getProjectRootSync} from "next/server/lib/utils"

const projectRoot = getProjectRootSync()
const isTypeScript = require("fs").existsSync(require("path").join(projectRoot, "tsconfig.json"))

const invalidateCache = (module: string) => {
  delete require.cache[require.resolve(module)]
}

export const forceRequire = (modulePath: string) => {
  invalidateCache(modulePath)

  if (isTypeScript) {
    return require(modulePath)
  } else {
    const esmRequire = require("esm")(module)
    return esmRequire(modulePath)
  }
}
