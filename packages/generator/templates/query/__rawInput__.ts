import {Ctx} from "blitz"
import db from "db"

export default async function __rawInput__(input, ctx: Ctx) {
  ctx.session.authorize()

  // Do your stuff :)

  return
}
