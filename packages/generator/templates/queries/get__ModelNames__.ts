import {protect} from "blitz"
import db, {FindMany__ModelName__Args} from "db"

type Get__ModelNames__Input = Pick<FindMany__ModelName__Args, "orderBy" | "skip" | "take">

export default protect<Get__ModelNames__Input>({}, async function get__ModelNames__(
  {orderBy, skip = 0, take},
  {session},
) {
  const __modelNames__ = await db.__modelName__.findMany({
    where: {
      // add your selection here
    },
    orderBy,
    take,
    skip,
  })

  const count = await db.__modelName__.count()
  const hasMore = typeof take === "number" ? skip + take < count : false
  const nextPage = hasMore ? {take, skip: skip + take!} : null

  return {
    __modelNames__,
    nextPage,
    hasMore,
    count,
  }
})
