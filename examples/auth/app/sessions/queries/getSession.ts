import {NotFoundError, SessionContext} from "blitz"
import db, {FindOneSessionArgs} from "db"

type GetSessionInput = {
  where: FindOneSessionArgs["where"]
  // Only available if a model relationship exists
  // include?: FindOneSessionArgs['include']
}

export default async function getSession(
  {where /* include */}: GetSessionInput,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session!.authorize()

  const session = await db.session.findOne({where})

  if (!session) throw new NotFoundError()

  return session
}
