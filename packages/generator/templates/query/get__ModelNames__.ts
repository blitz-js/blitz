import db, {FindMany__ModelName__Args} from 'db'

type Get__ModelNames__Input = {
  where?: FindMany__ModelName__Args['where']
  orderBy?: FindMany__ModelName__Args['orderBy']
  cursor?: FindMany__ModelName__Args['cursor']
  take?: FindMany__ModelName__Args['take']
  skip?: FindMany__ModelName__Args['skip']
  // Only available if a model relationship exists
  // include?: FindMany__ModelName__Args['include']
}

export default async function get__ModelNames__(
  {where, orderBy, cursor, take, skip}: Get__ModelNames__Input,
  ctx?: unknown,
) {
  const __modelNames__ = await db.__modelName__.findMany({
    where,
    orderBy,
    cursor,
    take,
    skip,
  })

  return __modelNames__
}
