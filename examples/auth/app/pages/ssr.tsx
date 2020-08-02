import * as React from "react"
import {getSessionContext} from "@blitzjs/server"
import {ssrQuery, useRouter, GetServerSideProps, PromiseReturnType, ErrorComponent} from "blitz"
import getUser from "app/users/queries/getUser"
import logout from "app/auth/mutations/logout"
import path from "path"

type PageProps = {
  user?: PromiseReturnType<typeof getUser>
  error?: {
    statusCode: number
    message: string
  }
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({req, res}) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking

  const session = await getSessionContext(req, res)
  console.log("Session id:", session.userId)
  try {
    const user = await ssrQuery(
      getUser,
      {where: {id: Number(session.userId)}, select: {id: true}},
      {res, req},
    )
    return {props: {user}}
  } catch (error) {
    if (error.name === "NotFoundError") {
      res.statusCode = 404
      res.end()
      return {props: {}}
    } else if (error.name === "AuthenticationError") {
      res.writeHead(302, {location: "/login"})
      res.end()
      return {props: {}}
    } else if (error.name === "AuthorizationError") {
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

const Test: React.FC<PageProps> = ({user, error}: PageProps) => {
  const router = useRouter()

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <div>
      <div>Logged in user id: {user?.id}</div>
      <button
        onClick={async () => {
          await logout()
          router.push("/")
        }}
      >
        Logout
      </button>
    </div>
  )
}

export default Test
