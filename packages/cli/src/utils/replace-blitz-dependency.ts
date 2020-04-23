import {writeJSONSync} from 'fs-extra'
import {join} from 'path'

import {fetchDistTags} from './npm-fetch'

export const replaceBlitzDependency = async (pkg: any, desinationPath: string, cliVersion: string) => {
  const distTags = await fetchDistTags('blitz')

  if (!distTags) {
    return
  }

  // `blitz new` from a global install of `blitz@latest` will result in `"blitz": "latest"` in package.json
  // `blitz new` from a global install of `blitz@canary` will result in `"blitz": "canary"` in package.json
  // Otherwise, fall back on canary
  const newVersion =
    cliVersion === distTags.latest ? 'latest' : cliVersion === distTags.canary ? 'canary' : 'canary'

  pkg.dependencies.blitz = newVersion
  writeJSONSync(join(desinationPath, 'package.json'), pkg, {spaces: 2})
}
