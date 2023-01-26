import { resolver } from "@blitzjs/rpc"
import db from "__prismaFolder__"
import {Delete__ModelName__Schema} from "../schemas"

export default resolver.pipe(
  resolver.zod(Delete__ModelName__Schema),
  resolver.authorize(),
  async ({id}) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const __modelName__ = await db.__modelName__.deleteMany({where: {id}})

    return __modelName__
  },
)