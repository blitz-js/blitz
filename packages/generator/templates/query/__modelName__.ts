import {SessionContext} from "blitz"
import db from "db"

export default async function __modelName__(__, ctx: {session?: SessionContext} = {}) {
  return ctx
}
