import db, {FindMany__ModelName__Args} from 'db'

export default async function get__ModelNames__(args: FindMany__ModelName__Args) {
  const __modelNames__ = await db.__modelName__.findMany(args)

  return __modelNames__
}
