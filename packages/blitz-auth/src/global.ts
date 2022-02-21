import {SessionConfig} from "./shared/types"

declare global {
  var sessionConfig: SessionConfig
  var __BLITZ_SESSION_COOKIE_PREFIX: string | undefined
}
