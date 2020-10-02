import {protect} from "blitz"
import db from "db"
import * as z from "zod"

if (process.env.parentModel) {
  export default protect(
    {
      schema: z.object({
        __parentModelId__: z.number(),
        name: z.string(),
      }),
    },
    async function create__ModelName__({__parentModelId__, ...input}, {session}) {
      const __modelName__ = await db.__modelName__.create({
        data: {...input, __parentModel__: {connect: {id: __parentModelId__}}},
      })

      return __modelName__
    },
  )
} else {
  export default protect(
    {
      schema: z.object({
        name: z.string(),
      }),
    },
    async function create__ModelName__(input, {session}) {
      const __modelName__ = await db.__modelName__.create({data: input})

      return __modelName__
    },
  )
}
