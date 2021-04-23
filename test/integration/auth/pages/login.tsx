import login from "app/mutations/login"
import {useMutation, useSession} from "blitz"

function Content() {
  const session = useSession({suspense: false})
  const [loginMutation] = useMutation(login)
  return (
    <div>
      <div id="content">{session.userId ? "logged-in" : "logged-out"}</div>
      <button
        id="login"
        onClick={async () => {
          await loginMutation()
        }}
      >
        login
      </button>
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
