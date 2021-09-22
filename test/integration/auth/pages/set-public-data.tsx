import changeRole from "app/mutations/changeRole"
import getPublicDataForUser from "app/queries/getPublicDataForUser"
import {invalidateQuery, useMutation, useQuery} from "blitz"
import {Suspense} from "react"

function Content() {
  const [publicData] = useQuery(getPublicDataForUser, {userId: 1})
  return (
    <div id="session">
      {publicData.map((pD) => (
        <>
          <div className="userId">userId: {pD.userId}</div>
          <div className="role">role: {pD.role}</div>
        </>
      ))}
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
