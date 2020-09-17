import {SessionContext} from "blitz"
import db from "db"

export default async function __rawInput__(__, ctx: {session?: SessionContext} = {}) {
  return ctx
}
