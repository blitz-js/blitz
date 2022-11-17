import {QueryClient} from "@tanstack/react-query"

declare global {
  var queryClient: QueryClient
  var __BLITZ_preRequest: (options: RequestInit) => RequestInit
  var __BLITZ_rpcResponse: (response: Response) => void
  var __BLITZ_handleError: (error: Error) => void
}
