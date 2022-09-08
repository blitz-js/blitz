import {Ctx} from "blitz"
import * as z from "zod"
import {BrowseParams} from "../validations"

const GetTagBySlug = z.object({
  slug: z.string(),
  options: BrowseParams.optional(),
})

export default async function getTagBySlug(
  {slug, options}: z.infer<typeof GetTagBySlug>,
  ctx: Ctx,
) {
  const tag = await ctx.ghost.tags.read(
    {
      slug,
    },
    options,
  )
  return tag
}
