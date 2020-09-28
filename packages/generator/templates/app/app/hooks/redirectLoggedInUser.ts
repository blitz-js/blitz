import { useRouter, useSession } from "@blitzjs/core"
import { useEffect } from "react"

export const useRedirectLoggedInUser = (url: string) => {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session.userId) {
      router.push(url, url)
    }
  }, [session, router])
}
