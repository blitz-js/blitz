import {Ctx} from "blitz"
import { prisma } from "db"
import {z} from "zod"

const Delete__ModelName__Input = z.object({
  id: z.number(),
})

export default async function Delete__ModelName__(input, ctx: Ctx) {
  Delete__ModelName__Input.parse(input)
  ctx.session.$isAuthorized()

  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const __modelName__ = await prisma.__modelName__.deleteMany({where: {id: input.id}})

  return __modelName__

}
