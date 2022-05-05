import {useQuery} from "@blitzjs/rpc"
import {Suspense} from "react"
import getBasic from "../app/queries/getBasic"

function Content() {
  const [result] = useQuery(getBasic, undefined)
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
