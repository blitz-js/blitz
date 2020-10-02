import React, {Suspense} from "react"
import Layout from "app/layouts/Layout"
import {Link, useRouter, useQuery, useMutation, useParam, BlitzPage} from "blitz"
import getUser from "app/users/queries/getUser"
import updateUser from "app/users/mutations/updateUser"
import UserForm from "app/users/components/UserForm"

export const EditUser = () => {
  const router = useRouter()
  const userId = useParam("userId", "number")
  const [user, {mutate}] = useQuery(getUser, {where: {id: userId}})
  const [updateUserMutation] = useMutation(updateUser)

  return (
    <div>
      <h1>Edit User {user.id}</h1>
      <pre>{JSON.stringify(user)}</pre>

      <UserForm
        initialValues={user}
        onSubmit={async () => {
          try {
            const updated = await updateUserMutation({
              where: {id: user.id},
              data: {name: "MyNewName"},
            })
            await mutate(updated)
            alert("Success!" + JSON.stringify(updated))
            router.push("/users/[userId]", `/users/${updated.id}`)
          } catch (error) {
            console.log(error)
            alert("Error creating user " + JSON.stringify(error, null, 2))
          }
        }}
      />
    </div>
  )
}

const EditUserPage: BlitzPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditUser />
      </Suspense>

      <p>
        <Link href="/users">
          <a>Users</a>
        </Link>
      </p>
    </div>
  )
}

EditUserPage.getLayout = (page) => <Layout title={"Edit User"}>{page}</Layout>

export default EditUserPage
