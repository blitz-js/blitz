import { resolver } from "@blitzjs/rpc"
import db from "db"
import {z} from "zod"

const __Name__ = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(__Name__),
  resolver.authorize(),
  async (input) => {

    // Do your stuff :)

  },
)