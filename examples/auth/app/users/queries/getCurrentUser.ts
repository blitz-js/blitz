import db, {FindOneUserArgs} from "db"
import {SessionContext} from "blitz"

type GetUserInput = {
  select?: FindOneUserArgs["select"]
}

export default async function getUser(
  {select = {id: true, name: true, email: true, role: true}}: GetUserInput,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session?.authorize()

  if (!ctx.session?.userId) return null

  const user = await db.user.findOne({where: {id: ctx.session!.userId}, select})

  return user
}
