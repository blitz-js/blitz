import {QueryClient} from "@tanstack/react-query"

declare global {
  var queryClient: QueryClient
  var __BLITZ_SUSPENSE_ENABLED: boolean
  var __BLITZ_AUTH_ENABLED: boolean
  var preRequest: (options: RequestInit) => RequestInit
  var rpcResponse: (response: Response) => void
  var handleError: (error: Error) => void
}
