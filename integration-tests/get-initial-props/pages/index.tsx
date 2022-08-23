import {Suspense} from "react"

function Page(props) {
  return (
    <div id="page">
      <Suspense fallback={"Loading..."}>
        <div id="content">{JSON.stringify(props, null, 2)}</div>
      </Suspense>
    </div>
  )
}

export default Page
