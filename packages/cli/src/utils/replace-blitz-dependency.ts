import {writeJSONSync} from 'fs-extra'
import {join} from 'path'

export const replaceBlitzDependency = async (pkg: any, desinationPath: string, cliVersion: string) => {
  const newVersion = cliVersion.includes('canary') ? 'canary' : 'latest'

  pkg.dependencies.blitz = newVersion
  writeJSONSync(join(desinationPath, 'package.json'), pkg, {spaces: 2})
}
