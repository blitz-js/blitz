import {SessionContext} from "blitz"
import db, {SessionCreateArgs} from "db"

type CreateSessionInput = {
  data: SessionCreateArgs["data"]
}
export default async function createSession(
  {data}: CreateSessionInput,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session!.authorize()

  const session = await db.session.create({data})

  return session
}
