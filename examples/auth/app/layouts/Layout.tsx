import {useSession, useRouter, useMutation} from "blitz"
import logout from "app/auth/mutations/logout"

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
