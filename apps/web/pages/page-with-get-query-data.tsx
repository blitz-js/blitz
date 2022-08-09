import {getQueryData, useQuery} from "@blitzjs/rpc"
import getBasic from "../app/queries/getBasic"
import {useState} from "react"

function PageWithGetQueryData() {
  const [data] = useQuery(getBasic, {})
  const [newData, setNewData] = useState<string>()
  return (
    <div>
      <div>{data}</div>
      {newData && <div id="new-data">{newData}</div>}
      <button
        onClick={async () => {
          const newData = getQueryData(getBasic, {})
          setNewData(newData)
        }}
      >
        Call getQueryData
      </button>
    </div>
  )
}

export default PageWithGetQueryData
