import {useSession, useRouter, useMutation, Head} from "blitz"
import logout from "app/auth/mutations/logout"

export default function Layout({title, children}: {title?: string; children: React.ReactNode}) {
  const session = useSession({suspense: false})
  const router = useRouter()
  const [logoutMutation] = useMutation(logout)
  return (
    <>
      <Head>
        <title>{title || "__name__"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        {session.userId && (
          <button
            onClick={async () => {
              await logoutMutation()
              router.push("/")
            }}
          >
            Logout
          </button>
        )}
        <div>{children}</div>
      </div>
    </>
  )
}
