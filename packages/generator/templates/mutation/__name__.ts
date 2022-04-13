import { Ctx } from "blitz"
import {z} from "zod"

const __Name__Input = z.object({
  id: z.number(),
})


export default async function __Name__(input, ctx: Ctx) {
  __Name__Input.parse(input)
  ctx.session.$isAuthorized()

}
