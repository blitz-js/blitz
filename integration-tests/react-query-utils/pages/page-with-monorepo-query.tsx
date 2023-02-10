import {getQueryData, useQuery} from "@blitzjs/rpc"
import {Suspense, useState} from "react"
import getNoSuspenseBasic from "../../no-suspense/app/queries/getNoSuspenseBasic"

function Content() {
  const [data] = useQuery(getNoSuspenseBasic, undefined)
  const [newData, setNewData] = useState<string>()
  return (
    <div>
      <div>{data}</div>
      {newData && <div id="new-data">{newData}</div>}
      <button
        id="button"
        onClick={async () => {
          const newData = getQueryData(getNoSuspenseBasic, undefined)
          setNewData(newData)
        }}
      >
        Call getQueryData
      </button>
    </div>
  )
}

function PageWithGetQueryData() {
  return (
    <div id="page">
      <Suspense fallback={"Loading..."}>
        <Content />
      </Suspense>
    </div>
  )
}

export default PageWithGetQueryData
