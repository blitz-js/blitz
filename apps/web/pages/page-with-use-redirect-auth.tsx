import {useRedirectAuthenticated} from "@blitzjs/auth"

export default function PgaeWithUseAuthorizeIf() {
  useRedirectAuthenticated("/")
  return <div>This page is using useRedirectAuthenticated</div>
}
