import {
  getSession,
  invokeWithMiddleware,
  useRouter,
  ErrorComponent as ErrorPage,
  useMutation,
  AuthenticationError,
  AuthorizationError,
  GetServerSideProps,
  InferGetServerSidePropsType,
  BlitzPage,
} from "blitz"
import getUser from "app/users/queries/getUser"
import logout from "app/auth/mutations/logout"
import path from "path"

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const session = await getSession(req, res)
  console.log("Session id:", session.userId)
  try {
    const user = await invokeWithMiddleware(
      getUser,
      {where: {id: Number(session.userId)}},
      {res, req},
    )
    return {props: {user}}
  } catch (error) {
    if (error.name === "NotFoundError") {
      res.statusCode = 404
      res.end()
      return {props: {}}
    } else if (error instanceof AuthenticationError) {
      res.writeHead(302, {location: "/login"}).end()
      return {props: {}}
    } else if (error instanceof AuthorizationError) {
      return {
        props: {
          error: {
            statusCode: error.statusCode,
            message: "Sorry, you are not authorized to access this",
          },
        },
      }
    } else {
      return {props: {error: {statusCode: error.statusCode || 500, message: error.message}}}
    }
  }
}

const Test: BlitzPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({user, error}) => {
  const router = useRouter()
  const [logoutMutation] = useMutation(logout)

  if (error) {
    return <ErrorPage statusCode={error.statusCode} title={error.message} />
  }

  return (
    <div>
      <div>Logged in user id: {user?.id}</div>
      <button
        onClick={async () => {
          await logoutMutation()
          router.push("/")
        }}
      >
        Logout
      </button>
    </div>
  )
}

export default Test
