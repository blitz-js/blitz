import {getSession} from "@blitzjs/auth"
import {rpcAppHandler} from "@blitzjs/rpc"

export const {GET, POST} = rpcAppHandler(
  {},
  {
    async auth(req) {
      return {
        ctx: {
          session: (await getSession(req)).sessionContext,
          prefetchInfiniteQuery: async () => {},
          prefetchQuery: async () => {},
        },
      }
    },
  },
)
