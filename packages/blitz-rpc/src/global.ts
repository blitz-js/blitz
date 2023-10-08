import type {QueryClient} from "@tanstack/react-query"
import type {LoggerOptions} from "./server/plugin"
import type {Ctx} from "blitz"

declare global {
  var queryClient: QueryClient
  var __BLITZ_SUSPENSE_ENABLED: boolean
  var blitzRpcLoggerOptions: LoggerOptions | undefined
  var __BLITZ_GET_RSC_CONTEXT: () => Promise<Ctx>
}
