import {resolver} from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(resolver.authorize(), async () => {
  const users = await db.user.findMany()

  return users
})
