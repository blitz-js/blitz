import { fetchDistTags } from './npm-fetch';

export const getBlitzDependencyVersion = async (cliVersion: string) => {
  try {
    const { latest, canary } = await fetchDistTags("blitz");
  
    if (cliVersion.includes("canary")) {
      return canary;
    }

    return latest;
  } catch (error) {
    const fallback = "latest";
    return fallback;
  }
}