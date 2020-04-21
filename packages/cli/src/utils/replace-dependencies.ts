import {writeJSONSync} from 'fs-extra'
import {join} from 'path'
import {getLatestVersion} from '../utils/get-latest-version'

export const replaceDependencies = async (
  pkg: any,
  desinationPath: string,
  dependencies: string[],
  key: string,
) => {
  try {
    const latestVersions = await Promise.all(
      dependencies.map(async (dependency) => {
        const templateVersion = pkg[key][dependency]
        if (templateVersion.match(/\d.x/)) {
          return await getLatestVersion(dependency, templateVersion.replace('.x', ''))
        } else {
          return templateVersion
        }
      }),
    )

    pkg[key] = dependencies.reduce((o, k, i) => ({...o, [k]: latestVersions[i]}), {})
    writeJSONSync(join(desinationPath, 'package.json'), pkg)
  } catch {
    return
  }
}
