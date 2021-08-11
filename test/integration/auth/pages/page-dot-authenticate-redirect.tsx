import logout from "app/mutations/logout"
import getAuthenticatedBasic from "app/queries/getAuthenticatedBasic"
import {BlitzPage, useMutation, useQuery} from "blitz"
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
