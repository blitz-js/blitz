import login from "app/mutations/login"
import logout from "app/mutations/logout"
import {useMutation, useSession} from "blitz"
import {useState} from "react"

function Content() {
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
