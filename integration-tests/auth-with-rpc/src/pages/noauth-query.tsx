import {useSuspenseQuery} from "@blitzjs/rpc"
import getNoauthBasic from "../queries/getNoauthBasic"
import {Suspense} from "react"

function Content() {
  const [result] = useSuspenseQuery(getNoauthBasic, undefined)
  return <div id="content">{result}</div>
}

function NoAuthQuery() {
  return (
    <div id="page">
      <Suspense fallback={"Loading..."}>
        <Content />
      </Suspense>
    </div>
  )
}

export default NoAuthQuery
