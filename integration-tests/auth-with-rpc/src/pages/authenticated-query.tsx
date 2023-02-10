import {useMutation, useQuery} from "@blitzjs/rpc"
import logout from "../mutations/logout"
import getAuthenticatedBasic from "../queries/getAuthenticatedBasic"
import {Suspense} from "react"

function Content() {
  const [result] = useQuery(getAuthenticatedBasic, undefined)
  const [logoutMutation] = useMutation(logout)
  return (
    <div>
      <div id="content">{result}</div>
      <button
        id="logout"
        onClick={async () => {
          await logoutMutation()
        }}
      >
        logout
      </button>
    </div>
  )
}

function AuthenticatedQuery() {
  return (
    <div id="page">
      <Suspense fallback={"Loading..."}>
        <Content />
      </Suspense>
    </div>
  )
}

export default AuthenticatedQuery
