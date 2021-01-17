import {useQuery} from "blitz"
import getCurrentUser from "app/users/queries/getCurrentUser"

export const useCurrentUser = () => {
  return useQuery(getCurrentUser, null)
}
