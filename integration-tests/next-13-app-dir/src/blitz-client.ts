"use client"
import {AuthClientPlugin} from "@blitzjs/auth"
import {setupBlitzClient} from "@blitzjs/next"
import {BlitzRpcPlugin} from "@blitzjs/rpc"

export const {withBlitz, useSession, queryClient, BlitzProvider} = setupBlitzClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "auth-tests-cookie-prefix",
    }),
    BlitzRpcPlugin({}),
  ],
})
