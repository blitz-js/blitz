import * as React from "react"
import {GetServerSideProps} from "next"
import {getSessionContext} from "@blitzjs/server"
import {ssrQuery, useRouter} from "blitz"
import getUser from "app/users/queries/getUser"
import logout from "app/auth/mutations/logout"
import {User} from "db"

type PageProps = {
  user: User
}

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
  const session = await getSessionContext(req, res)

  console.log("SESSION USERID: ", session.userId)

  if (!session.userId) {
    res.setHeader("location", "/login")
    res.statusCode = 302
    res.end()
    return {props: {}}
  }

  let user: Partial<User> = {id: 0}
  if (session.userId) {
    user =
      (await ssrQuery(
        getUser,
        {where: {id: session.userId as number}, select: {id: true}},
        {res, req},
      )) || {}
  }

  return {props: {user}}
}

const Test: React.FC<PageProps> = ({user}: PageProps) => {
  const router = useRouter()

  return (
    <div>
      <div>Logged in user id: {user.id}</div>
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
