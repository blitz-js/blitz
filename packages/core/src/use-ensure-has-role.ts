import {AuthenticationError, AuthorizationError, useSession} from "@blitzjs/core"
import {useEffect} from "react"

export function useEnsureHasRole(role: string | Array<string>) {
  const session = useSession()

  useEffect(() => {
    if (!session.isLoading) {
      if (!session.userId) {
        throw new AuthenticationError()
      }

      if (Array.isArray(role)) {
        if (!session.roles.some((r) => role.indexOf(r) !== -1)) {
          throw new AuthorizationError()
        }
      } else {
        if (session.roles.indexOf(role) !== -1) {
          throw new AuthorizationError()
        }
      }
    }
  }, [role, session])
}
