import {QueryClient} from "@tanstack/react-query"

declare global {
  var queryClient: QueryClient
  var __BLITZ_SUSPENSE_ENABLED: boolean
  var __BLITZ_AUTH_ENABLED: boolean
  var __BLITZ_COOKIE_OPTIONS:
    | undefined
    | {
        antiCSRFToken?: string
        domain?: string
        secure?: boolean
        sameSite?: "lax" | "strict" | "none"
        expires?: Date
      }
}
