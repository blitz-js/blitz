import React from "react"
import {Head, Link, useRouter, useParam, BlitzPage} from "blitz"
import createUser from "app/users/mutations/createUser"
import UserForm from "app/users/components/UserForm"

const NewUserPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <div>
      <Head>
        <title>New User</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Create New User </h1>

        <UserForm
          initialValues={{}}
          onSubmit={async () => {
            try {
              const user = await createUser({data: {name: "MyName"}})
              alert("Success!" + JSON.stringify(user))
              router.push("/users/[userId]", `/users/${user.id}`)
            } catch (error) {
              alert("Error creating user " + JSON.stringify(error, null, 2))
            }
          }}
        />

        <p>
          {
            <Link href="/users">
              <a>Users</a>
            </Link>
          }
        </p>
      </main>
    </div>
  )
}

export default NewUserPage
