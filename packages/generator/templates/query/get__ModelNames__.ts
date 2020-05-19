import db, {FindMany__ModelName__Args} from 'db'

type Get__ModelNames__Input = {
  where: FindMany__ModelName__Args['where']
  include: FindMany__ModelName__Args['include']
  orderBy: FindMany__ModelName__Args['orderBy']
  skip: FindMany__ModelName__Args['skip']
  after: FindMany__ModelName__Args['after']
  before: FindMany__ModelName__Args['before']
  first: FindMany__ModelName__Args['first']
  last: FindMany__ModelName__Args['last']
}

export default async function get__ModelNames__({
  where,
  include,
  orderBy,
  skip,
  after,
  before,
  first,
  last,
}: Get__ModelNames__Input) {
  const __modelNames__ = await db.__modelName__.findMany({
    where,
    include,
    orderBy,
    skip,
    after,
    before,
    first,
    last,
  })

  return __modelNames__
}
