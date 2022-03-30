import {Fallbackable} from "./fallbackable"
import {logFailedVersionFetch} from "./get-latest-version"
import {fetchDistTags} from "./npm-fetch"

export const getBlitzDependencyVersion = async (
  cliVersion: string,
): Promise<Fallbackable<string>> => {
  try {
    const {latest, canary} = await fetchDistTags("blitz")

    if (cliVersion.includes("canary")) {
      return {value: canary, isFallback: false}
    }

    return {value: latest, isFallback: false}
  } catch (error) {
    const fallback = "latest"
    logFailedVersionFetch("blitz", fallback)
    return {value: fallback, isFallback: true}
  }
}
