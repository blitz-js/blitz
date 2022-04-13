import {Ctx, NotFoundError} from "blitz"
import { prisma } from "db"
import {z} from "zod"

const Get__ModelName__Input = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, 'Required'),
})

export default async function Get__ModelName__(input, ctx: Ctx) {
  Get__ModelName__Input.parse(input)
  ctx.session.$isAuthorized()

  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const __modelName__ = await prisma.__modelName__.findFirst({where: {id: input.id}})

  if (!__modelName__) throw new NotFoundError()

  return __modelName__
}
