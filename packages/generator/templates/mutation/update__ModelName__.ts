import {Ctx} from "blitz"
import db, {Prisma} from "db"

if (process.env.parentModel) {
  type Update__ModelName__Input = {
    where: Prisma.__ModelName__UpdateArgs["where"]
    data: Omit<Prisma.__ModelName__UpdateArgs["data"], "__parentModel__">
    __parentModelId__: number
  }
} else {
  type Update__ModelName__Input = Pick<Prisma.__ModelName__UpdateArgs, "where" | "data">
}

export default async function update__ModelName__(
  {where, data}: Update__ModelName__Input,
  ctx: Ctx,
) {
  ctx.session.authorize()

  if (process.env.parentModel) {
    // Don't allow updating
    delete (data as any).__parentModel__
  }

  const __modelName__ = await db.__modelName__.update({where, data})

  return __modelName__
}
