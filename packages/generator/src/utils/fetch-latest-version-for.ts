import {Fallbackable} from "./fallbackable"
import {getLatestVersion} from "./get-latest-version"

function fromEntries<K extends number | string, V extends any>(entries: [K, V][]): Record<K, V> {
  return entries.reduce<Record<K, V>>((result, [key, value]) => {
    return Object.assign({}, result, {[key]: value})
  }, {} as Record<K, V>)
}

export const fetchLatestVersionsFor = async <T extends Record<string, string>>(
  dependencies: T,
): Promise<Fallbackable<T>> => {
  const entries = Object.entries(dependencies)

  let fallbackUsed = false

  const updated = await Promise.all(
    entries.map(
      async ([dep, version]): Promise<[string, string]> => {
        let skipFetch = false

        if (!version.match(/\d.x/)) skipFetch = true

        // We pin experimental versions to ensure they work, so don't auto update experimental
        if (version.match(/experimental/)) skipFetch = true

        if (skipFetch) {
          return [dep, version]
        } else {
          const {value: latestVersion, isFallback} = await getLatestVersion(dep, version)

          if (isFallback) {
            fallbackUsed = true
          }

          return [dep, latestVersion]
        }
      },
    ),
  )

  return {
    isFallback: fallbackUsed,
    value: fromEntries(updated) as T,
  }
}
