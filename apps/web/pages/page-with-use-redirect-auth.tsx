import {useRedirectAuthenticated} from "../src/client-setup"

export default function PageWithUseRedirectAuth() {
  useRedirectAuthenticated("/")
  return <div>This page is using useRedirectAuthenticated</div>
}
