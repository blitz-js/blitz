import {resolver} from "blitz"
import db from "db"
import * as z from "zod"

if (process.env.parentModel) {
  const Create__ModelName__ = z.object({
    /* template: __attributeName__: z.__zodTypeName__(), */
    __parentModelId__: z.number()
  }).nonstrict()
} else {
  const Create__ModelName__ = z.object({
    /* template: __attributeName__: z.__zodTypeName__(), */
  }).nonstrict()
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
