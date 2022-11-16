import {QueryClient} from "@tanstack/react-query"

declare global {
  var queryClient: QueryClient
  var preRequestHook: (options: RequestInit) => RequestInit
  var postResponseHook: (response: Response) => void
  var rpcResponseHook: (error: Error) => void
}
