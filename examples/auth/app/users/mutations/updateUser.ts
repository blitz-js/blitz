import {protect} from "blitz"
import db from "db"
import * as z from "zod"

export default protect(
  {
    schema: z.object({
      id: z.number(),
      name: z.string(),
    }),
  },
  async function updateUser({id, ...data}, {session}) {
    const user = await db.user.update({where: {id}, data})

    return user
  },
)
