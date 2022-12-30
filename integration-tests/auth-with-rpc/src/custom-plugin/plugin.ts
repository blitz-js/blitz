import {createClientPlugin} from "blitz"

type CustomPluginOptions = {
  // ... your options
}

export const BlitzCustomPlugin = createClientPlugin<CustomPluginOptions, {}>(
  (options?: CustomPluginOptions) => {
    // ... your plugin code
    console.info("Custom plugin loaded")
    return {
      events: {
        onSessionCreated: async () => {
          // ... Called when a new session is created - Usually when the user logs in or logs out
          // if the document url is /custom-plugin then write message to the document
          if (document.location.pathname === "/custom-plugin") {
            //find the content in div id page and write message
            document.getElementById("page")!.innerText = "Custom plugin Session Created"
          }
        },
        onRpcError: async () => {
          // ... Called when an RPC call fails
          if (document.location.pathname === "/custom-plugin") {
            document.getElementById("page")!.innerText = "Custom plugin RPC Error"
          }
        },
      },
      middleware: {
        beforeHttpRequest: (req) => {
          // ... make changes to the request options before RPC call
          if (document.location.pathname === "/custom-plugin") {
            req.headers = {...req.headers, ...{customHeader: "customHeaderValue"}}
            document.getElementById("before-req")!.innerText = req.headers["customHeader"]
          }
          return req
        },
        beforeHttpResponse: (res) => {
          // ... make changes to the response before returning to the caller
          if (document.location.pathname === "/custom-plugin") {
            document.getElementById("before-res")!.innerText = res.headers.get("content-length")!
          }
          return res
        },
      },
      exports: () => ({
        // ... your exports
      }),
    }
  },
)
