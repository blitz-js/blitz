import {useAuthorize} from "../src/client-setup"

export default function PgaeWithUseAuthorize() {
  useAuthorize()
  return <div>This page is using useAuthorize</div>
}
