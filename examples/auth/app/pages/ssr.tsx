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

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
  const session = await getSession(req, res)
  console.log("Session id:", session.userId)
  try {
    const user = await invokeWithMiddleware(
      getUser,
      {where: {id: Number(session.userId)}},
      {res, req},
    )
    return {props: {user}}
  } catch (error: any) {
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

const PageSSR: BlitzPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  user,
  error,
}) => {
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

export default PageSSR
