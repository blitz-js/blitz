import {QueryClient} from "@tanstack/react-query"

declare global {
  var queryClient: QueryClient
  var __BLITZ_SUSPENSE_ENABLED: boolean
  var __BLITZ_AUTH_ENABLED: boolean
  var preRequestHook: (options: RequestInit) => RequestInit
  var postResponseHook: (response: Response) => void
  var rpcResponseHook: (error: Error) => void
}
