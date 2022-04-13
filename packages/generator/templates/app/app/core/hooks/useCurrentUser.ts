import { useState, useEffect } from "react"
import { invoke } from "@blitzjs/rpc"
import getCurrentUser from "app/users/queries/getCurrentUser"
import { User } from "@prisma/client"

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null)

  const getUser = async () => {
    const user = await invoke(getCurrentUser, "FROM BROWSER")
    setUser(user)
  }

  useEffect(() => {
    getUser()
  }, [getUser])

  return user
}
