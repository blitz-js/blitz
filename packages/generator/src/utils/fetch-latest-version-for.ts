import {getLatestVersion} from './get-latest-version'
import {Fallbackable} from './fallbackable'

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
        if (version.match(/\d.x/)) {
          const {value: latestVersion, isFallback} = await getLatestVersion(dep, version)

          if (isFallback) {
            fallbackUsed = true
          }

          return [dep, latestVersion]
        } else {
          return [dep, version]
        }
      },
    ),
  )

  return {
    isFallback: fallbackUsed,
    value: fromEntries(updated) as T,
  }
}
