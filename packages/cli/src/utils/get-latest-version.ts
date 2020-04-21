import fetch from 'node-fetch'

export const getLatestDistVersion = async (dependency: string) => {
  const res = await fetch(`https://registry.npmjs.org/-/package/${dependency}/dist-tags`)
  const json = await res.json()
  return json.latest as string
}

export const getLatestVersion = async (dependency: string, major: string) => {
  const res = await fetch(`https://registry.npmjs.org/${dependency}`)
  const json = await res.json()
  const versions = Object.keys(json.versions)
    .filter((version) => version.startsWith(major))
    .sort((a, b) => a.localeCompare(b, undefined, {numeric: true}))

  const latestVersion = versions[0]
  const latestDistVersion = await getLatestDistVersion(dependency)

  // If the latest tagged version matches our pinned major, use that, otherwise use the
  // latest untagged which does
  if (latestDistVersion.startsWith(major)) {
    return latestDistVersion
  } else {
    return latestVersion
  }
}
