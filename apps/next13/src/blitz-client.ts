"use client"
import {AuthClientPlugin} from "@blitzjs/auth"
import {setupBlitzClient} from "@blitzjs/next"
import {BlitzReactQueryPlugin} from "@blitzjs/react-query"

export const {withBlitz, useSession, queryClient, BlitzRscProvider} = setupBlitzClient({
  plugins: [
    AuthClientPlugin({
      cookiePrefix: "web-cookie-prefix",
    }),
    BlitzReactQueryPlugin({}),
  ],
})
