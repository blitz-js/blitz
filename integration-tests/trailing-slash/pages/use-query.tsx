import getBasic from "../app/queries/getBasic"
import {useSuspenseQuery} from "@blitzjs/rpc"
import {Suspense} from "react"

function Content() {
  const [result] = useSuspenseQuery(getBasic, undefined)
  return <div id="content">{result}</div>
}

function Page() {
  return (
    <div id="page">
      <Suspense fallback={"Loading..."}>
        <Content />
      </Suspense>
    </div>
  )
}

export default Page
