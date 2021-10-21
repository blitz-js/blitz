import {Ctx} from "blitz"
import * as z from "zod"
import {BrowseParams} from "../validations"

const GetPostBySlug = z.object({
  slug: z.string(),
  options: BrowseParams.optional(),
})

export default async function getPostBySlug(
  {slug, options}: z.infer<typeof GetPostBySlug>,
  ctx: Ctx,
) {
  const post = await ctx.ghost.posts.read(
    {
      slug,
    },
    options,
  )
  return post
}
