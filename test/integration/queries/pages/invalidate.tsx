import getIncremented from "app/queries/getIncremented"
import {invalidateQuery, useQuery} from "blitz"
import {Suspense} from "react"

function Content() {
  const [result] = useQuery(getIncremented, undefined)
  return (
    <div>
      <div id="content">{result}</div>
      <button onClick={() => invalidateQuery(getIncremented)}>click me</button>
    </div>
  )
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
