import {useAuthorize} from "@blitzjs/auth"

export default function PgaeWithUseAuthorize() {
  useAuthorize()
  return <div>This page is using useAuthorize</div>
}
