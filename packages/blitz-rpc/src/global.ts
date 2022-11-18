import {QueryClient} from "@tanstack/react-query"
import {BeforeHttpRequest, BeforeHttpResponse, OnRpcErrorHook, OnSessionCreatedHook} from "blitz"

declare global {
  var queryClient: QueryClient
  var __BLITZ_SUSPENSE_ENABLED: boolean
  var __BLITZ_beforeHttpRequest: BeforeHttpRequest
  var __BLITZ_beforeHttpResponse: BeforeHttpResponse
  var __BLITZ_onRpcError: OnRpcErrorHook
  var __BLITZ_onSessionCreated: OnSessionCreatedHook
}
