import db, {FindOne__ModelName__Args} from 'db'

type Get__ModelName__Input = {
  where: FindOne__ModelName__Args['where']
  include?: FindOne__ModelName__Args['include']
}

export default async function get__ModelName__({where, include}: Get__ModelName__Input) {
  const __modelName__ = await db.__modelName__.findOne({where, include})

  return __modelName__
}
