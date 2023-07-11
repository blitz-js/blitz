import {BeforeHttpRequest, BeforeHttpResponse} from "./types"
declare global {
  var _blitz_prismaClient: any
  var __BLITZ_MIDDLEWARE_HOOKS: {
    beforeHttpRequest: BeforeHttpRequest
    beforeHttpResponse: BeforeHttpResponse
  }
  var __BLITZ_CLEAN_UP_LISTENERS: () => void
}
