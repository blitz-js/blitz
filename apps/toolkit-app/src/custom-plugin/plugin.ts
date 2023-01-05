import { createClientPlugin } from "blitz"

type CustomPluginOptions = {
  // ... your options
}

export const BlitzCustomPlugin = createClientPlugin<CustomPluginOptions, {}>(
  (options?: CustomPluginOptions) => {
    // ... your plugin code
    console.log("Custom plugin loaded")
    return {
      events: {
        onSessionCreated: async () => {
          // Called when a new session is created - Usually when the user logs in or logs out
          console.log("onSessionCreated in custom plugin")
        },
        onRpcError: async () => {
          // Called when an RPC call fails
          console.log("onRpcError in custom plugin")
        },
      },
      middleware: {
        beforeHttpRequest: (req) => {
          //make changes to the request options before RPC call
          req.headers = { ...req.headers, ...{ customHeader: "customHeaderValue" } }
          return req
        },
        beforeHttpResponse: (res) => {
          //make changes to the response before returning to the caller
          return res
        },
      },
      exports: () => ({
        // ... your exports
      }),
    }
  }
)
