import db, {__ModelName__DeleteArgs} from 'db'

export default async function delete__ModelName__(args: __ModelName__DeleteArgs) {
  const __modelName__ = await db.__modelName__.delete(args)

  return __modelName__
}
