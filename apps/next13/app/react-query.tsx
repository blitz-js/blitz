"use client"

import {useQuery, useMutation} from "@blitzjs/react-query"
import logout from "../src/auth/mutations/logout"
import getCurrentUser from "../src/users/queries/getCurrentUser"

export default function Test() {
  const [user] = useQuery(getCurrentUser, null)
  const [logoutMutation] = useMutation(logout)
  console.log(user)
  return (
    <div>
      <h1>Test</h1>
      <p>{user?.email}</p>
      <button
        className="button small"
        onClick={async () => {
          await logoutMutation()
        }}
      >
        Logout
      </button>
    </div>
  )
}
