import {useState} from "react"
import {useMutation} from "@blitzjs/rpc"
import createUser from "src/mutations/createUser"
import {User} from "db"

function Page() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [createUserMutation, {error}] = useMutation(createUser)
  const [newUser, setNewUser] = useState<null | User>(null)

  return (
    <div>
      New User Form:
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const user = await createUserMutation({name, email})
          setNewUser(user)
        }}
      >
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Email:
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button type="submit">Create User</button>
      </form>
      <div style={{paddingTop: 20}}>
        <div>Error: {JSON.stringify(error, null, 2)}</div>
        New user: {JSON.stringify(newUser, null, 2)}
      </div>
    </div>
  )
}

export default Page
