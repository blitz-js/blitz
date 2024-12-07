import {QueryClient, useMutation, useQuery} from "@blitzjs/rpc"
import logout from "../mutations/logout"
import getAuthenticatedBasic from "../queries/getAuthenticatedBasic"

function Content() {
  const [result, {isLoading, isError, error}] = useQuery(getAuthenticatedBasic, undefined)
  const [logoutMutation] = useMutation(logout)
  if (isError) throw error
  if (isLoading || !result) return <div>Loading...</div>
  return (
    <>
      <div id="content">{result}</div>
      <button
        id="logout"
        onClick={async () => {
          await logoutMutation()
        }}
      >
        logout
      </button>
    </>
  )
}

function AuthenticatedQuery() {
  return (
    <div id="page">
      <Content />
    </div>
  )
}

export default AuthenticatedQuery
