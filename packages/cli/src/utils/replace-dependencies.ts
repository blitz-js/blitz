import {getLatestVersion} from '../utils/get-latest-version'

export const replaceDependencies = async (pkg: any, dependencies: string[], key: string) => {
  const latestVersions = await Promise.all(
    dependencies.map(async (dependency) => {
      const templateVersion = pkg[key][dependency]
      if (templateVersion.match(/\d.x/)) {
        return await getLatestVersion(dependency, templateVersion)
      } else {
        return templateVersion
      }
    }),
  )

  return {key, dependencies: dependencies.reduce((o, k, i) => ({...o, [k]: latestVersions[i]}), {})}
}
