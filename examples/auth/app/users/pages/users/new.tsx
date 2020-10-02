import React from "react"
import Layout from "app/layouts/Layout"
import {Link, useRouter, useMutation, BlitzPage} from "blitz"
import createUser from "app/users/mutations/createUser"
import UserForm from "app/users/components/UserForm"

const NewUserPage: BlitzPage = () => {
  const router = useRouter()
  const [createUserMutation] = useMutation(createUser)

  return (
    <div>
      <h1>Create New User</h1>

      <UserForm
        initialValues={{}}
        onSubmit={async () => {
          try {
            const user = await createUserMutation({data: {name: "MyName"}})
            alert("Success!" + JSON.stringify(user))
            router.push("/users/[userId]", `/users/${user.id}`)
          } catch (error) {
            alert("Error creating user " + JSON.stringify(error, null, 2))
          }
        }}
      />

      <p>
        <Link href="/users">
          <a>Users</a>
        </Link>
      </p>
    </div>
  )
}

NewUserPage.getLayout = (page) => <Layout title={"Create New User"}>{page}</Layout>

export default NewUserPage
