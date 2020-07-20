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

export const getServerSideProps: GetServerSideProps = async ({query, req, res}) => {
  const session = await getSessionContext(req, res)

  console.log("SESSION USERID: ", session.userId)

  // if (!session.userId) {
  //   res.setHeader("location", "/login")
  //   res.statusCode = 302
  //   res.end()
  // }

  const user = await ssrQuery(
    getUser,
    {where: {id: (session.userId as number) || 1}, select: {id: true}},
    {res, req},
  )

  return {props: {user}}
}

const Test: React.FC<PageProps> = ({user}: PageProps) => {
  const router = useRouter()

  return (
    <div>
      <div>Testing {user.id}</div>
      <button
        onClick={async () => {
          router.push("/")
          await logout()
        }}
      >
        Logout
      </button>
    </div>
  )
}

export default Test
