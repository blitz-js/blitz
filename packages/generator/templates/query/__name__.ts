import {resolver} from "blitz"
import db from "db"
import * as z from "zod"

const __Name__ = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(__Name__),
  resolver.authorize(),
  async (input) => {

    // Do your stuff :)

  }
)
