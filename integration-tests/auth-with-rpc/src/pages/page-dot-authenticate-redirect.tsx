import {useMutation, useQuery} from "@blitzjs/rpc/react-query"
import {BlitzPage} from "@blitzjs/next"
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

const AuthRedirect: BlitzPage = () => {
  return (
    <div id="page">
      <Suspense fallback={"Loading redirect page..."}>
        <Content />
      </Suspense>
    </div>
  )
}

AuthRedirect.authenticate = {redirectTo: "/login"}

export default AuthRedirect
