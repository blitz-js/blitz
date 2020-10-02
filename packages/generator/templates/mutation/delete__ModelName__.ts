import {protect} from "blitz"
import db from "db"

export default protect(
  {
    schema: z.object({
      id: z.number(),
    }),
  },
  async function delete__ModelName__({id}, {session}) {
    const __modelName__ = await db.__modelName__.delete({where: {id}})

    return __modelName__
  },
)
