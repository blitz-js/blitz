import type {Ctx} from "blitz"
import type {AuthPluginOptions} from "./server"
import type {SessionConfigMethods} from "./shared"

declare global {
  var sessionConfig: AuthPluginOptions & SessionConfigMethods
  var __BLITZ_SESSION_COOKIE_PREFIX: string | undefined
  var __BLITZ_SUSPENSE_ENABLED: boolean
  var __BLITZ_GET_RSC_CONTEXT: () => Promise<Ctx>
}
