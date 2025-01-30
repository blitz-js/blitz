"use client"
import {getQueryData, useQuery} from "@blitzjs/rpc"
import {Suspense, useState} from "react"
import getBasic from "../../src/queries/getBasic"

function Content() {
  const [data] = useQuery(getBasic, undefined)
  const [newData, setNewData] = useState<string>()
  return (
    <div>
      <div>{data}</div>
      {newData && <div id="new-data">{newData}</div>}
      <button
        id="button"
        onClick={async () => {
          const newData = getQueryData(getBasic, undefined)
          setNewData(newData)
        }}
      >
        Call getQueryData
      </button>
    </div>
  )
}

export function PageWithGetQueryData() {
  return (
    <div id="page">
      <Content />
    </div>
  )
}
