import {resolver} from "blitz"
import { prisma } from "db/index"
import {z} from "zod"

const Update__ModelName__ = z.object({
  id: z.number(),
  name: z.string(),
})

export default async function Update__ModelName__(input, ctx: Ctx) {
  Update__ModelName__.parse(input)
  ctx.session.$isAuthorized()

  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const __modelName__ = await prisma.__modelName__.update({where: {id: input.id}, input})

  return __modelName__

}
