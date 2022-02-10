import {useRedirectAuthenticated} from "../src/client-setup"

export default function PgaeWithUseAuthorizeIf() {
  useRedirectAuthenticated("/")
  return <div>This page is using useRedirectAuthenticated</div>
}
