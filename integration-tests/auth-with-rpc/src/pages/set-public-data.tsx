import {invalidateQuery, useMutation, useQuery} from "@blitzjs/rpc"
import changeRole from "../mutations/changeRole"
import getPublicDataForUser from "../queries/getPublicDataForUser"
import {Suspense} from "react"

function Content() {
  const [publicData] = useQuery(getPublicDataForUser, {userId: 1})
  return (
    <div id="session">
      <>
        <div className="userId">userId: {publicData.userId}</div>
        <div className="role">role: {publicData.role}</div>
      </>
    </div>
  )
}

function SetPublicData() {
  const [changeRoleMutation] = useMutation(changeRole)

  return (
    <div id="page">
      <button
        id="change-role"
        onClick={async () => {
          await changeRoleMutation({userId: 1, role: "new role"})
          await invalidateQuery(getPublicDataForUser)
        }}
      >
        Set new role for user
      </button>
      <Suspense fallback="">
        <Content />
      </Suspense>
    </div>
  )
}

export default SetPublicData
