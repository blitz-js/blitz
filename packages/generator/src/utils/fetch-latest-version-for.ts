import {getLatestVersion} from './get-latest-version'
import {Fallbackable} from './fallbackable'

export const fetchLatestVersionsFor = async <T extends Record<string, string>>(
  dependencies: T,
): Promise<Fallbackable<T>> => {
  const entries = Object.entries(dependencies)

  let fallbackUsed = false

  const updated = await Promise.all(
    entries.map(async ([dep, version]) => {
      let skipFetch = false

      if (!version.match(/\d.x/)) skipFetch = true

      // We pin experimental versions to ensure they work, so don't auto update experimental
      if (version.match(/experimental/)) skipFetch = true

      // TODO: remove once 2.32.1+ is released
      if (version.match(/typescript-eslint/)) skipFetch = true

      if (skipFetch) {
        return [dep, version]
      } else {
        const {value: latestVersion, isFallback} = await getLatestVersion(dep, version)

        if (isFallback) {
          fallbackUsed = true
        }

        return [dep, latestVersion]
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
