import {Ctx} from "blitz"
import * as z from "zod"
import {BrowseParams} from "../validations"

const GetAuthorBySlug = z.object({
  slug: z.string(),
  options: BrowseParams.optional(),
})

export default async function getAuthorBySlug(
  {slug, options}: z.infer<typeof GetAuthorBySlug>,
  ctx: Ctx,
) {
  const author = await ctx.ghost.authors.read(
    {
      slug,
    },
    options,
  )
  return author
}
