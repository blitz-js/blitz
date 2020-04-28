import {fetchAllVersions, fetchLatestDistVersion} from './npm-fetch'
import {log} from '@blitzjs/server'

/**
 * @example const [ version, isFallback ] = await getLatestVersion("blitz", "2.x");
 */
export const getLatestVersion = async (
  dependency: string,
  templateVersion: string = '',
): Promise<[string, boolean]> => {
  const major = templateVersion.replace('.x', '')

  try {
    const [allVersions, latestDistVersion] = await Promise.all([
      fetchAllVersions(dependency),
      fetchLatestDistVersion(dependency),
    ])

    const latestVersion = Object.keys(allVersions)
      .filter((version) => version.startsWith(major))
      .sort((a, b) => a.localeCompare(b, undefined, {numeric: true}))
      .reverse()[0]

    // If the latest tagged version matches our pinned major, use that, otherwise use the
    // latest untagged which does
    if (latestDistVersion.startsWith(major)) {
      return [latestDistVersion, false]
    } else {
      return [latestVersion, false]
    }
  } catch (error) {
    const fallback = templateVersion
    log.error(`Failed to fetch latest version of '${dependency}', falling back to '${fallback}'.`)
    return [fallback, true]
  }
}
