import {H} from "@blitzjs/auth/dist/index-0ecbee46"
import {withBlitzAuth} from "../../../src/blitz-server"

const emptyResponse = async () => {
  return new Response(null, {status: 200})
}

export const {POST, HEAD} = withBlitzAuth({
  POST: emptyResponse,
  HEAD: emptyResponse,
})
