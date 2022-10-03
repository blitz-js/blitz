import { resolver } from "@blitzjs/rpc"
import db from "__prismaFolder__"
import {z} from "zod"

if (process.env.parentModel) {
  const Create__ModelName__ = z.object({
    __parentModelId__: z.__parentModelIdZodType__(),
    // template: __fieldName__: z.__zodType__(),
  })
} else {
  const Create__ModelName__ = z.object({
     // template: __fieldName__: z.__zodType__(),
  })
}

export default resolver.pipe(
  resolver.zod(Create__ModelName__),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const __modelName__ = await db.__modelName__.create({data: input})

    return __modelName__
  },
)