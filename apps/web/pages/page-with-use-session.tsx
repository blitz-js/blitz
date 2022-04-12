import {useSession} from "@blitzjs/auth"

export default function PgaeWithUseSession() {
  const data = useSession()
  return <div>{JSON.stringify({data}, null, 2)}</div>
}
