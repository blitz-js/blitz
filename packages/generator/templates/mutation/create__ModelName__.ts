import {SessionContext} from "blitz"
import db, {__ModelName__CreateArgs} from "db"

if (process.env.parentModel) {
  type Create__ModelName__Input = {
    data: Omit<__ModelName__CreateArgs["data"], "__parentModel__">
    __parentModelId__: number
  }
} else {
  type Create__ModelName__Input = {
    data: __ModelName__CreateArgs["data"]
  }
}

if (process.env.parentModel) {
  export default async function create__ModelName__(
    {data, __parentModelId__}: Create__ModelName__Input,
    ctx: {session?: SessionContext} = {},
  ) {
    ctx.session!.authorize()

    const __modelName__ = await db.__modelName__.create({
      data: {...data, __parentModel__: {connect: {id: __parentModelId__}}},
    })

    return __modelName__
  }
} else {
  export default async function create__ModelName__(
    {data}: Create__ModelName__Input,
    ctx: {session?: SessionContext} = {},
  ) {
    ctx.session!.authorize()

    const __modelName__ = await db.__modelName__.create({data})

    return __modelName__
  }
}
