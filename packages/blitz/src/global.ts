import {
  BeforeHttpRequest,
  BeforeHttpResponse,
  OnRpcError,
  EventHook,
  OnSessionCreated,
} from "./types"
declare global {
  var _blitz_prismaClient: any
  var __BLITZ_beforeHttpRequest: BeforeHttpRequest
  var __BLITZ_beforeHttpResponse: BeforeHttpResponse
  var __BLITZ_onRpcError: EventHook<OnRpcError>
  var __BLITZ_onSessionCreated: EventHook<OnSessionCreated>
}
