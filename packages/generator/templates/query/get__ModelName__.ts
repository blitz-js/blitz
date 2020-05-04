import db, {FindOne__ModelName__Args} from 'db'

export default async function get__ModelName__(args: FindOne__ModelName__Args) {
  const __modelName__ = await db.__modelName__.findOne(args)

  return __modelName__
}
