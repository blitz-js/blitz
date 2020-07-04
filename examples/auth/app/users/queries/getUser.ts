import db, {FindOneUserArgs} from "db"
import {authorize} from "blitz"

type GetUserInput = {
  where: FindOneUserArgs["where"]
  // Only available if a model relationship exists
  // include?: FindOneUserArgs['include']
}

export default authorize(["admin"], async function getUser({where /* include */}: GetUserInput) {
  const user = await db.user.findOne({where})

  return user
})
