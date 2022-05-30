import getBasic from "../app/queries/getBasic"
import {useQuery} from "@blitzjs/rpc"
import React from "react"

function Content() {
  const [result, {isFetching}] = useQuery(getBasic, undefined)

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
