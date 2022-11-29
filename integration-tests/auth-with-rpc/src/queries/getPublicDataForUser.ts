import {Ctx} from "blitz"
import db from "../../db"

export default async function getPublicDataForUser({userId}: any, ctx: Ctx) {
  return await db.session.findMany({
    where: {
      userId: userId,
    },
    select: {
      publicData: true,
    },
  })
}
