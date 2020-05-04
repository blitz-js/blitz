import db, {__ModelName__CreateArgs} from 'db'

export default async function create__ModelName__(args: __ModelName__CreateArgs) {
  const __modelName__ = await db.__modelName__.create(args)

  return __modelName__
}
