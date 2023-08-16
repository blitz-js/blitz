import { useQuery } from "@blitzjs/rpc"
import getCurrentUser from "src/users/queries/getCurrentUser"

export const useCurrentUser = () => {
  console.log("useCurrentUser")
  const [user] = useQuery(getCurrentUser, null)
  return user
}
