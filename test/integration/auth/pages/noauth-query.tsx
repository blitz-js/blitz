import getNoauthBasic from "app/queries/getNoauthBasic"
import {useQuery} from "blitz"
import {Suspense} from "react"

function Content() {
  const [result] = useQuery(getNoauthBasic, undefined)
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
