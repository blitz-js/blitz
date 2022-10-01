import {logFailedVersionFetch} from "./get-latest-version"
import {fetchDistTags} from "./npm-fetch"

const CURRENT_BLITZ_TAG = "latest"

export const getBlitzDependencyVersion = async () => {
  try {
    const result = await fetchDistTags("blitz")

    if (CURRENT_BLITZ_TAG in result) {
      return {value: result[CURRENT_BLITZ_TAG]}
    }

    logFailedVersionFetch("blitz")
    return {value: ""}
  } catch (error) {
    logFailedVersionFetch("blitz")
    return {value: ""}
  }
}
