import {getLatestVersion} from './get-latest-version'

export const fetchLatestVersionsFor = async (dependencies: Record<string, string>) => {
  const entries = Object.entries(dependencies)

  const updated = await Promise.all(
    entries.map(async ([dep, version]) => {
      if (version.match(/\d.x/)) {
        return [dep, await getLatestVersion(dep, version)]
      } else {
        return [dep, version]
      }
    }),
  )

  return Object.fromEntries(updated)
}
