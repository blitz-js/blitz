import {fromBase64} from "b64-lite"
import {PublicData} from "./auth-types"

function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export const parsePublicDataToken = (token: string) => {
  assert(token, "[parsePublicDataToken] Failed: token is empty")

  const publicDataStr = fromBase64(token)
  try {
    const publicData: PublicData = JSON.parse(publicDataStr)
    return {
      publicData,
    }
  } catch (error) {
    throw new Error(`[parsePublicDataToken] Failed to parse publicDataStr: ${publicDataStr}`)
  }
}
