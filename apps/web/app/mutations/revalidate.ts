import {resolver} from "@blitzjs/rpc"
import {Routes} from "@blitzjs/next"

const revalidateFn = resolver.pipe(async (_, ctx) => {
  await ctx.revalidatePage(Routes.PageWithGsp())

  return true
})

export default revalidateFn
