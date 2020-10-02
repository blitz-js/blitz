import {protect} from "blitz"
import db from "db"
import * as z from "zod"

export default protect(
  {
    schema: z.object({
      name: z.string(),
    }),
  },
  async function createUser(input, {session}) {
    const user = await db.user.create({data: input})

    return user
  },
)
