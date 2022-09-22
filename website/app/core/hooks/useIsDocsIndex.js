import {useRouter} from "next/router"

export function useIsDocsIndex() {
  return useRouter().pathname === "/docs"
}
