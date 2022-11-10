import {useAuthenticatedSession} from "@blitzjs/auth"

export default function PageWithUseAuthSession() {
  useAuthenticatedSession()
  return <div>This page is using useAuthenticatedSession</div>
}
