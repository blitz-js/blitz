import fetch from 'node-fetch'

const fetchAllVersions = async (dependency: string) => {
  const res = await fetch(`https://registry.npmjs.org/${dependency}`)
  const json = await res.json()
  return json.versions as string[]
}

const fetchLatestDistVersion = async (dependency: string) => {
  const res = await fetch(`https://registry.npmjs.org/-/package/${dependency}/dist-tags`)
  const json = await res.json()
  return json.latest as string
}

export const getLatestVersion = async (dependency: string, major: string) => {
  const allVersions = await fetchAllVersions(dependency)
  const latestDistVersion = await fetchLatestDistVersion(dependency)

  const latestVersion = Object.keys(allVersions)
    .filter((version) => version.startsWith(major))
    .sort((a, b) => a.localeCompare(b, undefined, {numeric: true}))[0]

  // If the latest tagged version matches our pinned major, use that, otherwise use the
  // latest untagged which does
  if (latestDistVersion.startsWith(major)) {
    return latestDistVersion
  } else {
    return latestVersion
  }
}
