import React, {Suspense} from "react"
import Layout from "app/layouts/Layout"
import {Link, useRouter, useQuery, useParam, BlitzPage} from "blitz"
import getUser from "app/users/queries/getUser"
import deleteUser from "app/users/mutations/deleteUser"

export const User = () => {
  const router = useRouter()
  const userId = useParam("userId", "number")
  const [user] = useQuery(getUser, {id: userId})

  return (
    <div>
      <h1>User {user.id}</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>

      <Link href="/users/[userId]/edit" as={`/users/${user.id}/edit`}>
        <a>Edit</a>
      </Link>

      <button
        type="button"
        onClick={async () => {
          if (window.confirm("This will be deleted")) {
            await deleteUser({id: user.id})
            router.push("/users")
          }
        }}
      >
        Delete
      </button>
    </div>
  )
}

const ShowUserPage: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href="/users">
          <a>Users</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <User />
      </Suspense>
    </div>
  )
}

ShowUserPage.getLayout = (page) => <Layout title={"User"}>{page}</Layout>

export default ShowUserPage
