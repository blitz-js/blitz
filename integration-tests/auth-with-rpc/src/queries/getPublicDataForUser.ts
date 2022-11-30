import {Ctx} from "blitz"
import db from "../../db"

export default async function getPublicDataForUser({userId}: any, ctx: Ctx) {
  const role = ctx.session.role
  return {
    userId,
    role,
  }
}
