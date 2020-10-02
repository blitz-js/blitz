import {protect, NotFoundError} from "blitz"
import db, {FindFirstUserArgs} from "db"

type GetUserInput = Pick<FindFirstUserArgs, "where">

export default protect({}, async function getUser({where}: GetUserInput, {session}) {
  const user = await db.user.findFirst({where})

  if (!user) throw new NotFoundError()

  return user
})
