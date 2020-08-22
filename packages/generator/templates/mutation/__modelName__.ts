import {SessionContext} from "blitz"
import db from "db"

export default async function __modelName__(
  __: unknown,
  ctx: {session?: SessionContext} = {},
) {
  ctx.session!.authorize()
}
