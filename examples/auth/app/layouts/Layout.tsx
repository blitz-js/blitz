import logout from "app/modules/auth/mutations/logout"
import {useMutation, useRouter, useSession} from "blitz"

export default function Layout({children}: {children: React.ReactNode}) {
  const session = useSession()
  const router = useRouter()
  const [logoutMutation] = useMutation(logout)
  return (
    <div>
      {session.userId && (
        <button
          onClick={async () => {
            router.push("/")
            await logoutMutation()
          }}
        >
          Logout
        </button>
      )}
      <div>{children}</div>
    </div>
  )
}
