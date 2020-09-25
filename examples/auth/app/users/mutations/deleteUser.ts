import {Ctx} from "blitz"
import db, {UserDeleteArgs} from "db"

type DeleteUserInput = {
  where: UserDeleteArgs["where"]
}

export default async function deleteUser({where}: DeleteUserInput, _ctx: Ctx) {
  const user = await db.user.delete({where})

  return user
}
