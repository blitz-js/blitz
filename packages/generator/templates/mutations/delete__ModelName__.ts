import {resolver} from "blitz"
import db from "db"
import {z} from "zod"

const Delete__ModelName__ = z.object({
  id: z.number(), //TODO: Infer Id type from schema
  // template: __fieldName__: z.__zodType__(),
})

export default resolver.pipe(
  resolver.zod(Delete__ModelName__),
  resolver.authorize(),
  async ({id}) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const __modelName__ = await db.__modelName__.deleteMany({where: {id}})

    return __modelName__
  },
)
