import {BeforeHttpRequest, BeforeHttpResponse} from "./types"
declare global {
  var _blitz_prismaClient: any
  var __BLITZ_MIDDLEWARE_HOOKS: {
    beforeHttpRequest: BeforeHttpRequest
    beforeHttpResponse: BeforeHttpResponse
  }
}
