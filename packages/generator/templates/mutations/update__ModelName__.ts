import { resolver } from "@blitzjs/rpc"
import db from "__prismaFolder__"
import { Update__ModelName__Schema } from "../schemas"

export default resolver.pipe(
  resolver.zod(Update__ModelName__Schema),
  resolver.authorize(),
  async ({id, ... data}) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const __modelName__ = await db.__modelName__.update({where: {id}, data})

    return __modelName__
  },
)