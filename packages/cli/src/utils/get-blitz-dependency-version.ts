import {fetchDistTags} from './npm-fetch'
import {log} from '@blitzjs/server'
import {Fallbackable} from './fallbackable'

export const getBlitzDependencyVersion = async (cliVersion: string): Promise<Fallbackable<string>> => {
  try {
    const {latest, canary} = await fetchDistTags('blitz')

    if (cliVersion.includes('canary')) {
      return {value: canary, isFallback: false}
    }

    return {value: latest, isFallback: false}
  } catch (error) {
    const fallback = 'latest'
    log.error(`Failed to fetch latest version of Blitz, falling back to '${fallback}'.`)
    return {value: fallback, isFallback: true}
  }
}
