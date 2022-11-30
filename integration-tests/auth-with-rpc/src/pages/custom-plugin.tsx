import {BlitzPage} from "@blitzjs/next"
import {useEffect} from "react"

const CustomPlugin: BlitzPage = () => {
  //send the event to the plugin to create a new session
  useEffect(() => {
    setTimeout(() => {
      const event = new Event("blitz:session-created")
      document.dispatchEvent(event)
    }, 1000)
    setTimeout(() => {
      const error = new Error("RPC failed")
      const rpcEvent = new CustomEvent("blitz:rpc-error", {
        detail: error,
      })
      document.dispatchEvent(rpcEvent)
    }, 1000)
  })

  return <div id="page">This is the custom plugin page</div>
}

export default CustomPlugin
