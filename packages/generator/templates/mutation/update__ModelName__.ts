import db, {__ModelName__UpdateArgs} from 'db'

export default async function update__ModelName__(args: __ModelName__UpdateArgs) {
  // Don't allow updating ID
  delete args.data.id

  const __modelName__ = await db.__modelName__.update(args)

  return __modelName__
}
