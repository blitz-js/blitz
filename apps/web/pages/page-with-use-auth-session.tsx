import {useAuthenticatedSession} from "@blitzjs/auth"

export default function PgaeWithUseAuthorizeIf() {
  useAuthenticatedSession()
  return <div>This page is using useAuthenticatedSession</div>
}
