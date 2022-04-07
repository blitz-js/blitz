import {useAuthorizeIf} from "../src/client-setup"

export default function PageWithUseAuthorizeIf() {
  useAuthorizeIf(Math.random() > 0.5)
  return <div>This page is using useAuthorizeIf</div>
}
