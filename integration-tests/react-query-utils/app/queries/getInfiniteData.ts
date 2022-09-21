import {resolver} from "@blitzjs/rpc"

export default resolver.pipe(async (input, ctx) => {
  await new Promise((r) => setTimeout(r, 4000))
  return "thanks"
})
