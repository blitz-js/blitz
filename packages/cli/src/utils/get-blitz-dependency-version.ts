import { fetchDistTags } from './npm-fetch';
import {log} from '@blitzjs/server';

export const getBlitzDependencyVersion = async (cliVersion: string) => {
  try {
    const { latest, canary } = await fetchDistTags("blitz");
  
    if (cliVersion.includes("canary")) {
      return canary;
    }

    return latest;
  } catch (error) {
    const fallback = "latest";
    log.error(`Failed to fetch latest version of Blitz, falling back to '${fallback}'.`);
    return fallback;
  }
}