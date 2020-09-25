import {Ctx} from "blitz"
import db, {UserUpdateArgs} from "db"

type UpdateUserInput = {
  where: UserUpdateArgs["where"]
  data: UserUpdateArgs["data"]
}

export default async function updateUser({where, data}: UpdateUserInput, _ctx: Ctx) {
  const user = await db.user.update({where, data})

  return user
}
