import {getLatestVersion} from './get-latest-version'
import {Fallbackable} from './fallbackable'

export const fetchLatestVersionsFor = async <T extends Record<string, string>>(
  dependencies: T,
): Promise<Fallbackable<T>> => {
  const entries = Object.entries(dependencies)

  let fallbackUsed = false

  const updated = await Promise.all(
    entries.map(async ([dep, version]) => {
      // We pin experimental versions to ensure they work, so don't auto update experimental
      if (version.match(/\d.x/) && !version.match(/experimental/)) {
        const {value: latestVersion, isFallback} = await getLatestVersion(dep, version)

        if (isFallback) {
          fallbackUsed = true
        }

        return [dep, latestVersion]
      } else {
        return [dep, version]
      }
    }),
  )

  return {
    isFallback: fallbackUsed,
    value: updated.reduce((result, [key, value]) => {
      return Object.assign({}, result, {[key]: value})
    }, {} as T),
  }
}
