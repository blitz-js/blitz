import {useRouter} from "next/router"
import {useMutation, useQuery} from "@blitzjs/rpc"
import login from "../mutations/login"
import logout from "../mutations/logout"
import getCurrentUser from "../queries/getCurrentUser"
import {Suspense, useState} from "react"

function Content() {
  const router = useRouter()
  const [error, setError] = useState(null)
  const [userId] = useQuery(getCurrentUser, null)
  const [loginMutation] = useMutation(login)
  const [logoutMutation] = useMutation(logout)

  if (error) return <div id="error">{error}</div>

  return (
    <div>
      <div id="content">{userId ? "logged-in" : "logged-out"}</div>
      {userId ? (
        <button
          id="logout"
          onClick={async () => {
            try {
              await logoutMutation()
            } catch (error: any) {
              setError(error.toString())
            }
          }}
        >
          logout
        </button>
      ) : (
        <button
          id="login"
          onClick={async () => {
            await loginMutation()

            const next = router.query.next ? decodeURIComponent(router.query.next as string) : null
            if (next) {
              await router.push(next)
            }
          }}
        >
          login
        </button>
      )}
    </div>
  )
}

function Login() {
  return (
    <div id="page">
      <Suspense fallback="Loading...">
        <Content />
      </Suspense>
    </div>
  )
}

export default Login
