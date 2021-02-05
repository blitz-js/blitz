import {resolver} from "blitz"
import db from "db"
import * as z from "zod"

const Delete__ModelName__ = z.object({
  id: z.number(),
}).nonstrict()

export default resolver.pipe(
  resolver.zod(Delete__ModelName__),
  resolver.authorize(),
  async ({id}) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const __modelName__ = await db.__modelName__.delete({where: {id}})

    return __modelName__
  },
)
