import {BlitzPage} from "@blitzjs/next"
import {Suspense, useEffect} from "react"
import {useQuery} from "@blitzjs/rpc"
import getNoauthBasic from "../queries/getNoauthBasic"

const Content = () => {
  const [result] = useQuery(getNoauthBasic, undefined)
  return (
    <>
      <div id="rpc-result">{result}</div>
    </>
  )
}

const CustomPlugin: BlitzPage = () => {
  //send the event to the plugin to create a new session
  useEffect(() => {
    setTimeout(() => {
      const event = new Event("blitz:session-created")
      document.dispatchEvent(event)
    }, 100)
    setTimeout(() => {
      const error = new Error("RPC failed")
      const rpcEvent = new CustomEvent("blitz:rpc-error", {
        detail: error,
      })
      document.dispatchEvent(rpcEvent)
    }, 2000)
  })

  return (
    <div id="root">
      <div id="page">This is the custom plugin page</div>
      <div id="before-req"> Initial Content </div>
      <div id="before-res"> Initial Content </div>
      <Suspense fallback={"Loading..."}>
        <Content />
      </Suspense>
    </div>
  )
}

export default CustomPlugin
