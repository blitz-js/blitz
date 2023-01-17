import { resolver } from "@blitzjs/rpc"
import db from "__prismaFolder__"
import { __ModelName__Schema } from "../validations/schema"

export default resolver.pipe(
  resolver.zod(__ModelName__Schema),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const __modelName__ = await db.__modelName__.create({data: input})

    return __modelName__
  },
)