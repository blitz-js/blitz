import {useAuthorizeIf} from "@blitzjs/auth"

export default function PageWithUseAuthorizeIf() {
  useAuthorizeIf(Math.random() > 0.5)
  return <div>This page is using useAuthorizeIf</div>
}
