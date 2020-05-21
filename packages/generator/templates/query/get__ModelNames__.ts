import db, {FindMany__ModelName__Args} from 'db'

type Get__ModelNames__Input = {
  where: FindMany__ModelName__Args['where']
  orderBy?: FindMany__ModelName__Args['orderBy']
  skip?: FindMany__ModelName__Args['skip']
  first?: FindMany__ModelName__Args['first']
  last?: FindMany__ModelName__Args['last']
  after?: FindMany__ModelName__Args['after']
  before?: FindMany__ModelName__Args['before']
}

export default async function get__ModelNames__({
  where,
  orderBy,
  skip,
  first,
  last,
  after,
  before,
}: Get__ModelNames__Input) {
  const __modelNames__ = await db.__modelName__.findMany({
    where,
    orderBy,
    skip,
    first,
    last,
    after,
    before,
  })

  return __modelNames__
}
