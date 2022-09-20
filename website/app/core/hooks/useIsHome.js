import {useRouter} from "blitz"

export function useIsHome() {
  return useRouter().pathname === "/"
}
