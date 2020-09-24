import {SessionContext} from "blitz"
import db, {SessionUpdateArgs} from "db"

type UpdateSessionInput = {
  where: SessionUpdateArgs["where"]
  data: SessionUpdateArgs["data"]
}

export default async function updateSession(
  {where, data}: UpdateSessionInput,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session!.authorize()

  const session = await db.session.update({where, data})

  return session
}
