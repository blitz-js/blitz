import {useSession, useRouter} from "blitz"
import logout from "app/auth/mutations/logout"

export default function Layout({children}: {children: React.ReactNode}) {
  const session = useSession()
  const router = useRouter()
  return (
    <div>
      {session.userId && (
        <button
          onClick={async () => {
            router.push("/")
            await logout()
          }}
        >
          Logout
        </button>
      )}
      <div>{children}</div>
    </div>
  )
}
