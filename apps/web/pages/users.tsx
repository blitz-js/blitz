import {useQuery} from "@blitzjs/rpc"
import getUsers from "app/queries/getUsers"

function UsersPage() {
  const [users] = useQuery(getUsers, {})
  return (
    <div>
      Users:
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UsersPage
