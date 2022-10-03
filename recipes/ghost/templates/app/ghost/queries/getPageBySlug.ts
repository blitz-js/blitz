import {Ctx} from "blitz"
import * as z from "zod"
import {BrowseParams} from "../validations"

const GetPageBySlug = z.object({
  slug: z.string(),
  options: BrowseParams.optional(),
})

export default async function getPageBySlug(
  {slug, options}: z.infer<typeof GetPageBySlug>,
  ctx: Ctx,
) {
  const page = await ctx.ghost.pages.read(
    {
      slug,
    },
    options,
  )
  return page
}
