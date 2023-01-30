import { useQuery } from "@blitzjs/react-query"
import getCurrentUser from "src/users/queries/getCurrentUser"

export const useCurrentUser = () => {
  const [user] = useQuery(getCurrentUser, null)
  return user
}
