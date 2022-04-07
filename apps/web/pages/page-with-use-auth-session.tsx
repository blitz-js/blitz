import {useAuthenticatedSession} from "../src/client-setup"

export default function PageWithUseAuthSession() {
  useAuthenticatedSession()
  return <div>This page is using useAuthenticatedSession</div>
}
