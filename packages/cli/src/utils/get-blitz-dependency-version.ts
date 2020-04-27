import { fetchDistTags } from './npm-fetch';
import {log} from '@blitzjs/server';

/**
 * @example const [ version, isFallback ] = await getBlitzDependencyVersion("canary" | string);
 */
export const getBlitzDependencyVersion = async (cliVersion: string): Promise<[ string, boolean ]> => {
  try {
    const { latest, canary } = await fetchDistTags("blitz");
  
    if (cliVersion.includes("canary")) {
      return [ canary, false ];
    }

    return [ latest, false ];
  } catch (error) {
    const fallback = "latest";
    log.error(`Failed to fetch latest version of Blitz, falling back to '${fallback}'.`);
    return [ fallback, true ];
  }
}