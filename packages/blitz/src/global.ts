import {BeforeHttpRequest, BeforeHttpResponse, OnRpcErrorHook, OnSessionCreatedHook} from "./types"

declare global {
  var _blitz_prismaClient: any
  var __BLITZ_beforeHttpRequest: BeforeHttpRequest
  var __BLITZ_beforeHttpResponse: BeforeHttpResponse
  var __BLITZ_onRpcError: OnRpcErrorHook
  var __BLITZ_onSessionCreated: OnSessionCreatedHook
}
