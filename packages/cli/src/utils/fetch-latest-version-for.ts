import {getLatestVersion} from './get-latest-version'

/**
 * @example const [ latestVersions, fallbackUsed ] = await fetchLatestVersionsFor({ "blitz": "2.x", ... });
 */
export const fetchLatestVersionsFor = async (dependencies: Record<string, string>): Promise<[ Record<string, string>, boolean ]> => {
  const entries = Object.entries(dependencies);

  let fallbackUsed = false;

  const updated = await Promise.all(
    entries.map(async ([dep, version]) => {
      if (version.match(/\d.x/)) {
        const [ latestVersion, isFallback ] = await getLatestVersion(dep, version);

        if (isFallback) {
          fallbackUsed = true;
        }

        return [ dep, latestVersion ];
      } else {
        return [ dep, version ];
      }
    })
  );

  return [ Object.fromEntries(updated), fallbackUsed ];
}
