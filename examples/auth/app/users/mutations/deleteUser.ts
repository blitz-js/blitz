import {protect} from "blitz"
import db from "db"
import * as z from "zod"

export default protect(
  {
    schema: z.object({
      id: z.number(),
    }),
  },
  async function deleteUser({id}, {session}) {
    const user = await db.user.delete({where: {id}})

    return user
  },
)
