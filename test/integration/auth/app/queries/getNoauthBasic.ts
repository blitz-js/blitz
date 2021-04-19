import {Ctx} from "blitz"
import db from "db.js"

export default async function getNoauthBasic(_, ctx: Ctx) {
  return "noauth-basic-result"
}
