import {
  BeforeHttpRequest,
  BeforeHttpResponse,
  OnRpcError,
  CreateHook,
  OnSessionCreated,
} from "./types"
declare global {
  var _blitz_prismaClient: any
  var __BLITZ_beforeHttpRequest: BeforeHttpRequest
  var __BLITZ_beforeHttpResponse: BeforeHttpResponse
  var __BLITZ_onRpcError: CreateHook<OnRpcError>
  var __BLITZ_onSessionCreated: CreateHook<OnSessionCreated>
}
