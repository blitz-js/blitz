import {useSession, useRouter, useMutation, Head, BlitzLayout} from "blitz"
import logout from "app/auth/mutations/logout"

const Layout: BlitzLayout<{title?: string}> = ({title, children}) => {
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

export default Layout
