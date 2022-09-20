import {useRouter} from "blitz"

export function useIsDocsIndex() {
  return useRouter().pathname === "/docs"
}
