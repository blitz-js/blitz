import {Ctx} from "blitz"
import db, {UserCreateArgs} from "db"

type CreateUserInput = {
  data: UserCreateArgs["data"]
}
export default async function createUser({data}: CreateUserInput, _ctx: Ctx) {
  const user = await db.user.create({data})

  return user
}
