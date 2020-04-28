import {fetchDistTags} from './npm-fetch'

export const getBlitzDependencyVersion = async (cliVersion: string) => {
  const {latest, canary} = await fetchDistTags('blitz')

  if (cliVersion.includes('canary')) {
    return canary
  }

  return latest
}
