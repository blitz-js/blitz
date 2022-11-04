import {AuthPluginOptions} from "./server"
import {SessionConfigMethods} from "./shared"

declare global {
  var sessionConfig: AuthPluginOptions & SessionConfigMethods
  var __BLITZ_SESSION_COOKIE_PREFIX: string | undefined
  var __BLITZ_SUSPENSE_ENABLED: boolean
}
