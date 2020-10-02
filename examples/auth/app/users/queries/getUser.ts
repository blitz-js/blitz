import {protect, NotFoundError} from "blitz"
import db, {FindFirstUserArgs} from "db"

type GetUserInput = FindFirstUserArgs["where"]

export default protect({}, async function getUser(input: GetUserInput, {session}) {
  const user = await db.user.findFirst({where: input})

  if (!user) throw new NotFoundError()

  return user
})
