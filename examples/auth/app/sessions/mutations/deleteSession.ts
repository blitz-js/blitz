import {SessionContext} from "blitz"
import db, {SessionDeleteArgs} from "db"

type DeleteSessionInput = {
  where: SessionDeleteArgs["where"]
}

export default async function deleteSession(
  {where}: DeleteSessionInput,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session!.authorize()

  const session = await db.session.delete({where})

  return session
}
