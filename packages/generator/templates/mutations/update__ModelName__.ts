import {resolver} from "blitz"
import db from "db"
import * as z from "zod"

const Update__ModelName__ = z.object({
  id: z.number(),
  /* template: __attributeName__: z.__zodTypeName__(), */
}).nonstrict()

export default resolver.pipe(
  resolver.zod(Update__ModelName__),
  resolver.authorize(),
  async ({id, ... data}) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const __modelName__ = await db.__modelName__.update({where: {id}, data})

    return __modelName__
  },
)
