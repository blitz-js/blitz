import "./global"
import {createClientPlugin} from "blitz"
import {DefaultOptions, QueryClient} from "@tanstack/react-query"

export * from "./data-client/index"

interface BlitzRpcOptions {
  reactQueryOptions?: DefaultOptions
}
export const BlitzRpcPlugin = createClientPlugin<BlitzRpcOptions, {queryClient: QueryClient}>(
  (options?: BlitzRpcOptions) => {
    const initializeQueryClient = () => {
      const {reactQueryOptions} = options || {}
      let suspenseEnabled = reactQueryOptions?.queries?.suspense ?? true
      if (!process.env.CLI_COMMAND_CONSOLE && !process.env.CLI_COMMAND_DB) {
        globalThis.__BLITZ_SUSPENSE_ENABLED = suspenseEnabled
      }

      return new QueryClient({
        defaultOptions: {
          ...reactQueryOptions,
          queries: {
            ...(typeof window === "undefined" && {cacheTime: 0}),
            retry: (failureCount: number, error: any) => {
              if (process.env.NODE_ENV !== "production") return false

              // Retry (max. 3 times) only if network error detected
              if (error.message === "Network request failed" && failureCount <= 3) return true

              return false
            },
            ...reactQueryOptions?.queries,
            suspense: suspenseEnabled,
          },
        },
      })
    }
    const queryClient = initializeQueryClient()
    globalThis.queryClient = queryClient
    return {
      events: {},
      middleware: {},
      exports: () => ({
        queryClient,
      }),
    }
  },
)
