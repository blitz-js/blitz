import {protect} from "blitz"
import db from "db"

export default protect(
  {
    schema: z.object({
      id: z.number(),
      name: z.string(),
    }),
  },
  async function update__ModelName__({id, ...data}, {session}) {
    const __modelName__ = await db.__modelName__.update({where: {id}, data})

    return __modelName__
  },
)
