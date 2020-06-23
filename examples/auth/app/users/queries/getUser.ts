import db, {FindOneUserArgs} from "db"

type GetUserInput = {
  where: FindOneUserArgs["where"]
  // Only available if a model relationship exists
  // include?: FindOneUserArgs['include']
}

export default async function getUser(
  {where /* include */}: GetUserInput,
  ctx: Record<any, any> = {},
) {
  const user = await db.user.findOne({where})

  return user
}
