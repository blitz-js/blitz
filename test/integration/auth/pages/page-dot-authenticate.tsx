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

const Authenticate: BlitzPage = () => {
  if (typeof window !== "undefined") {
    throw new Error("This code should never run")
  }
  return (
    <div id="page">
      <Suspense fallback={"Loading..."}>
        <Content />
      </Suspense>
    </div>
  )
}

Authenticate.authenticate = true

export default Authenticate
