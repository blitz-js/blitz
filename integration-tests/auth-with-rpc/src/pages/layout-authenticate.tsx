import {useMutation, useQuery} from "@blitzjs/rpc"
import {BlitzPage} from "@blitzjs/next"
import AuthenticateLayout from "../layouts/AuthenticateLayout"
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

const LayoutAuthenticatePage: BlitzPage = () => {
  return (
    <div id="page">
      <Suspense fallback={"Loading..."}>
        <Content />
      </Suspense>
    </div>
  )
}

LayoutAuthenticatePage.getLayout = (page) => <AuthenticateLayout>{page}</AuthenticateLayout>

export default LayoutAuthenticatePage
