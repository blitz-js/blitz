import {Fallbackable} from "./fallbackable"
import {logFailedVersionFetch} from "./get-latest-version"
import {fetchDistTags} from "./npm-fetch"

export const getBlitzDependencyVersion = async (
  cliVersion: string,
): Promise<Fallbackable<string>> => {
  try {
    const {alpha} = await fetchDistTags("blitz")

    if (cliVersion.includes("alpha")) {
      return {value: alpha}
    }

    logFailedVersionFetch("blitz")
    return {value: ""}
  } catch (error) {
    logFailedVersionFetch("blitz")
    return {value: ""}
  }
}
