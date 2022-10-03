import {Ctx} from "blitz"
import * as z from "zod"
import {BrowseParams} from "../validations"

const GetPageById = z.object({
  id: z.string(),
  options: BrowseParams.optional(),
})

export default async function getPageById({id, options}: z.infer<typeof GetPageById>, ctx: Ctx) {
  const page = await ctx.ghost.pages.read(
    {
      id,
    },
    options,
  )
  return page
}
