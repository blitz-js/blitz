import React, {Suspense} from "react"
import {Head, Link, useQuery, BlitzPage} from "blitz"
import getUsers from "app/users/queries/getUsers"
import Layout from "app/layouts/Layout"

export const UsersList = () => {
  const [users] = useQuery(getUsers, {orderBy: {id: "desc"}})

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>
          <Link href="/users/[userId]" as={`/users/${user.id}`}>
            <a>{user.email}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}

const UsersPage: BlitzPage = () => {
  return (
    <Layout>
      <Head>
        <title>Users</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Users</h1>

        <p>
          {
            <Link href="/users/new">
              <a>Create User</a>
            </Link>
          }
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <UsersList />
        </Suspense>
      </main>
    </Layout>
  )
}

export default UsersPage
