import getNoSuspenseBasic from "../app/queries/getNoSuspenseBasic"
import {useQuery} from "@blitzjs/rpc"
import React from "react"

function Content() {
  const [result, {isFetching}] = useQuery(getNoSuspenseBasic, undefined)

  if (isFetching) {
    return <>Loading...</>
  } else {
    return <div id="content">{result}</div>
  }
}

function Page() {
  return (
    <div id="page">
      <Content />
    </div>
  )
}

export default Page
