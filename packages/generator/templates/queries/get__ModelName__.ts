import {Ctx, NotFoundError} from "blitz"
import db, {Prisma} from "db"

type Get__ModelName__Input = Pick<Prisma.__ModelName__FindFirstArgs, "where">

export default async function get__ModelName__({where}: Get__ModelName__Input, ctx: Ctx) {
  ctx.session.authorize()

  const __modelName__ = await db.__modelName__.findFirst({where})

  if (!__modelName__) throw new NotFoundError()

  return __modelName__
}
