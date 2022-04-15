import {Ctx} from "blitz"
import {z} from "zod"

const __Name__ = z.object({
  id: z.number(),
})

export default async function __Name__(input, ctx: Ctx) {
  __Name__.parse(input)
  ctx.session.$isAuthorized()


}
