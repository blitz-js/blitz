import {useRedirectAuthenticated} from "@blitzjs/auth"

export default function PageWithUseRedirectAuth() {
  useRedirectAuthenticated("/")
  return <div>This page is using useRedirectAuthenticated</div>
}
