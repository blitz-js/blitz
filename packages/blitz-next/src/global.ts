import {QueryClient} from "@tanstack/react-query"

declare global {
  var queryClient: QueryClient
  var preRequest: (options: RequestInit) => RequestInit
  var rpcResponse: (response: Response) => void
  var handleError: (error: Error) => void
}
