import db, {__ModelName__UpdateArgs} from "db"

if (process.env.parentModel) {
  type Update__ModelName__Input = {
    where: __ModelName__UpdateArgs["where"]
    data: Omit<__ModelName__UpdateArgs["data"], "__parentModel__">
    __parentModelId__: number
  }
} else {
  type Update__ModelName__Input = {
    where: __ModelName__UpdateArgs["where"]
    data: __ModelName__UpdateArgs["data"]
  }
}

export default async function update__ModelName__(
  {where, data}: Update__ModelName__Input,
  ctx: Record<any, any> = {},
) {
  // Don't allow updating
  delete data.id
  if (process.env.parentModel) {
    delete (data as any).__parentModel__
  }

  const __modelName__ = await db.__modelName__.update({where, data})

  return __modelName__
}
