import login from "app/mutations/login"
import logout from "app/mutations/logout"
import {useMutation, useRouter, useSession} from "blitz"
import {useState} from "react"

function Content() {
  const router = useRouter()
  const [error, setError] = useState(null)
  const session = useSession({suspense: false})
  const [loginMutation] = useMutation(login)
  const [logoutMutation] = useMutation(logout)

  if (error) return <div id="error">{error}</div>

  return (
    <div>
      <div id="content">{session.userId ? "logged-in" : "logged-out"}</div>
      {session.userId ? (
        <button
          id="logout"
          onClick={async () => {
            try {
              await logoutMutation()
            } catch (error) {
              setError(error)
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

function Page() {
  return (
    <div id="page">
      <Content />
    </div>
  )
}

export default Page
