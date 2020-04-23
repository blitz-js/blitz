import {fetchAllVersions, fetchLatestDistVersion} from './npm-fetch'

export const getLatestVersion = async (dependency: string, templateVersion: string) => {
  const major = templateVersion.replace('.x', '')
  const allVersions = await fetchAllVersions(dependency)
  const latestDistVersion = await fetchLatestDistVersion(dependency)

  if (!allVersions || !latestDistVersion) {
    return templateVersion
  }

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
