"use client"

import {useQuery} from "@blitzjs/rpc"
import getCurrentUser from "../src/users/queries/getCurrentUser"

export default function Test() {
  const [user] = useQuery(getCurrentUser, undefined)
  console.log(user)
  return (
    <div>
      <h1>Test</h1>
      <p>{user?.email}</p>
    </div>
  )
}
