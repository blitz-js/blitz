import {Ctx} from "blitz"
// import db from "db.js"

export default async function getAuthenticatedBasic(_: any, ctx: Ctx) {
  ctx.session.$authorize()
  return "authenticated-basic-result"
}
