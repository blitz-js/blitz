import {Ctx} from "blitz"
import { db } from "db"
import {z} from "zod"

if (process.env.parentModel) {
  const Create__ModelName__Input = z.object({
    name: z.string(),
    __parentModelId__: z.number()
  })
} else {
  const Create__ModelName__Input = z.object({
    name: z.string(),
  })
}

export default async function Create__ModelName__(input, ctx: Ctx) {
  Create__ModelName__Input.parse(input)
  ctx.session.$isAuthorized()

  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const __modelName__ = await db.__modelName__.create({data: input})

  return __modelName__

}


