import {QueryClient} from "@tanstack/react-query"
import {BeforeHttpRequest, BeforeHttpResponse} from "blitz"

declare global {
  var queryClient: QueryClient
  var __BLITZ_beforeHttpRequest: BeforeHttpRequest
  var __BLITZ_beforeHttpResponse: BeforeHttpResponse
  // TODO Fix this
  var __BLITZ_onRpcError: (error: any) => any[]
  // TODO Fix this
  var __BLITZ_onSessionCreated: (resetQueryClient: any) => any[]
}
