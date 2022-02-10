import {useAuthenticatedSession} from "../src/client-setup"

export default function PgaeWithUseAuthorizeIf() {
  useAuthenticatedSession()
  return <div>This page is using useAuthenticatedSession</div>
}
